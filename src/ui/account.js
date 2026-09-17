/* Compte : connexion par lien magique (ou code), et état de la synchro. */
NL.screens.compte = (function () {
  'use strict';
  const esc = NL.util.esc, t = NL.t;
  const SKIP = 'vlaams/noaccount';
  let step = 'email', email = '', msg = '', busy = false;

  const skipped = () => { try { return localStorage.getItem(SKIP) === '1'; } catch (e) { return false; } };
  const setSkipped = v => { try { v ? localStorage.setItem(SKIP, '1') : localStorage.removeItem(SKIP); } catch (e) {} };

  function when(ts) {
    if (!ts) return t.syncNever;
    const s = Math.round((Date.now() - ts) / 1000);
    return s < 60 ? t.syncJustNow : t.syncAgo(Date.now() - ts);
  }

  function statusLine(st) {
    if (st.state === 'syncing') return t.syncBusy;
    if (st.state === 'offline') return t.syncOffline(st.pending);
    if (st.state === 'error') return t.syncError(st.lastError || '');
    return st.pending ? t.syncPending(st.pending) : t.syncOk(when(st.lastSync));
  }

  function render() {
    const st = NL.sync.status();
    let body;

    if (st.user) {
      body = '<span class="eyebrow">' + t.accEyebrow + '</span>' +
        '<h1>' + t.accSignedIn + '</h1>' +
        '<p class="acc-mail">' + esc(st.user.email || '') + '</p>' +
        '<p class="acc-status ' + st.state + '">' + esc(statusLine(st)) + '</p>' +
        '<div class="acc-actions">' +
        '<button class="btn btn-blue wide" data-act="sync"' + (busy ? ' disabled' : '') + '>' + t.syncNow + '</button>' +
        '<button class="btn btn-ghost wide" data-act="home">' + t.accBack + '</button>' +
        '<button class="btn btn-ghost wide danger" data-act="signout">' + t.accSignOut + '</button>' +
        '</div><p class="acc-note">' + t.accSignOutNote + '</p>';
    } else if (step === 'sent') {
      body = '<span class="eyebrow">' + t.accEyebrow + '</span>' +
        '<h1>' + t.accCheckMail + '</h1>' +
        '<p>' + t.accSentTo(esc(email)) + '</p>' +
        '<label class="acc-field"><span>' + t.accCode + '</span>' +
        '<input class="textin acc-code" id="acc-code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="123456"></label>' +
        (msg ? '<p class="acc-err">' + esc(msg) + '</p>' : '') +
        '<div class="acc-actions">' +
        '<button class="btn btn-primary wide" data-act="verify"' + (busy ? ' disabled' : '') + '>' + t.accVerify + '</button>' +
        '<button class="btn btn-ghost wide" data-act="resend"' + (busy ? ' disabled' : '') + '>' + t.accResend + '</button>' +
        '<button class="btn btn-ghost wide" data-act="change">' + t.accChange + '</button>' +
        '</div>';
    } else {
      body = '<span class="eyebrow">' + t.accEyebrow + '</span>' +
        '<h1>' + t.accTitle + '</h1>' +
        '<p>' + t.accBody + '</p>' +
        '<label class="acc-field"><span>' + t.accEmail + '</span>' +
        '<input class="textin" id="acc-email" type="email" autocomplete="email" value="' + esc(email) + '" placeholder="prenom@exemple.be"></label>' +
        (msg ? '<p class="acc-err">' + esc(msg) + '</p>' : '') +
        '<div class="acc-actions">' +
        '<button class="btn btn-primary wide" data-act="send"' + (busy ? ' disabled' : '') + '>' + (busy ? t.accSending : t.accSend) + '</button>' +
        '<button class="btn btn-ghost wide" data-act="skip">' + t.accSkip + '</button>' +
        '</div><p class="acc-note">' + t.accSkipNote + '</p>';
    }

    return '<div class="lesson"><div class="lesson-body"><div class="stage acc">' +
      '<div class="acc-mark"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M5 18.5c3.5-1.5 4.5-5 4.5-8.5S8 4.5 8 4.5"/><path d="M19 18.5c-3.5-1.5-4.5-5-4.5-8.5S16 4.5 16 4.5"/><path d="M4.5 11.5h15"/></svg></div>' +
      body + '</div></div></div>';
  }

  const val = id => ((document.getElementById(id) || {}).value || '').trim();
  const looksLikeEmail = s => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  async function send() {
    email = val('acc-email') || email;
    if (!looksLikeEmail(email)) { msg = t.accBadEmail; NL.ui.render(); return; }
    busy = true; msg = ''; NL.ui.render();
    const r = await NL.sync.signIn(email);
    busy = false;
    if (r.error) msg = t.accFailed(r.error); else step = 'sent';
    NL.ui.render();
  }

  async function verify() {
    const code = val('acc-code');
    if (!/^\d{6,10}$/.test(code)) { msg = t.accBadCode; NL.ui.render(); return; }
    busy = true; msg = ''; NL.ui.render();
    const r = await NL.sync.verifyCode(email, code);
    busy = false;
    if (r.error) { msg = t.accFailed(r.error); NL.ui.render(); return; }
    step = 'email'; setSkipped(false);
    NL.ui.go('vandaag');
  }

  return {
    render,
    skipped,
    click(el, d) {
      if (d.act === 'send' || d.act === 'resend') return send();
      if (d.act === 'verify') return verify();
      if (d.act === 'change') { step = 'email'; msg = ''; NL.ui.render(); return; }
      if (d.act === 'skip') { setSkipped(true); NL.ui.go('vandaag'); return; }
      if (d.act === 'home') { NL.ui.go('vandaag'); return; }
      if (d.act === 'sync') {
        busy = true; NL.ui.render();
        NL.sync.pull().then(() => NL.sync.flush()).then(() => { busy = false; NL.ui.render(); });
        return;
      }
      if (d.act === 'signout') {
        NL.sync.signOut().then(() => { step = 'email'; email = ''; setSkipped(false); NL.ui.go('compte'); });
      }
    },
    key(e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      if (NL.sync.user) return;
      if (step === 'sent') verify(); else send();
    }
  };
})();
