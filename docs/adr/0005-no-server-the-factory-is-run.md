# The app has no server; the content factory is run, never deployed

The app remains a dependency-free static page that works offline. The content pipeline that
produces its material is a Spring Boot command-line tool living beside it, which is run and
never deployed.

The pipeline exists for two reasons that point the same way: content to B1 cannot be
hand-written, and Spring AI is worth real experience. Deploying a JVM in front of a static
page would cost hosting, break offline-first, and buy the app nothing it needs. So the tool
that makes the content has dependencies; the thing that reaches the browser has none.

## Considered options

Spring AI as a runtime backend — for a conversational tutor, or to grade free text — is
deferred, not rejected. It turned out not to be needed for graded free production, which is
judged offline by a rubric of stated requirements. If a tutor is ever wanted, a Supabase
Edge Function would serve it at a fraction of a JVM's cost and cold-start.
