/* Le faux Supabase, en UN exemplaire : un serveur en mémoire, et le client que l'app crée
   sur lui. Il y en avait deux : celui de test/sync.js, et un client réduit dans
   test/lang.js qui rendait toujours la même session et jamais une ligne.

     const { server, fakeLib, rowsFor } = require('./lib/supabase').fakeSupabase();
     browser.open({ …, store: dev.store, supabase: fakeLib(dev) })

   Chaque appel à fakeSupabase() est un serveur neuf. dev.store est le localStorage de
   l'appareil : sa session y vit sous 'sb-session', et la poser avant open() ouvre l'appareil
   déjà connecté. dev.client est le client que l'app a créé : un autre onglet du même
   navigateur qui se connecte, c'est dev.client.auth.verifyOtp(…), qui écrit la session et
   lance SIGNED_IN, comme supabase-js le relaie d'un onglet à l'autre. */
const KEYS = {
  srs_records: ['user_id', 'item_id'], user_meta: ['user_id'],
  custom_words: ['user_id', 'id'], review_log: ['user_id', 't', 'item_id']
};
const keyOf = (t, row) => KEYS[t].map(k => row[k]).join('|');
const clone = v => JSON.parse(JSON.stringify(v));

function fakeSupabase() {
  /* rls : chaque requête ne voit que les lignes de sa session. L'éteindre joue une
     politique tombée ou assouplie : un effacement doit alors se borner lui-même.
     failNext : le nom d'une table dont la prochaine lecture échoue, une fois. */
  const server = { tables: {}, users: {}, down: false, requests: 0, rls: true, failNext: null };
  Object.keys(KEYS).forEach(t => { server.tables[t] = new Map(); });
  const rowsFor = (t, uid) => [...server.tables[t].values()].filter(r => r.user_id === uid);

  function fakeLib(device) {
    return {
      createClient(url, key, opts) {
        const handlers = [];
        const fire = (ev, s) => handlers.forEach(h => h(ev, s));
        const session = () => { const raw = device.store['sb-session']; return raw ? JSON.parse(raw) : null; };
        const uid = () => (session() ? session().user.id : null);

        function query(table) {
          const q = { filters: [], from: 0, to: Infinity };
          const run = () => {
            server.requests++;
            if (server.down) return Promise.resolve({ data: null, error: { message: 'network down' } });
            if (server.failNext === table && !q.del) { server.failNext = null; return Promise.resolve({ data: null, error: { message: 'network down' } }); }
            if (!uid()) return Promise.resolve({ data: [], error: null });     // RLS : rien sans session
            let rows = server.rls ? rowsFor(table, uid()) : [...server.tables[table].values()];
            q.filters.forEach(f => { rows = rows.filter(f); });
            if (q.del) {
              rows.forEach(r => server.tables[table].delete(keyOf(table, r)));
              return Promise.resolve({ error: null });
            }
            return Promise.resolve({ data: clone(rows.slice(q.from, q.to + 1)), error: null });
          };
          const b = {
            select() { return b; },
            eq(col, v) { q.filters.push(r => r[col] === v); return b; },
            gte(col, v) { q.filters.push(r => r[col] >= v); return b; },
            lt(col, v) { q.filters.push(r => r[col] < v); return b; },
            delete() { q.del = true; return b; },
            range(a, z) { q.from = a; q.to = z; return b; },
            then(res, rej) { return run().then(res, rej); },
            upsert(rows, o) {
              server.requests++;
              if (server.down) return Promise.resolve({ error: { message: 'network down' } });
              rows = Array.isArray(rows) ? rows : [rows];
              for (const r of rows) {
                if (r.user_id !== uid()) return Promise.resolve({ error: { message: 'RLS violation' } });
              }
              rows.forEach(r => {
                const k = keyOf(table, r);
                const old = server.tables[table].get(k);
                if (o && o.ignoreDuplicates && old) return;
                if (old && r.updated_at != null && r.updated_at < old.updated_at) return;   // déclencheur keep_newer
                const row = clone(r);
                /* déclencheur keep_reset, qui part après keep_newer : une écriture qui ferait reculer resetAt
                   garde le resetAt et le progress du serveur, et prend le reste. */
                if (old && table === 'user_meta') {
                  const num = v => (typeof v === 'number' ? v : 0);
                  if (num(row.data.resetAt) < num(old.data.resetAt)) {
                    row.data.resetAt = old.data.resetAt;
                    if ('progress' in old.data) row.data.progress = clone(old.data.progress); else delete row.data.progress;
                  }
                }
                server.tables[table].set(k, row);
              });
              return Promise.resolve({ error: null });
            }
          };
          return b;
        }

        device.client = {
          from: query,
          auth: {
            onAuthStateChange(fn) { handlers.push(fn); return { data: { subscription: { unsubscribe() {} } } }; },
            getSession: () => Promise.resolve({ data: { session: session() } }),
            signInWithOtp({ email, options }) {
              device.sentTo = email; device.redirect = options && options.emailRedirectTo;
              return Promise.resolve({ error: null });
            },
            verifyOtp({ email, token, type }) {
              if (type !== 'email' || token !== '123456') return Promise.resolve({ data: {}, error: { message: 'Token has expired or is invalid' } });
              const user = server.users[email] || (server.users[email] = { id: 'uid-' + Object.keys(server.users).length, email });
              const s = { user };
              device.store['sb-session'] = JSON.stringify(s);
              fire('SIGNED_IN', s);
              return Promise.resolve({ data: { user, session: s }, error: null });
            },
            signOut() { delete device.store['sb-session']; fire('SIGNED_OUT', null); return Promise.resolve({ error: null }); }
          }
        };
        return device.client;
      }
    };
  }

  return { server, fakeLib, rowsFor };
}

module.exports = { fakeSupabase, KEYS, keyOf, clone };
