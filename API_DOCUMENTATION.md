# API documentation

All endpoints use JSON and authenticated endpoints require the HTTP-only `veloop_token` cookie.

## User endpoints

- `POST /api/auth/register` — create an account; accepts optional `referralCode`.
- `POST /api/auth/login` — authenticate.
- `POST /api/auth/logout` — clear the cookie.
- `GET /api/auth/me` — current safe user profile.
- `PATCH /api/auth/me` — update `fullName`, `username`, and optional `avatarUrl`; financial balances, role, status, and referral ownership are not writable.
- `GET /api/profile/me` — return one backend-owned profile view containing identity, reward balances, level progress, achievements, referral totals, withdrawal totals, and recent persisted activity.
- `GET /api/rewards/summary`
- `GET /api/rewards/transactions?page=1&limit=20&type=tokens&status=approved`
- `GET /api/rewards/transactions/:id`
- `GET /api/achievements`, `/api/achievements/my`, `/api/achievements/summary`
- `GET /api/achievements/:id`
- `GET /api/referrals/summary`, `/api/referrals/my-code`, `/api/referrals`
- `GET /api/referrals/:id`
- `GET /api/withdrawals/summary`, `/api/withdrawals`
- `POST /api/withdrawals` with `amount`, `payoutMethod`, and `payoutDetails`.
- `GET /api/withdrawals/:id`

Users are always scoped from the verified cookie, not from request-supplied user IDs.

## Admin endpoints

Admin users only may call:

- `GET /api/admin/dashboard` — live user, wallet, withdrawal, and recent audit statistics.
- `GET /api/admin/users?search=&status=&page=1&limit=20` — paginated user search.
- `GET /api/admin/users/:id` — user wallet, transactions, referrals, and withdrawals.
- `PATCH /api/admin/users/:id/status` with `status` and `reason` — suspend or restore a non-admin account.
- `GET /api/admin/audit-logs?page=1&limit=25` — paginated audit history.
- `GET /api/admin/withdrawals`
- `PATCH /api/admin/withdrawals/:id`
- `POST /api/admin/rewards/adjust`
