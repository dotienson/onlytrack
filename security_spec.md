# Security Spec

## Data Invariants
- A user can only read and write their own UserProfile document (`userId == request.auth.uid`).
- A user can only read and write their own Metrics subcollection (`userId == request.auth.uid`).
- The `userId` path variable must match `request.auth.uid`.
- Height, if provided, must be a number.
- Weight must be a number. Waist and BMI are optional numbers.

## The Dirty Dozen Payloads
1. Create user profile for another user: `POST users/userB { userId: 'userB' }` as `userA` -> DENY (identity spoofing)
2. Update user profile to change `userId`: `PATCH users/userA { userId: 'userB' }` -> DENY (immutable field)
3. Read another user's profile: `GET users/userB` as `userA` -> DENY (data isolation)
4. Create metric for another user: `POST users/userB/metrics/1 { userId: 'userB', weight: 80, date: '...', timestamp: ... }` as `userA` -> DENY
5. Inject ghost field into profile: `POST users/userA { userId: 'userA', isAdmin: true, updatedAt: ... }` -> DENY (schema violation)
6. Inject ghost field into metric: `POST users/userA/metrics/1 { userId: 'userA', weight: 80, date: '...', timestamp: ..., fake: true }` -> DENY (schema violation)
7. Poison metric ID path: `POST users/userA/metrics/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA... { ... }` -> DENY (ID poisoning)
8. Array guarding (N/A here as no arrays)
9. Client delegated query test: `GET users/userA/metrics` -> query should be correctly enforced by path validation, `userId` must be `userA`.
10. Update metric with wrong types: `PATCH users/userA/metrics/1 { weight: '80kg' }` -> DENY (type validation)
11. Update timestamp spoofing: `PATCH users/userA/metrics/1 { timestamp: 'old-server-time' }` -> Timestamp should just be verified as string representation or server time (we use `request.time` for timestamps). Wait, in the blueprint we specified `timestamp` as string. Let's enforce it is a server timestamp.
12. Omitting required metric fields on create: `POST users/userA/metrics/1 { userId: 'userA' }` -> DENY (schema size checking).

