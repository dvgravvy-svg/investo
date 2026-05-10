# security_spec.md

## Data Invariants
1. **User Ownership**: A `/users/{userId}` document must have a `uid` field equal to `userId`.
2. **Relational Integrity**: All sub-collections (trades, chat) must belong to the user identified by the path.
3. **Type Safety**: All fields must strictly adhere to types defined in `firebase-blueprint.json`.
4. **Immutability**: `uid` and `email` cannot be changed after creation in the `User` document. `symbol`, `entryPrice`, and `amount` cannot be changed in a `Trade` document.
5. **State Transitions**: A trade `status` can move from 'open' to 'closed', but never back to 'open'.
6. **Value Bounds**: `balance` and `xp` must be non-negative numbers.

## The "Dirty Dozen" Payloads (Deny cases)
1. **Identity Spoofing**: Attempting to create `/users/UserB_UID` with `request.auth.uid == UserA_UID`.
2. **Shadow Field Injection**: Attempting to add `isAdmin: true` to a User document.
3. **XP Inflation**: Manually incrementing `xp` by 1,000,000 in a single update without clearing a lesson.
4. **Trade Hijacking**: User A attempting to read/list trades in `/users/UserB_UID/trades`.
5. **Trade Backdating**: Creating a trade with a client-supplied `timestamp` that is in the past.
6. **Price Forgery**: Updating `entryPrice` of an existing open trade to improve profit potential.
7. **Negative Balance**: Updating `balance` to a negative value.
8. **Invalid IDs**: Using a 2KB string as a `tradeId` to bloat database storage.
9. **Role Spoofing**: Creating a `ChatMessage` with `role: 'ai'` to mimic tutor responses.
10. **State Reversal**: Attempting to update a 'closed' trade back to 'open'.
11. **Large Profile Bloat**: Setting `displayName` to a 10MB string.
12. **Unauthorized PII Access**: Authenticated User A attempting to 'get' User B's profile document (which contains email).

## The Test Runner (firestore.rules.test.ts)
- `test('deny cross-user access')`: Verifies that `userId` in path must match `request.auth.uid`.
- `test('validate User schema')`: Verifies that missing required fields or wrong types are rejected.
- `test('enforce immutable fields')`: Verifies that `entryPrice` in `trades` cannot be modified.
- `test('secure status transition')`: Verifies that `status` cannot be changed from `closed` to `open`.
- `test('prevent XP/balance injection')`: Verifies that `update` only allows specific whitelisted fields through whitelisted actions.
