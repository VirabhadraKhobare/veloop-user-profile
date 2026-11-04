# Database design

Mongoose models live under `backend/src/models`.

- `User` stores identity, role, status, referral code, and referrer.
- `Wallet` stores verified balances and reserved withdrawal amounts.
- `RewardTransaction` is the auditable reward ledger.
- `Achievement` stores configurable definitions; `UserAchievement` stores progress and unlock dates.
- `Referral` links a referrer to one referred user and tracks eligibility.
- `Withdrawal` stores payout details, status history, and reference IDs.
- `AdminAuditLog` records privileged changes and reasons.

Wallet and referral uniqueness are enforced with indexes. Withdrawal creation atomically reserves available tokens with a conditional update; approval and completion are separate admin actions.
