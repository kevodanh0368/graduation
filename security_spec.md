# Security Specification — Kỷ Yếu 29/11/2026

## 1. Data Invariants
1. **Default-Deny Baseline**: Every unspecified path is denied (`match /{document=**} { allow read, write: if false; }`).
2. **Admin Authorization**: Admin operations require `request.auth != null && request.auth.token.email_verified == true` and either the bootstrapped owner email (`rt.cipher0368@gmail.com`) or membership in `/admins/{request.auth.uid}`.
3. **No Public List Scraping**: Anonymous/unauthenticated visitors can `get` `/eventSettings/main` and a specific `/invitations/{inviteId}` by exact ID, but `list` on `/invitations` and any read on `/publicRsvps` or `/admins` is strictly restricted to admins.
4. **Immutable Admin Fields on Guest RSVP**: When a guest updates `/invitations/{inviteId}` directly to confirm attendance, `affectedKeys().hasOnly(['rsvpStatus', 'companionCount', 'guestMessage', 'respondedAt', 'updatedAt'])` and `existing().rsvpStatus == 'pending'` must hold. Guests cannot alter `guestName`, `customTime`, `customVenue`, `salutation`, `personalNote`, `createdAt`, or `createdBy`.
5. **Terminal State Locking**: Once an invitation transitions from `pending` to `attending` or `declined`, non-admin users cannot overwrite or reset it.
6. **Strict Schema, Boundaries & Server Time**: All writes validate `keys().hasAll(...)` + `keys().hasOnly(...)`, string `.size()` bounds, integer ranges (`companionCount` in `0..5`), and `request.time` for timestamps.

## 2. Adversarial "Dirty Dozen" Payloads (Expected: PERMISSION_DENIED)
1. **Unauthenticated Admin Write**: Unauthenticated write to `/eventSettings/main`.
2. **Unverified Email Admin Spoof**: Signed-in user with `email: 'rt.cipher0368@gmail.com'` and `email_verified: false` attempting to create `/invitations/guest-1`.
3. **Self-Privilege Escalation**: Non-admin authenticated user writing `/admins/{ownUid}` to grant themselves admin role.
4. **Guest List Enumeration**: Unauthenticated user executing `list` on `/invitations` or `/publicRsvps`.
5. **Shadow Field Injection**: Guest RSVP update injecting `{ isAdmin: true }` or `{ extraField: 'spam' }`.
6. **Guest Name / Time Tampering**: Guest RSVP update attempting to alter `guestName` or `customTime` along with `rsvpStatus`.
7. **Terminal State Overwrite**: Guest attempting to update `/invitations/{inviteId}` when `existing().rsvpStatus` is already `'attending'`.
8. **Invalid Status Transition**: Guest attempting to set `rsvpStatus: 'pending'` or `'invalid'` during RSVP update.
9. **Resource Exhaustion (1MB String)**: Submitting a `guestMessage` exceeding 400 characters or `guestName` exceeding 80 characters.
10. **ID Poisoning**: Creating or accessing `/invitations/invalid$id*with>bad<chars` or ID > 128 chars.
11. **Timestamp Forgery**: Submitting a client-forged `createdAt` or `updatedAt` != `request.time`.
12. **Companion Count Overflow**: Submitting `companionCount: 999` or `companionCount: -1` or a string instead of an integer.
