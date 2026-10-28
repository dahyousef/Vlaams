# The language switch is live, and never applies mid-session

Switching between English and French takes effect at once, without a reload, the way the
theme already does: the setting is written, and the next screen drawn is in the other
language. `NL.t` stays one object whose contents are replaced, so the modules that kept a
reference to it at load keep working.

A switch never applies inside a session or a scenario. Both are full-screen, so the settings
sheet cannot open there; but the setting syncs, and a change made on another device can arrive
mid-session. It waits for the first screen drawn outside them. A session's exercises are built
before they are shown, its prompts and its feedback are read in the language it began in, and a
learner who finds the language changing under an answer cannot tell what was asked.

## Considered options

A reload on switch was rejected. Nothing in the app reloads the page today, a reload loses the
running session, and the theme already shows the live path works.

Applying a synced change at once was rejected for the reason above. Applying it only at the
next start of the app was rejected too: a learner who switches on the phone should see the
laptop follow without closing it.

## Consequences

The cognate set follows the display language (ADR 0004), so it is recomputed at every switch,
which is to say outside sessions only. After a switch the learner is told once where the
reference sheets are; nothing about that notice is stored.

## Amended 28 October 2026

A listening set waits too, from its first line to its summary. It is now full-screen like a
session, because its footer fell under the tab bar (#114), and the reasons above apply to it
unchanged: the settings sheet cannot open there, so a change can only come from another device,
and the set's answer options are built in the language it began in. The Listen menu is not part
of the set: a change applies there at once.
