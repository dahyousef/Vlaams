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
deploy copies the settings whole, so its next settings write carries the `resetAt` and
`progress` it last saw. Since 16 October 2026 the `keep_reset` trigger on `user_meta` keeps the
account's `resetAt` and `progress` when a write would lower `resetAt` (amended below), so a
reset or a restore made on this build survives that write, and neither a device adopting in
that window nor the old device, once reloaded, takes the older reset. What remains: the old
tab shows its old progress until it is reloaded, its answers reach the server inert, and under
the same reset it can send back an older `progress`, which this build's next synchronisation
puts right. Reloading every open tab and installed app after the deploy is advice, no longer
protection. A reset made by hand still cuts at the clock of the device that makes it,
so a `base` taken from a device whose clock runs ahead can outlast it; that is the clock skew
accepted above. Data written by a Preview of this branch before the amendment of 14 October
carries no `base` and is erased by the next migration; no real account has used such a Preview.

## Amended 16 October 2026

The third limit above was the one the server could close. A `keep_reset` trigger on
`user_meta`, run after `keep_newer`, keeps the stored `resetAt` and `progress` when an
incoming write would lower `resetAt`, and takes the rest of the write as it arrives. It keeps
rather than refuses: a refused settings write made the previous build's whole flush fail and be
retried every thirty seconds. `supabase/schema.sql` holds it, and `test/sync.js` mirrors it.

## Amended 22 October 2026

A word or phrase listed in two units is now one item, built under its first listing's id; the
later ids find it. Progress learned under a later id before that change is folded into the
item once, by `NL.srs.fold()`: at the end of a pull, after a restore, and at boot on a device
that no account owns. A device that an account owns waits for the pull that follows its boot:
folded from its own copies alone, the item would be marked folded before an alias record that
the pull brings could count.

The fold is written and sent as an answer is. Like an answer's, its `base` is the reset the
device knows, so a reset another device made still erases what it folded, and a backup from
before the aliases folds when it is restored. Unlike an answer's, its `updatedAt` is not the
time of the fold but the newest `updatedAt` among the records it folds, so a newer write made
on another device still wins: the server's `keep_newer` drops the fold when it holds a newer
row, and the next pull brings that row. The folded record carries a new stored field,
`folded: true`. A record that has it is never folded again, so an alias record that a later
pull brings back cannot undo a miss made after the fold. Alias records stay on the device and
on the server, inert.

One case stays open. A device that no account owns folds at boot. If it then joins an account
whose server holds an alias record newer than what it folded, and no newer record of the item
itself, its fold stands and that alias record is never folded.
