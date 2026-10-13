#!/usr/bin/env node
/* Stops the git commands that cannot be taken back, before they run.

   Claude Code calls this before every shell command (a PreToolUse hook) and
   passes the command as JSON on stdin. Exit code 2 blocks the command and shows
   the message to the agent; exit code 0 lets it through.

   Adapted from the git-guardrails-claude-code skill, with two changes for this
   repository. That skill blocks every push; here an agent must be able to push
   the phase branch, because CI only runs on pull requests, so only pushes that
   reach `main` are blocked: `main` deploys to production. And the skill reads
   its input with jq, which is not installed on the machine this runs on; a
   missing jq blocks nothing and says nothing. Node is always there. */
const { execSync } = require('child_process');

const PROTECTED = /^(main|master)$/;
const names = cmd => /(^|[\s:+])(main|master)(\s|$)/.test(cmd);
const branch = () => { try { return execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch (e) { return ''; } };

function verdict(cmd) {
  /* One shell line can chain several commands: judge each on its own. */
  for (const part of cmd.split(/&&|\|\||;|\n/)) {
    const c = part.trim();
    if (/\bgit\b.*\bpush\b/.test(c)) {
      if (/\s(--force|-f|--force-with-lease)\b/.test(c)) return 'a forced push rewrites history that is already shared';
      if (/\s(--all|--mirror)\b/.test(c)) return 'this push would include main';
      if (names(c)) return 'a push to main deploys to production';
      const bare = !/\bpush\b\s+(-\S+\s+)*\S+\s+\S+/.test(c);          // no branch named: git pushes the current one
      if (bare && PROTECTED.test(branch())) return 'the current branch is main, and a push to main deploys to production';
    }
    if (/\bgh\s+pr\s+merge\b/.test(c)) return 'merging the pull request deploys to production: that step is the maintainer\'s';
    if (/\bgit\b.*\breset\b.*--hard\b/.test(c)) return 'git reset --hard throws away uncommitted work';
    if (/\bgit\b.*\bclean\b\s+-\w*f/.test(c)) return 'git clean -f deletes untracked files, the plan\'s progress ledger among them';
    if (/\bgit\b.*\bbranch\b\s+(-D|--delete\s+--force)\b/.test(c)) return 'git branch -D deletes a branch that may not be merged';
    if (/\bgit\b.*\b(checkout|restore)\b\s+(--\s+)?\.(\s|$)/.test(c)) return 'this discards every uncommitted change';
  }
  return null;
}

if (require.main === module) {
  let raw = '';
  process.stdin.on('data', d => { raw += d; });
  process.stdin.on('end', () => {
    let cmd = '';
    try { cmd = String((JSON.parse(raw).tool_input || {}).command || ''); } catch (e) { process.exit(0); }
    const why = verdict(cmd);
    if (why) {
      process.stderr.write('BLOCKED: ' + why + '. Ask the maintainer; do not look for another way to run it.\n');
      process.exit(2);
    }
    process.exit(0);
  });
}
module.exports = { verdict };
