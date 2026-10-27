# Learner pass

Plays the built page the way a learner does, in a real browser: headless Chrome dressed as
Safari on iPhone (390×844, touch, `fr-BE`). Its fake recogniser behaves like Safari's did in
October 2026: interim results only, never marked final, and no end until `stop()`. Speech
synthesis is silent; each line it would speak is logged.

Run it before asking the maintainer for a learner's check: after a release, or after any
change to a screen, the mic or the shell. The vm suite (`test/run-all.sh`) calls screens'
click handlers directly, so it cannot see a tap the shell never routes, nor a recogniser's
real timing. Phase 3 shipped with « Je ne peux pas parler » dead and Safari's mic never
scoring, while that suite was green.

## Setup

Once: `npm install` in this folder. It installs `playwright-core` only, which drives the
Chrome already installed on the machine (`channel: 'chrome'`); it downloads no browser.
Nothing here is part of the app, the build or CI.

## Run

Build first (`sh build.sh`). Each script takes the folder that holds `index.html`, the
repository by default, and exits 1 with one `PROBLEM:` line per fault.

| Script | What it plays | Clean run ends with |
|---|---|---|
| `node tools/learner-pass/days.js` | sessions on study days 0–20, the clock moved forward, until spoken cards come up; each mic path once: right, wrong then right, ending by itself, and « Je ne peux pas parler » | `THE STUDY DAYS PLAY THROUGH` |
| `node tools/learner-pass/corners.js` | listening (Comprendre, Répéter), the baker conversation, the challenge | `LISTENING, CONVERSATION AND CHALLENGE PLAY THROUGH` |
| `node tools/learner-pass/sweep.js` | every tappable thing on 16 screens: one that changes nothing, one a finger cannot reach, a sheet that jumps from where it was scrolled, overflow at 390 px, console errors | `EVERY TAP DOES SOMETHING` |

`days.js` takes about two minutes, `corners.js` one, `sweep.js` about four. Screenshots of
each step go to `shots/` (ignored): look at them, as a learner would see the screens.

## Reading a fault

Confirm a fault by hand before reporting it as an app bug. The known harness traps:

- the mic pulses for as long as it listens, so tapping it needs `force: true`, or
  Playwright waits for it to stop moving;
- a tap must land on the element's centre: off-centre, it falls under the fixed nav.
