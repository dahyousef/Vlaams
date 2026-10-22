#!/usr/bin/env node
/* Reminds a session that has just been compacted or resumed where a plan run keeps its state.

   Claude Code runs this at SessionStart when the source is `compact` or `resume` (see
   .claude/settings.json), and adds what it prints to the session's context. A compaction's summary can
   drop a ruling; the files cannot. It only prints, and always exits 0: it never blocks a session. */
console.log('If a plan run is in progress: re-read docs/agents/plan-runs/run-controller.md and, in the ledger, the status table, the batches table if it has one, and the rulings, before the next dispatch. Never continue a run from memory of the conversation.');
