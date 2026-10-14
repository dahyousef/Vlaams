# A reset is a moment every device compares against, and the migration uses a fixed one

Resetting progress records the moment of the reset in the settings, which already travel
between devices. A device that finds a later reset on the server than its own drops whatever
progress is older and sends none of it back. The one-time migration to the new engine is the
same reset, with a date fixed in the code where a reset uses "now".

Deleting the progress was not enough. The server kept its copy and the next synchronisation
put it back; and had the server been cleared too, a second device that was offline at the
time would have returned its own copy later. A stale device cannot be told to forget, so it
has to be given something to compare its records against. The migration's date is fixed
because a second device migrating a day after the first would otherwise erase what the first
had learned in between.

## Consequences

The migration is a one-way door. On first load every device erases the progress made on the
old engine, on the device and on the server, and reverting the commit does not bring it back.

The fixed date has to fall after the last answer given on the old engine and before the
first given on the new one. Progress made on the old engine after that date survives the
migration.

The comparison is between clocks on different devices. A device whose clock runs behind can
have an answer given after a reset taken for one given before it, and dropped. This is
accepted and not handled: the clocks of a phone and a desktop are set by the network.

The lists of conversations and listening series done carry no dates, so across a reset they
follow whichever side knows the later reset. One completed on a second device after the
reset, but before that device has heard of it, is cleared with the rest.

Restoring a backup is a reset followed by a reload, with the restored records stamped "now".
Otherwise the other devices would take them for erased progress.

## Amended 14 October 2026

The review of the branch played cases the first test did not, and five held. A device still
running the previous build copied the migrated settings whole, `dataVersion 3` and `resetAt`
included, without erasing anything, so on the new build it never migrated, and it kept
sending its old frontier, its conversations done and old-engine records to the server. A
fresh device signing in to an account nobody had migrated took the old progress at its first
synchronisation, and migrated one page load later. Hearing of a reset emptied the whole
outbox, so progress made signed out on a new device never reached an account that carried a
reset, while the screen said everything was sent. A stale device that answered offline after
a reset made elsewhere kept the rungs it had built on erased ones: its records were dated
after the reset, so the cut on dates kept them, and they travelled back. A reset pressed
while no account owned the device was queued anyway, and at the next sign-in it erased the
account's whole history, on the server and on every device.

The reset stays a moment; what is compared against it changes. Every record and log line
carries `base`, the reset in force on the device when it was written, and a reset drops what
descends from an earlier one, whatever its date; a row without `base` comes from the previous
build and counts as 0. `ENGINE_EPOCH` is also a floor: a device on this build is born with its
`resetAt` there, already past the migration. The migration is decided by the data rather than
by a flag that synchronises: it runs whenever the device holds a record or log line below the
floor, or a frontier and lists the previous build rewrote, and it asks the server to delete
only what precedes the epoch. The frontier and the lists of conversations and listening series
done also travel in `progress`, which only this build writes; the merge reads them there and
nowhere else, and a device whose top-level fields disagree with `progress` knows the previous
build touched it. Hearing of a reset prunes the outbox instead of emptying it. A reset made
while no account owns the device and nobody is signed in stays on the device; one made signed
in, even before the device is attached, is the account's. A device that no account owned joins an
account as it is: its records and log lines are rebased on the account's latest reset (never
below the epoch), and its own `resetAt` becomes that one, even when it holds nothing, since a
reset made signed out would otherwise reach the account through the merge. Until that is done
nothing leaves the device or reaches it, and an attempt that fails on the network is retried
at the next chance to synchronise rather than at the next page load.

Five limits are accepted. Rows an old-build tab writes after the epoch stay on the server,
inert: no device on this build imports them, and the next write of the same item on this build
replaces them. The reverse also holds: a row the previous build writes later replaces this
build's row of the same item, since the server keeps the newer, and devices miss that item
until it is answered again on this build. A tab of the previous build left open after the
deploy copies the settings whole, so after a reset or a restore made on this build, its next
settings write can put the account's `resetAt` and `progress` back to what it last saw; a
device adopting in that window rebases on the older reset and loses its anonymous answers when
the later one returns, and the old device, once reloaded, keeps the older reset. The remedy is
in practice: after the deploy, reload every open tab and installed app on every device before
any reset or restore. A reset made by hand still cuts at the clock of the device that makes it,
so a `base` taken from a device whose clock runs ahead can outlast it; that is the clock skew
accepted above. Data written by a Preview of this branch before this amendment carries no
`base` and is erased by the next migration; no real account has used such a Preview.
