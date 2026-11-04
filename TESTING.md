# Testing

## Current validation

From `frontend/`:

```text
npm run build
npm run lint
```

Backend source files are validated with `node --check`. The backend currently has no automated test runner configured.

## Recommended integration setup

Use a separate MongoDB database and set `MONGODB_URI` to that database before exercising registration, login, referral attribution, reward summaries, achievement progress, and withdrawal reservation flows. Do not point tests at production data.
