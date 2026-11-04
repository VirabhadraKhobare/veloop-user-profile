
# VELOop Rewards – Task

A full-stack user profile and admin management application built using the MERN stack.

## Technology Stack
- React.js
- Vite
- Bootstrap
- Node.js
- Express.js
- MongoDB
- Mongoose

## Project Structure
- frontend/ – React user interface
- backend/ – Express API server

## Current Progress
- React dashboard routes for profile, rewards, achievements, referrals, and withdrawals
- Database-backed user wallet, reward history, achievement, referral, and withdrawal models
- Express backend setup
- API health-check endpoint
- User registration, login, logout, and authenticated profile lookup
- MongoDB-backed user schema with password hashing and account status checks
- HTTP-only JWT cookie authentication with request validation and rate limiting
- Unified `GET /api/profile/me` contract for backend-owned profile rendering
- Admin dashboard, paginated user search/detail, and audit-log read APIs
- Protected Admin Panel with live dashboard metrics, user suspension/restore, withdrawal review, and audit activity

## Development Status
The user-facing feature set is implemented. Achievement definitions must be seeded by an administrator or deployment script before they appear, and payout completion remains an administrator-reviewed workflow. Level progression currently follows the server-owned 1,000 XP threshold rule.

## Local Development

Copy `backend/.env.example` to `backend/.env` and set a real `MONGODB_URI` and a long random `JWT_SECRET` before starting the API. Never commit that file.

### Frontend
cd frontend
npm install
npm run dev

### Backend
cd backend
npm install
npm run dev

To create or update the development administrator, set the `ADMIN_SEED_*` values in
`backend/.env` and run `node scripts/seed-admin.js` from the `backend` directory.
Never use production credentials for this seed process.

### Authentication API

The backend exposes:

- `POST /api/auth/register` – create an active user account
- `POST /api/auth/login` – issue an HTTP-only authentication cookie
- `POST /api/auth/logout` – clear the authentication cookie
- `GET /api/auth/me` – return the authenticated user's safe profile
- `GET /api/health` – report API and MongoDB connection status

Authentication requests must include credentials from browser clients. Password hashes and authentication tokens are never returned in API responses.

## Feature documentation

- [API documentation](./API_DOCUMENTATION.md)
- [Database design](./DATABASE.md)
- [Security notes](./SECURITY.md)
- [Admin guide](./ADMIN_GUIDE.md)
- [Testing guide](./TESTING.md)

## Security
Environment variables and credentials should be stored in local .env files and never committed to Git.
