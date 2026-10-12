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
