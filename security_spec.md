# Security Specification - SPFIRE

## Data Invariants
1. A user can only create their own profile.
2. A user can only record high-accuracy activities.
3. Activity ID must match the path variable.
4. Distances and durations must be positive.
5. Users cannot spoof their UID in documents.

## The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Spoofing**: Attempt to create an activity with `userId: "attacker_id"` while logged in as `victim_id`.
2. **Resource Poisoning**: Activity with 1MB random string as document ID.
3. **Ghost Field Update**: Adding `isAdmin: true` to user profile during update.
4. **State Shortcutting**: Updating an activity distance from 5km to 500km without changing GPS logs.
5. **PII Leak**: Authenticated user trying to read another user's profile PII (email).
6. **Orphaned Record**: Creating an activity for a non-existent user.
7. **Negative Distance**: Activity with `distance: -10`.
8. **Future Activity**: Activity with `createdAt` in the future.
9. **Level Spoofing**: User updating their own `level` to 99.
10. **Query Scraping**: Attempting to list all activities for all users.
11. **Improper Type**: Setting `duration` as a string instead of a number.
12. **Unverified Email**: Trying to write with an unverified email (if configured).

## Test Runner (Logic Check)
The `DRAFT_firestore.rules` will address these via `isValidUser` and `isValidActivity` helpers.
