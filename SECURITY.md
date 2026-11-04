# Security

- Passwords are hashed with bcrypt and never returned.
- JWTs are stored in an HTTP-only cookie and protected by `SameSite`/`Secure` settings in production.
- Helmet, CORS, JSON size limits, and authentication rate limiting are enabled.
- Feature APIs derive the user from verified authentication and scope every query to that user.
- Admin routes require both authentication and the `admin` role.
- Reward adjustments and withdrawal status changes create audit records with reason and before/after status.
- Balances and minimum withdrawal validation are enforced on the backend.

Set a long random `JWT_SECRET`, use a protected production MongoDB connection, and never commit `.env` files.
