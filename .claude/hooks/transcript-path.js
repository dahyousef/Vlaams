#!/usr/bin/env node
/* Tells a session that has just started where its own transcript is.

   Claude Code runs this at SessionStart when the source is `startup` or `clear` (see .claude/settings.json),
   and passes it a JSON object on stdin that includes `transcript_path`. What it prints enters the session's
   context, and the run controller copies the path into its `Sitting:` line instead of guessing it. It only
   prints, and always exits 0: it never blocks a session, and prints nothing if the input is not what it expects. */
try {
  const input = JSON.parse(require('fs').readFileSync(0, 'utf8'));
  if (typeof input.transcript_path === 'string' && input.transcript_path) console.log('This session\'s transcript: ' + input.transcript_path);
} catch (e) {}
