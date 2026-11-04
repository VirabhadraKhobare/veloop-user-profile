# Admin guide

Create or promote an administrator only through a controlled database migration; ordinary registration always creates a `user`.

Administrators can review users and pending withdrawals through the admin API. A withdrawal starts as `pending` and must be explicitly moved through `approved`, `processing`, or `completed`; rejected requests retain a reason. Terminal requests cannot be changed again.

Reward adjustments require a user ID, reward type, non-zero amount, and reason. Negative adjustments are rejected when they would make a wallet balance negative. Every privileged action is written to `AdminAuditLog`.
