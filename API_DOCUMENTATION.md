# API documentation

All endpoints use JSON and authenticated endpoints require the HTTP-only `veloop_token` cookie.

## User endpoints

- `POST /api/auth/register` — create an account; accepts optional `referralCode`.
- `POST /api/auth/login` — authenticate.
- `POST /api/auth/logout` — clear the cookie.
- `GET /api/auth/me` — current safe user profile.
- `PATCH /api/auth/me` — update `fullName`, `username`, and optional `avatarUrl`; financial balances, role, status, and referral ownership are not writable.
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

Admin users only may call `GET /api/admin/users`, `GET /api/admin/withdrawals`, `PATCH /api/admin/withdrawals/:id`, and `POST /api/admin/rewards/adjust`.
