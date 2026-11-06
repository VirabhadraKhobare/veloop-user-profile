import { useEffect, useMemo, useState } from "react";
import {
  Clipboard,
  Gem,
  Home,
  LogOut,
  Menu,
  RefreshCw,
  Send,
  Trophy,
  UserRound,
  Wallet,
} from "lucide-react";
import {
  BrowserRouter,
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  achievementsApi,
  adminApi,
  authApi,
  profileApi,
  referralsApi,
  rewardsApi,
  withdrawalsApi,
} from "./services/api";
import useRequest from "./hooks/useRequest";
import { formatDate, formatDateTime, formatNumber, getErrorMessage } from "./utils";
import AchievementCard from "./components/AchievementCard";
import LevelProgress from "./components/LevelProgress";
import ProfileHero from "./components/ProfileHero";
import RecentActivity from "./components/RecentActivity";
import ReferralSnapshot from "./components/ReferralSnapshot";
import RewardAssets from "./components/RewardAssets";
import WithdrawalOverview from "./components/WithdrawalOverview";

const navigationLinks = [
  ["/user-profile", "My Profile", Home],
  ["/rewards", "Rewards", Gem],
  ["/achievements", "Achievements", Trophy],
  ["/referrals", "Referrals", Send],
  ["/withdrawals", "Withdrawals", Wallet],
];

function getNavigationLinks(role) {
  return role === "admin"
    ? [...navigationLinks, ["/admin", "Admin Panel", Trophy]]
    : navigationLinks;
}

function AuthForm({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    referralCode: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  async function submit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const response =
        mode === "login"
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register(form);
      onAuthenticated(response.data.data);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }
  const registering = mode === "register";
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          <span className="brand-word">VELO</span><span>op</span>
        </div>
        <p className="eyebrow">
          {registering ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}
        </p>
        <h1>{registering ? "Start earning rewards" : "Sign in to VELOop"}</h1>
        <p className="auth-description">
          Your rewards dashboard is waiting for you.
        </p>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={submit} className="auth-form">
          {registering && (
            <>
              <label>
                Full name
                <input
                  name="fullName"
                  value={form.fullName}
                  onChange={update}
                  required
                  minLength="2"
                  maxLength="100"
                />
              </label>
              <label>
                Username
                <input
                  name="username"
                  value={form.username}
                  onChange={update}
                  required
                  pattern="[a-zA-Z0-9_]{3,30}"
                />
              </label>
              <label>
                Referral code (optional)
                <input
                  name="referralCode"
                  value={form.referralCode}
                  onChange={update}
                  maxLength="20"
                />
              </label>
            </>
          )}
          <label>
            Email
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={update}
              required
              maxLength="254"
            />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={update}
              required
              minLength="8"
              maxLength="72"
            />
          </label>
          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting
              ? "Please wait..."
              : registering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>
        <button
          className="text-button"
          type="button"
          onClick={() => {
            setMode(registering ? "login" : "register");
            setError("");
          }}
        >
          {registering
            ? "Already have an account? Sign in"
            : "New to VELOop? Create an account"}
        </button>
      </section>
    </main>
  );
}

function DashboardLayout({ user, onLogout, onUserUpdated }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const links = getNavigationLinks(user.role);
  function toggleNavigation() {
    if (window.innerWidth <= 760) {
      setMobileNavOpen((open) => !open);
      return;
    }
    setSidebarCollapsed((collapsed) => !collapsed);
  }
  async function logout() {
    await onLogout();
    navigate("/");
  }
  return (
    <div className={`app-shell ${sidebarCollapsed ? "sidebar-collapsed" : ""} ${mobileNavOpen ? "mobile-nav-open" : ""}`}>
      <aside className="sidebar">
        <div className="brand">
          VELO<span>op</span>
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          onClick={toggleNavigation}
          aria-expanded={mobileNavOpen}
          aria-controls="account-navigation"
          aria-label="Toggle navigation"
          title="Toggle navigation"
        >
          <Menu size={18} aria-hidden="true" />
        </button>
        <p className="nav-heading">ACCOUNT</p>
        <nav className="sidebar-nav" id="account-navigation" aria-label="Account navigation">
          <div className="drawer-brand" aria-hidden="true">
            <span className="brand-word">VELO</span><span>op</span>
          </div>
          {links.map(([path, label, Icon]) => (
            <Link
              className={`nav-item ${location.pathname === path ? "active" : ""}`}
              key={path}
              to={path}
              onClick={() => setMobileNavOpen(false)}
            >
              <Icon size={16} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        <button
          className="logout-button"
          type="button"
          onClick={logout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={16} />
          <span>Sign out</span>
        </button>
      </aside>
      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1>
              {links.find(([path]) => path === location.pathname)?.[1] ||
                "My Profile"}
            </h1>
          </div>
          <div className="icon-button">
            <UserRound size={20} />
          </div>
        </header>
        <Routes>
          <Route
            path="/user-profile"
            element={<ProfilePage user={user} onUserUpdated={onUserUpdated} />}
          />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/referrals" element={<ReferralsPage />} />
          <Route path="/withdrawals" element={<WithdrawalsPage />} />
          {user.role === "admin" && (
            <Route path="/admin" element={<AdminPage />} />
          )}
          <Route path="*" element={<Navigate to="/user-profile" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function AdminPage() {
  const dashboard = useRequest(adminApi.dashboard, {
    users: { total: 0, active: 0, suspended: 0 },
    walletTotals: { ve: 0, sve: 0, gems: 0, tokens: 0, xp: 0 },
    withdrawals: { total: 0, pending: 0 },
    recentAuditLogs: [],
  });
  const users = useRequest(
    (params) => adminApi.users({ page: 1, limit: 25, ...params }),
    { items: [], total: 0, pages: 0 },
  );
  const withdrawalState = useRequest(adminApi.withdrawals, []);
  const auditLogs = useRequest(
    (params) => adminApi.auditLogs({ page: 1, limit: 25, ...params }),
    { items: [], total: 0 },
  );
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const timer = window.setInterval(() => {
      dashboard.reload();
      withdrawalState.reload();
      auditLogs.reload();
    }, 30000);
    return () => window.clearInterval(timer);
    // Admin data refreshes on a bounded interval while this page is open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function refresh() {
    dashboard.reload();
    users.reload({ search, status: statusFilter });
    withdrawalState.reload();
    auditLogs.reload();
  }

  async function inspectUser(id) {
    setNotice("");
    try {
      const response = await adminApi.user(id);
      setSelectedUser(response.data.data);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  async function changeUserStatus(user) {
    const nextStatus = user.status === "active" ? "suspended" : "active";
    const reason = window.prompt(`Reason to mark this user ${nextStatus}:`);
    if (!reason) return;
    setBusy(true);
    setNotice("");
    try {
      await adminApi.updateUserStatus(user._id, { status: nextStatus, reason });
      setNotice("User status updated and recorded in the audit log.");
      refresh();
      if (selectedUser?.user?._id === user._id) inspectUser(user._id);
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function changeWithdrawal(item, status) {
    const reason = window.prompt(`Reason for marking this withdrawal ${status}:`);
    if (!reason) return;
    setBusy(true);
    setNotice("");
    try {
      await adminApi.updateWithdrawal(item._id, { status, reason });
      setNotice("Withdrawal status updated and recorded.");
      refresh();
    } catch (error) {
      setNotice(getErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="page-actions">
        <div>
          <p className="eyebrow">OPERATIONS</p>
          <p>Live controls are protected by server-side admin authorization.</p>
        </div>
        <button className="secondary-button" type="button" onClick={refresh} disabled={busy}>
          <RefreshCw size={15} /> Refresh data
        </button>
      </div>
      {notice && <div className="form-notice success-notice" role="status">{notice}</div>}
      <StateMessage {...dashboard}>
        <section className="stat-grid admin-stat-grid">
          <article className="stat-card"><span>USERS</span><strong>{dashboard.data.users.total}</strong><small>{dashboard.data.users.active} active · {dashboard.data.users.suspended} suspended</small></article>
          <article className="stat-card"><span>PENDING WITHDRAWALS</span><strong>{dashboard.data.withdrawals.pending}</strong><small>{dashboard.data.withdrawals.total} total requests</small></article>
          <article className="stat-card"><span>TOTAL TOKENS</span><strong>{formatNumber(dashboard.data.walletTotals.tokens)}</strong><small>From persisted wallets</small></article>
          <article className="stat-card"><span>TOTAL XP</span><strong>{formatNumber(dashboard.data.walletTotals.xp)}</strong><small>From persisted wallets</small></article>
        </section>
      </StateMessage>
      <section className="panel">
        <div className="panel-heading">
          <h2>User management</h2>
          <div className="admin-filters">
            <input aria-label="Search users" placeholder="Search name, username, email" value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && users.reload({ search, status: statusFilter })} />
            <select aria-label="Filter users by status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); users.reload({ search, status: event.target.value }); }}>
              <option value="">All statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <StateMessage {...users} empty="No users match the current filters.">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>User</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
              <tbody>{users.data.items.map((item) => (
                <tr key={item._id}>
                  <td><strong>{item.fullName}</strong><small>@{item.username} · {item.email}</small></td>
                  <td><span className={`status-pill ${item.status}`}>{item.status}</span></td>
                  <td>{formatDate(item.memberSince)}</td>
                  <td className="table-actions"><button className="copy-button" type="button" onClick={() => inspectUser(item._id)}>Inspect</button><button className="copy-button" type="button" onClick={() => changeUserStatus(item)} disabled={busy}>{item.status === "active" ? "Suspend" : "Restore"}</button></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </StateMessage>
      </section>
      {selectedUser && (
        <section className="panel">
          <div className="panel-heading"><h2>User detail: {selectedUser.user.fullName}</h2><button className="copy-button" type="button" onClick={() => setSelectedUser(null)}>Close</button></div>
          <div className="admin-detail-grid">
            {Object.entries(selectedUser.wallet || {}).filter(([key]) => ["ve", "sve", "gems", "tokens", "xp"].includes(key)).map(([key, value]) => <div className="stat-card" key={key}><span>{key.toUpperCase()}</span><strong>{formatNumber(value)}</strong></div>)}
          </div>
          <p className="admin-muted">{selectedUser.transactions.length} reward transactions · {selectedUser.referrals.length} referrals · {selectedUser.withdrawals.length} withdrawals</p>
        </section>
      )}
      <section className="panel">
        <div className="panel-heading"><h2>Withdrawal review</h2></div>
        <StateMessage {...withdrawalState} empty="No pending withdrawal requests.">
          <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Reference</th><th>User</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>
            {withdrawalState.data.map((item) => <tr key={item._id}><td>{item.referenceId}</td><td>{item.user?.username || item.user?.email || "User"}</td><td>{formatNumber(item.amount)} tokens</td><td><span className={`status-pill ${item.status}`}>{item.status}</span></td><td className="table-actions"><button className="copy-button" type="button" onClick={() => changeWithdrawal(item, "approved")} disabled={busy || item.status !== "pending"}>Approve</button><button className="copy-button danger-button" type="button" onClick={() => changeWithdrawal(item, "rejected")} disabled={busy || ["completed", "rejected"].includes(item.status)}>Reject</button></td></tr>)}
          </tbody></table></div>
        </StateMessage>
      </section>
      <section className="panel">
        <div className="panel-heading"><h2>Recent audit activity</h2></div>
        <StateMessage {...auditLogs} empty="No administrative activity recorded yet."><div className="record-list">{auditLogs.data.items.map((item) => <div className="record-row" key={item._id}><div><strong>{item.action}</strong><span>{item.admin?.username || "Administrator"} · {item.reason}</span></div><small>{formatDateTime(item.createdAt)}</small></div>)}</div></StateMessage>
      </section>
    </div>
  );
}

function StateMessage({ loading, error, empty, children }) {
  if (loading) return <div className="state-message" aria-live="polite">Loading your verified data...</div>;
  if (error)
    return (
      <div className="state-message error-state" role="alert">
        {error}
      </div>
    );
  if (empty) return <div className="state-message">{empty}</div>;
  return children;
}

function ProfilePage({ user, onUserUpdated }) {
  const summary = useRequest(profileApi.me, {
    profile: user,
    rewards: { ve: 0, sve: 0, gems: 0, tokens: 0, xp: 0 },
    levelProgress: {
      currentLevel: 1,
      currentLevelName: "Reward Level 01",
      nextLevel: 2,
      currentXp: 0,
      nextLevelXp: 1000,
      xpRemaining: 1000,
      progressPercent: 0,
    },
  });
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState("");
  useEffect(() => {
    const timer = window.setInterval(() => summary.reload(), 30000);
    return () => window.clearInterval(timer);
    // The request hook intentionally exposes a stable refresh behavior for this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [form, setForm] = useState({
    fullName: user.fullName,
    username: user.username,
    avatarUrl: user.avatarUrl || "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const profile = summary.data.profile || user;
  async function copyValue(label, value) {
    if (!value || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(""), 1800);
  }
  async function saveProfile(event) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await authApi.updateProfile(form);
      onUserUpdated(response.data.data);
      setEditing(false);
      setMessage("Profile updated successfully.");
    } catch (error) {
      setMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <ProfileHero
        profile={profile}
        editing={editing}
        onEdit={() => {
          setForm({
            fullName: user.fullName,
            username: user.username,
            avatarUrl: user.avatarUrl || "",
          });
          setEditing((current) => !current);
          setMessage("");
        }}
      />
      {message && (
        <div className="form-notice" role="status">
          {message}
        </div>
      )}
      {editing && (
        <section className="panel profile-edit-panel">
          <div className="panel-heading">
            <h2>Edit profile</h2>
          </div>
          <form className="auth-form" onSubmit={saveProfile}>
            <label>
              Full name
              <input
                name="fullName"
                value={form.fullName}
                onChange={(event) =>
                  setForm({ ...form, fullName: event.target.value })
                }
                minLength="2"
                maxLength="100"
                required
              />
            </label>
            <label>
              Username
              <input
                name="username"
                value={form.username}
                onChange={(event) =>
                  setForm({ ...form, username: event.target.value })
                }
                pattern="[a-zA-Z0-9_]{3,30}"
                required
              />
            </label>
            <label>
              Avatar URL (optional)
              <input
                name="avatarUrl"
                type="url"
                value={form.avatarUrl}
                onChange={(event) =>
                  setForm({ ...form, avatarUrl: event.target.value })
                }
                maxLength="500"
              />
            </label>
            <button className="primary-button" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save profile"}
            </button>
          </form>
        </section>
      )}
      <section className="section-heading">
        <div>
          <h2>Your Rewards</h2>
          <p>Balances are read from your verified wallet.</p>
        </div>
      </section>
      <StateMessage {...summary}>
        <RewardAssets rewards={summary.data.rewards} />
      </StateMessage>
      <section className="panel identity-panel">
        <div className="panel-heading">
          <h2>Account information</h2>
          <span className="status-label">{profile.status}</span>
        </div>
        <div className="identity-grid">
          {[
            ["User ID", profile.userId || profile.id],
            ["Referral code", profile.referralCode],
            ["Member since", formatDate(profile.memberSince)],
          ].map(([label, value]) => (
            <div className="identity-item" key={label}>
              <span>{label}</span>
              <strong>{value || "Not available"}</strong>
              {value && (label === "User ID" || label === "Referral code") && (
                <button
                  type="button"
                  className="copy-button"
                  onClick={() => copyValue(label, value)}
                  aria-label={`Copy ${label}`}
                >
                  <Clipboard size={14} />
                  {copied === label ? "Copied" : "Copy"}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
      <LevelProgress progress={summary.data.levelProgress} />
      <RecentActivity items={summary.data.activity || []} />
    </>
  );
}

function RewardsPage() {
  const summary = useRequest(rewardsApi.summary, {
    balances: { ve: 0, sve: 0, gems: 0, tokens: 0, xp: 0 },
    level: 1,
  });
  const transactions = useRequest(
    (params) => rewardsApi.transactions({ limit: 50, ...params }),
    { items: [] },
  );
  return (
    <>
      <div className="page-actions">
        <p>Verified balances and reward earning history.</p>
        <button
          className="secondary-button"
          onClick={() => {
            summary.reload();
            transactions.reload();
          }}
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
      <StateMessage {...summary}>
        <section className="stat-grid">
          {Object.entries(summary.data.balances).map(([key, value]) => (
            <article className="stat-card" key={key}>
              <span>{key.toUpperCase()}</span>
              <strong>{formatNumber(value)}</strong>
            </article>
          ))}
        </section>
      </StateMessage>
      <section className="panel">
        <div className="panel-heading">
          <h2>Reward transactions</h2>
          <select
            aria-label="Filter reward type"
            onChange={(e) =>
              transactions.reload(
                e.target.value ? { type: e.target.value } : {},
              )
            }
          >
            <option value="">All types</option>
            <option value="ve">VEs</option>
            <option value="sve">SVEs</option>
            <option value="gems">Gems</option>
            <option value="tokens">Tokens</option>
            <option value="xp">XP</option>
          </select>
        </div>
        <StateMessage {...transactions} empty="No reward transactions yet.">
          <div className="record-list">
            {transactions.data.items.map((item) => (
              <div className="record-row" key={item._id}>
                <div>
                  <strong>{item.description}</strong>
                  <span>
                    {formatDate(item.createdAt)} ·{" "}
                    {item.status}
                  </span>
                </div>
                <b className={item.amount >= 0 ? "positive" : "negative"}>
                  {item.amount >= 0 ? "+" : ""}
                  {item.amount} {item.type.toUpperCase()}
                </b>
              </div>
            ))}
          </div>
        </StateMessage>
      </section>
    </>
  );
}

function AchievementsPage() {
  const all = useRequest(achievementsApi.all, []);
  const mine = useRequest(achievementsApi.mine, []);
  const summary = useRequest(achievementsApi.summary, {
    total: 0,
    unlocked: 0,
    locked: 0,
    completionPercent: 0,
  });
  const unlocked = useMemo(
    () => new Map(mine.data.map((item) => [item.achievement?._id, item])),
    [mine.data],
  );
  return (
    <>
      <StateMessage {...summary}>
        <section className="stat-grid">
          <article className="stat-card">
            <span>UNLOCKED</span>
            <strong>{summary.data.unlocked}</strong>
          </article>
          <article className="stat-card">
            <span>LOCKED</span>
            <strong>{summary.data.locked}</strong>
          </article>
          <article className="stat-card">
            <span>COMPLETION</span>
            <strong>{summary.data.completionPercent}%</strong>
          </article>
        </section>
      </StateMessage>
      <section className="panel">
        <div className="panel-heading">
          <h2>Achievement collection</h2>
        </div>
        <StateMessage
          {...all}
          empty="No achievements have been configured yet."
        >
          <div className="achievement-grid">
            {all.data.map((item) => {
              const progress = unlocked.get(item._id);
              return (
                <AchievementCard
                  key={item._id}
                  achievement={item}
                  progress={progress}
                />
              );
            })}
          </div>
        </StateMessage>
      </section>
    </>
  );
}

function ReferralsPage() {
  const summary = useRequest(referralsApi.summary, {
    code: "",
    total: 0,
    successful: 0,
    pending: 0,
    eligibleRewards: 0,
  });
  const list = useRequest(referralsApi.list, { items: [] });
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/register?ref=${summary.data.code}`;
  async function copy() {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }
  return (
    <>
      <StateMessage {...summary}>
        <ReferralSnapshot
          summary={summary.data}
          onCopy={copy}
          copied={copied}
        />
      </StateMessage>
      <section className="panel">
        <div className="panel-heading">
          <h2>Referral history</h2>
        </div>
        <StateMessage
          {...list}
          empty="No referrals yet. Share your link to get started."
        >
          <div className="record-list">
            {list.data.items.map((item) => (
              <div className="record-row" key={item._id}>
                <div>
                  <strong>Referral</strong>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <b>{item.status}</b>
              </div>
            ))}
          </div>
        </StateMessage>
      </section>
    </>
  );
}

function WithdrawalsPage() {
  const summary = useRequest(withdrawalsApi.summary, {
    available: 0,
    pending: 0,
    completed: 0,
    minimum: 10,
  });
  const list = useRequest(withdrawalsApi.list, []);
  const [form, setForm] = useState({
    amount: "",
    payoutMethod: "bank",
    payoutDetails: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const available = Number(summary.data.available) || 0;
  const minimum = Number(summary.data.minimum) || 10;
  const amount = Number(form.amount);
  const amountError = !form.amount
    ? "Amount is required."
    : !Number.isFinite(amount) || amount <= 0
      ? "Enter a valid amount greater than 0."
      : amount < minimum
        ? `Enter at least ${minimum} tokens.`
        : amount > available
          ? `Your available balance is ${available} tokens.`
          : "";
  const payoutDetailsError = !form.payoutDetails.trim()
    ? "Payout details are required."
    : form.payoutDetails.trim().length < 2
      ? "Enter at least 2 characters."
      : "";
  const payoutMethodError = !["bank", "paypal"].includes(form.payoutMethod)
    ? "Select a valid payout method."
    : "";
  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setMessageType("");
    if (amountError || payoutMethodError || payoutDetailsError) {
      setMessage(amountError || payoutMethodError || payoutDetailsError);
      return;
    }
    setSubmitting(true);
    try {
      await withdrawalsApi.create({
        amount,
        payoutMethod: form.payoutMethod,
        payoutDetails: form.payoutDetails.trim(),
      });
      setForm({ amount: "", payoutMethod: "bank", payoutDetails: "" });
      setMessage("Withdrawal request submitted successfully. It is now pending admin review.");
      setMessageType("success");
      await Promise.allSettled([summary.reload(), list.reload()]);
    } catch (error) {
      setMessage(getErrorMessage(error));
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <StateMessage {...summary}>
        <WithdrawalOverview summary={summary.data} />
      </StateMessage>
      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <h2>Request withdrawal</h2>
          </div>
          {message && (
            <div className={`form-notice ${messageType === "success" ? "success-notice" : ""}`} role={messageType === "error" ? "alert" : "status"}>
              {message}
            </div>
          )}
          <form className="auth-form" onSubmit={submit} noValidate>
            <label>
              Amount
              <input
                type="number"
                min={minimum}
                max={available}
                step="0.01"
                value={form.amount}
                onChange={(e) => {
                  setForm({ ...form, amount: e.target.value });
                  setMessage("");
                  setMessageType("");
                }}
                required
                aria-invalid={Boolean(amountError)}
                aria-describedby="withdrawal-amount-help"
              />
              <span className={amountError ? "input-help input-help-error" : "input-help"} id="withdrawal-amount-help">
                {amountError || `Minimum ${minimum} tokens · Available ${available} tokens`}
              </span>
            </label>
            <label>
              Payout method
              <select
                value={form.payoutMethod}
                onChange={(e) =>
                  setForm({ ...form, payoutMethod: e.target.value })
                }
                aria-invalid={Boolean(payoutMethodError)}
              >
                <option value="bank">Bank transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </label>
            <label>
              Payout details
              <input
                value={form.payoutDetails}
                onChange={(e) => {
                  setForm({ ...form, payoutDetails: e.target.value });
                  setMessage("");
                  setMessageType("");
                }}
                placeholder="Account or wallet details"
                required
                minLength="2"
                maxLength="300"
                aria-invalid={Boolean(payoutDetailsError)}
              />
              <span className={payoutDetailsError ? "input-help input-help-error" : "input-help"}>
                {payoutDetailsError || "Use demo bank or PayPal details for testing."}
              </span>
            </label>
            <button className="primary-button" type="submit" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Withdrawal history</h2>
          </div>
          <StateMessage {...list} empty="No withdrawal requests yet.">
            <div className="record-list">
              {list.data.map((item) => (
                <div className="record-row" key={item._id}>
                  <div>
                    <strong>{item.referenceId}</strong>
                    <span>
                      {formatDate(item.createdAt)} ·{" "}
                      {item.payoutMethod}
                    </span>
                  </div>
                  <b>{item.status}</b>
                </div>
              ))}
            </div>
          </StateMessage>
        </section>
      </div>
    </>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    authApi
      .getCurrentUser()
      .then((response) => setUser(response.data.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <main className="loading-screen">Loading your VELOop profile...</main>
    );
  if (!user) return <AuthForm onAuthenticated={setUser} />;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/*"
          element={
            <DashboardLayout
              user={user}
              onUserUpdated={setUser}
              onLogout={async () => {
                await authApi.logout();
                setUser(null);
              }}
            />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
