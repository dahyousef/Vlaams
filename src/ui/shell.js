/* Shell : routage, chrome, panneaux, et l'unique écouteur d'événements délégué.
   Les écrans sont de simples objets avec render(), et éventuellement click(), key(), input(). */
NL.ui = (function () {
  'use strict';
  const U = NL.util, esc = U.esc, t = NL.t;
  let root = null;
  let route = 'vandaag', arg = null, sheet = null, toastMsg = null, toastT = null;

  const I = {
    flame: '<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.5c2.2 3.4 1.2 5.1.2 6.3-.9 1.1-2 2-2 3.6a3.1 3.1 0 0 0 1.5 2.7c-.4-1.6.3-2.9 1.4-3.7.2 1.8 1.3 2.3 2.4 3.4a4.6 4.6 0 0 1 1.4 3.3A5.3 5.3 0 0 1 12 21.5a6 6 0 0 1-6-6c0-4.6 4.2-5.9 6-13Z"/></svg>',
    bolt: '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 2 4 13.2h5.7L8.9 22 20 10.4h-6.2L13.5 2Z"/></svg>',
    due: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3 2" stroke-linecap="round"/></svg>',
    x: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    back: '<svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 5 8 12l6.5 7"/></svg>',
    gear: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3.2"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/></svg>'
  };

  const NAV_ICON = {
    vandaag: '<path d="M4 6.5h16M4 12h16M4 17.5h10"/>',
    leerpad: '<path d="M6 20V8.5a3.5 3.5 0 0 1 7 0v7a3.5 3.5 0 0 0 7 0V4"/>',
    praten: '<path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-5 3.5V6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5Z"/>',
    luisteren: '<path d="M4 13.5a8 8 0 0 1 16 0M4 13.5v3a2.5 2.5 0 0 0 5 0v-3M20 13.5v3a2.5 2.5 0 0 1-5 0v-3"/>',
    meer: '<circle cx="6" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18" cy="12" r="1.4"/>'
  };
  const UNDER_MEER = ['woorden', 'spiek', 'register', 'klanken', 'doctor', 'dehet'];
  const FULLSCREEN = { sessie: 1, scenario: 1, placement: 1, doctor: 1, compte: 1 };

  function go(to, a) {
    if (route === 'sessie' && to !== 'sessie' && NL.screens.sessie.active()) { sheet = 'quit-session'; return render(); }
    NL.speech.stop(); NL.speech.abort();
    route = to; arg = a == null ? null : a; sheet = null;
    try { location.hash = '#' + to + (a ? '/' + a : ''); } catch (e) {}
    render();
    const b = document.querySelector('.screen');
    if (b) b.scrollTop = 0;
  }

  function fromHash() {
    const h = (location.hash || '').replace(/^#/, '');
    if (!h) return null;
    const [r, a] = h.split('/');
    return NL.screens[r] ? { r, a: a || null } : null;
  }

  /* The topbar carries identity and one way out. The scoreboard lives on
     Aujourd'hui and Plus, where you go when you want to look at it. */
  function topbar() {
    return '<header class="topbar"><div class="bar-in">' +
      '<div class="brand"><span class="mark">' +
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 18.5c3.5-1.5 4.5-5 4.5-8.5S8 4.5 8 4.5"/><path d="M19 18.5c-3.5-1.5-4.5-5-4.5-8.5S16 4.5 16 4.5"/><path d="M4.5 11.5h15"/></svg></span>' +
      '<span class="brand-txt"><b>Vlaams</b><i>' + esc(NL.content.fill(t.brandSub)) + '</i></span></div>' +
      '<button class="iconbtn gear" data-sheet="instellingen" aria-label="' + t.setTitle + '">' + I.gear + syncDot() + '</button>' +
      '</div></header>';
  }

  /* Un point discret sur l'engrenage quand la progression n'est pas à l'abri. */
  function syncDot() {
    if (!NL.sync.enabled) return '';
    const st = NL.sync.status();
    if (!st.user) return '<i class="sdot warn"></i>';
    if (st.state === 'error') return '<i class="sdot bad"></i>';
    return '';
  }

  function nav() {
    return '<nav class="nav"><div class="nav-in">' + t.nav.map(n => {
      const on = route === n.id || (n.id === 'meer' && UNDER_MEER.indexOf(route) >= 0);
      return '<button class="nav-btn' + (on ? ' on' : '') + '" data-go="' + n.id + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + NAV_ICON[n.id] + '</svg>' +
        '<span class="nav-fr">' + n.fr + '</span><span class="nav-nl">' + n.nl + '</span></button>';
    }).join('') + '</div></nav>';
  }

  function render() {
    applyTheme();
    const S = NL.screens[route] || NL.screens.vandaag;
    const full = !!FULLSCREEN[route];
    const html = full
      ? '<div class="screen full">' + S.render(arg) + '</div>'
      : topbar() + '<main class="screen">' + S.render(arg) + '</main>' + nav();
    root.innerHTML = html + (sheet ? sheetHtml() : '') + (toastMsg ? '<div class="toast">' + esc(toastMsg) + '</div>' : '');
    if (S.after) S.after(arg);
  }

  /* ---------------- panneaux ---------------- */
  function card(title, body, actions) {
    return '<div class="sheet" data-backdrop="1"><div class="sheet-card" role="dialog" aria-modal="true">' +
      '<h3>' + title + '</h3>' + (body || '') + '<div class="sheet-actions">' + actions + '</div></div></div>';
  }

  function sheetHtml() {
    const m = NL.state.meta();
    if (sheet === 'quit-session') {
      return card(t.quitTitle, '<p>' + t.quitBody + '</p>',
        '<button class="btn btn-bad wide" data-quit-yes="1">' + t.quitYes + '</button>' +
        '<button class="btn btn-ghost wide" data-close="1">' + t.quitNo + '</button>');
    }
    if (sheet === 'instellingen') {
      const v = NL.speech.voiceInfo();
      const mic = NL.speech.listenBlocked();
      return card(t.setTitle,
        '<div class="set-block"><h4>' + t.setTheme + '</h4><div class="seg">' +
        [['system', t.setSystem], ['light', t.setLight], ['dark', t.setDark]].map(([k, label]) =>
          '<button class="seg-btn' + (m.theme === k ? ' on' : '') + '" data-theme="' + k + '">' + label + '</button>').join('') +
        '</div></div>' +

        '<div class="set-block"><h4>' + t.setPace + '</h4><div class="seg">' +
        ['calme', 'normal', 'intensif'].map(k =>
          '<button class="seg-btn' + ((m.pace || 'normal') === k ? ' on' : '') + '" data-pace="' + k + '">' +
          t['pace' + k.charAt(0).toUpperCase() + k.slice(1)] + '</button>').join('') + '</div>' +
        '<p class="set-note muted">' + t.paceNote(NL.srs.pace()) + '</p>' +
        '<p class="set-note muted">' + t.paceWhy + '</p></div>' +

        '<div class="set-block"><h4>' + t.setPractice + '</h4>' +
        toggle('showFlemish', t.setFlemish, m.showFlemish !== false) +
        toggle('autoplay', t.setAutoplay, m.autoplay !== false) +
        toggle('sfx', t.setSfx, m.sfx !== false) + '</div>' +

        '<div class="set-block"><h4>' + t.setMine + '</h4>' +
        '<p class="set-note muted">' + t.setMineNote + '</p>' +
        [['learnerName', t.setName, NL.content.DEFAULTS.naam],
         ['town', t.setTown, NL.content.DEFAULTS.stad],
         ['company', t.setCompany, NL.content.DEFAULTS.bedrijf]].map(([k, label, ph]) =>
          '<label class="mine"><span>' + label + '</span>' +
          '<input class="textin" data-mine="' + k + '" value="' + esc(m[k] || '') + '" placeholder="' + esc(ph) + '" spellcheck="false"></label>').join('') +
        '</div>' +

        (NL.sync.enabled ? accountBlock() : '') +

        '<div class="set-block"><h4>' + t.setVoice + '</h4>' +
        '<p class="set-note ' + (v.quality === 'be' ? 'good' : 'warn') + '">' + esc(v.note) +
        (v.name ? ' <span class="muted">(' + esc(v.name) + ')</span>' : '') + '</p>' +
        '<p class="set-note ' + (mic ? 'warn' : 'good') + '">' + esc(micLine(mic)) + '</p>' +
        '<button class="btn btn-blue wide" data-go="doctor">' + t.setDoctor + '</button></div>' +

        '<div class="set-block"><h4>' + t.setExport + '</h4>' +
        '<p class="set-note muted">' + t.setStorage + ' ' + NL.state.storage + '. Une sauvegarde te suit d’un navigateur à l’autre — indispensable avant de passer du lien claude.ai à une adresse à toi.</p>' +
        '<div class="row"><button class="btn" data-export="1">' + t.setExport + '</button>' +
        '<button class="btn" data-import="1">' + t.setImport + '</button></div>' +
        '<div class="row"><button class="btn btn-ghost" data-act="copy-show">Copier le texte</button>' +
        '<button class="btn btn-ghost" data-act="paste-show">Coller une sauvegarde</button></div>' +
        '<input type="file" id="import-file" accept="application/json" hidden></div>',

        '<button class="btn btn-ghost wide" data-close="1">' + t.close + '</button>' +
        '<button class="btn btn-ghost wide danger" data-reset="1">' + t.setReset + '</button>');
    }
    if (sheet === 'reset-confirm') {
      return card(t.setResetTitle, '<p>' + t.setResetBody + '</p>',
        '<button class="btn btn-bad wide" data-reset-yes="1">' + t.setResetYes + '</button>' +
        '<button class="btn btn-ghost wide" data-close="1">' + t.cancel + '</button>');
    }
    if (sheet && sheet.custom) return sheet.custom;
    return '';
  }

  function accountBlock() {
    const st = NL.sync.status();
    if (!st.user) {
      return '<div class="set-block"><h4>' + t.accEyebrow + '</h4>' +
        '<p class="set-note warn">' + t.syncLocalOnly + '</p>' +
        '<button class="btn btn-blue wide" data-go="compte">' + t.accSignInCta + '</button></div>';
    }
    const line = st.state === 'syncing' ? t.syncBusy
      : st.state === 'offline' ? t.syncOffline(st.pending)
      : st.state === 'error' ? t.syncError('')
      : st.pending ? t.syncPending(st.pending)
      : t.syncOk(st.lastSync ? t.syncAgo(Date.now() - st.lastSync) : t.syncNever);
    return '<div class="set-block"><h4>' + t.accEyebrow + '</h4>' +
      '<p class="set-note muted">' + esc(st.user.email || '') + '</p>' +
      '<p class="set-note ' + (st.state === 'error' ? 'warn' : 'good') + '">' + esc(line) + '</p>' +
      '<button class="btn btn-blue wide" data-go="compte">' + t.accManage + '</button></div>';
  }

  const micLine = kind => kind === 'browser' ? t.micNoBrowser
    : kind === 'offline' ? t.micOffline
      : 'Reconnaissance vocale active (nl-BE).';

  const toggle = (k, label, on) =>
    '<label class="tog"><span>' + label + '</span>' +
    '<button class="switch' + (on ? ' on' : '') + '" data-toggle="' + k + '" role="switch" aria-checked="' + !!on + '"><span></span></button></label>';

  function openSheet(s) { sheet = s; render(); }
  function closeSheet() { sheet = null; render(); }

  function toast(msg) {
    toastMsg = msg; render();
    clearTimeout(toastT);
    toastT = setTimeout(() => { toastMsg = null; render(); }, 2400);
  }

  function applyTheme() {
    const th = NL.state.meta().theme;
    const r = document.documentElement;
    if (th === 'system') r.removeAttribute('data-theme'); else r.setAttribute('data-theme', th);
  }

  /* ---------------- sauvegarde ---------------- */
  /* Three routes out, because this page runs in three different places.
     Inside the claude.ai viewer a plain <a download> is inert, so the host's
     save capability is tried first; on a hosted or local copy that capability
     does not exist and the anchor works. Copy-paste always works. */
  const backupName = () => 'vlaams-' + U.dayKey() + '.json';
  const backupText = () => JSON.stringify(NL.state.exportAll(), null, 1);

  function anchorDownload(text) {
    const blob = new Blob([text], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = backupName();
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  function doExport() {
    const text = backupText();
    const host = window.claude && typeof window.claude.use === 'function' ? window.claude.use('downloads') : null;
    if (!host) { try { anchorDownload(text); toast(t.exported); } catch (e) { openCopy(text); } return; }
    Promise.resolve(host).then(dl => {
      if (!dl) { try { anchorDownload(text); toast(t.exported); } catch (e) { openCopy(text); } return; }
      dl.save({ filename: backupName(), data: text })
        .then(() => toast(t.exported))
        .catch(err => { if (!err || err.code !== 'declined') openCopy(text); });
    }).catch(() => openCopy(text));
  }

  function openCopy(text) {
    openSheet({ custom: card(t.setExport,
      '<p>Copie ce texte et garde-le. C’est toute ta progression : colle-le dans « ' + t.setImport + ' » sur l’autre appareil.</p>' +
      '<textarea class="backup-box" id="backup-out" readonly spellcheck="false">' + esc(text) + '</textarea>',
      '<button class="btn btn-blue wide" data-act="copy-backup">Copier</button>' +
      '<button class="btn btn-ghost wide" data-close="1">' + t.close + '</button>') });
  }

  function openPaste() {
    openSheet({ custom: card(t.setImport,
      '<p>Colle ici la sauvegarde exportée depuis l’autre appareil.</p>' +
      '<textarea class="backup-box" id="backup-in" spellcheck="false" placeholder="{ &quot;app&quot;: &quot;vlaams-onderweg&quot; … }"></textarea>',
      '<button class="btn btn-good wide" data-act="paste-backup">' + t.setImport + '</button>' +
      '<button class="btn btn-ghost wide" data-close="1">' + t.cancel + '</button>') });
  }

  function restore(raw) {
    let data = null;
    try { data = JSON.parse(raw); } catch (e) { /* reported below */ }
    if (NL.state.importAll(data)) {
      NL.content.refresh(); sheet = null;
      if (NL.sync.user) { NL.sync.queueAll(); NL.sync.flush(); }
      render(); toast(t.imported);
    }
    else toast(t.importFailed);
  }

  function doImport() {
    const inp = document.getElementById('import-file');
    if (!inp) return openPaste();
    inp.onchange = () => {
      const f = inp.files && inp.files[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = () => restore(r.result);
      r.readAsText(f);
    };
    try { inp.click(); } catch (e) { openPaste(); }
  }

  /* ---------------- événements ---------------- */
  function bind(el) {
    root = el;

    root.addEventListener('click', e => {
      const hit = e.target.closest('[data-say],[data-go],[data-sheet],[data-close],[data-backdrop],[data-theme],' +
        '[data-toggle],[data-reset],[data-reset-yes],[data-quit-yes],[data-export],[data-import],[data-pace],[data-act]');
      const S = NL.screens[route];

      if (hit) {
        const d = hit.dataset;
        if (d.say !== undefined) { NL.speech.say(d.say, { rate: d.slow ? 0.62 : 1 }); return; }
        if (d.backdrop !== undefined && hit === e.target) { closeSheet(); return; }
        if (d.close !== undefined) { closeSheet(); return; }
        if (d.go) { go(d.go); return; }
        if (d.sheet) { openSheet(d.sheet); return; }
        if (d.theme) { NL.state.setMeta({ theme: d.theme }); render(); return; }
        if (d.pace) { NL.state.setMeta({ pace: d.pace }); render(); return; }
        if (d.toggle) { const m = NL.state.meta(); NL.state.setMeta({ [d.toggle]: m[d.toggle] === false }); render(); return; }
        if (d.export !== undefined) { doExport(); return; }
        if (d.import !== undefined) { doImport(); return; }
        if (d.act === 'copy-show') { openCopy(backupText()); return; }
        if (d.act === 'paste-show') { openPaste(); return; }
        if (d.act === 'copy-backup') {
          const box = document.getElementById('backup-out');
          if (box) {
            box.select();
            const ok = navigator.clipboard
              ? navigator.clipboard.writeText(box.value).then(() => true).catch(() => false)
              : Promise.resolve(document.execCommand && document.execCommand('copy'));
            Promise.resolve(ok).then(good => toast(good ? 'Copié.' : 'Sélectionne le texte et copie-le à la main.'));
          }
          return;
        }
        if (d.act === 'paste-backup') {
          const box = document.getElementById('backup-in');
          if (box) restore(box.value.trim());
          return;
        }
        if (d.reset !== undefined) { sheet = 'reset-confirm'; render(); return; }
        if (d.resetYes !== undefined) {
          Promise.resolve(NL.state.clearAll()).then(() => {
            NL.content.refresh(); sheet = null; route = 'vandaag'; render(); toast(t.wiped);
          });
          return;
        }
        if (d.quitYes !== undefined) { NL.screens.sessie.abandon(); sheet = null; go('vandaag'); return; }
      }

      if (S && S.click) {
        const target = e.target.closest('[data-act],[data-opt],[data-pick],[data-unpick],[data-match],[data-ins],' +
          '[data-mic],[data-self],[data-check],[data-next],[data-skip],[data-start],[data-unit],[data-scn],' +
          '[data-clip],[data-sheetid],[data-choice],[data-step],[data-del],[data-add],[data-rec]');
        if (target) S.click(target, target.dataset, e);
      }
    });

    root.addEventListener('change', e => {
      if (e.target.matches('[data-goal]')) { NL.state.setMeta({ dailyGoal: +e.target.value }); return; }
      const S = NL.screens[route];
      if (S && S.change) S.change(e.target, e);
    });

    root.addEventListener('input', e => {
      if (e.target && e.target.dataset && e.target.dataset.mine) {
        NL.state.setMeta({ [e.target.dataset.mine]: e.target.value.trim() });
        NL.content.refresh();          // the whole course re-reads its placeholders
        return;
      }
      const S = NL.screens[route];
      if (S && S.input) S.input(e.target, e);
    });

    document.addEventListener('keydown', e => {
      if (sheet) { if (e.key === 'Escape') closeSheet(); return; }
      const S = NL.screens[route];
      if (S && S.key) S.key(e);
    });

    window.addEventListener('hashchange', () => {
      const h = fromHash();
      if (h && h.r !== route) { route = h.r; arg = h.a; render(); }
    });
  }

  /* Appelé par la synchro quand une connexion aboutit — au retour du lien
     magique par exemple. */
  function onAuth() { if (route === 'compte') go('vandaag'); else render(); }

  return {
    bind, render, go, toast, openSheet, closeSheet, I, card, onAuth,
    get route() { return route; },
    boot() { const h = fromHash(); if (h) { route = h.r; arg = h.a; } render(); }
  };
})();
NL.screens = NL.screens || {};
