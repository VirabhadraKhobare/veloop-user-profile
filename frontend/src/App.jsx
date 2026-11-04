import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clipboard,
  Gem,
  Home,
  LogOut,
  RefreshCw,
  Send,
  Trophy,
  UserRound,
  Wallet,
  XCircle,
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
  authApi,
  referralsApi,
  rewardsApi,
  withdrawalsApi,
} from "./services/api";

function errorMessage(error) {
  return (
    error.response?.data?.message || "Something went wrong. Please try again."
  );
}

function useRequest(request, initialValue) {
  const [state, setState] = useState({
    data: initialValue,
    loading: true,
    error: "",
  });
  const load = (params = {}) => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    return request(params)
      .then((response) =>
        setState({ data: response.data.data, loading: false, error: "" }),
      )
      .catch((error) =>
        setState({
          data: initialValue,
          loading: false,
          error: errorMessage(error),
        }),
      );
  };
  useEffect(() => {
    let active = true;
    request()
      .then((response) => {
        if (active)
          setState({ data: response.data.data, loading: false, error: "" });
      })
      .catch((error) => {
        if (active)
          setState({
            data: initialValue,
            loading: false,
            error: errorMessage(error),
          });
      });
    return () => {
      active = false;
    };
    // Requests are provided by each page and deliberately run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ...state, reload: load };
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
      setError(errorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }
  const registering = mode === "register";
  return (
    <main className="auth-shell">
      <section className="auth-card">
        <div className="brand">
          VELO<span>op</span>
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
  const links = [
    ["/user-profile", "My Profile", Home],
    ["/rewards", "Rewards", Gem],
    ["/achievements", "Achievements", Trophy],
    ["/referrals", "Referrals", Send],
    ["/withdrawals", "Withdrawals", Wallet],
  ];
  async function logout() {
    await onLogout();
    navigate("/");
  }
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          VELO<span>op</span>
        </div>
        <p className="nav-heading">ACCOUNT</p>
        {links.map(([path, label, Icon]) => (
          <Link
            className={`nav-item ${location.pathname === path ? "active" : ""}`}
            key={path}
            to={path}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
        <button className="logout-button" type="button" onClick={logout}>
          <LogOut size={16} />
          Sign out
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
          <Route path="*" element={<Navigate to="/user-profile" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function StateMessage({ loading, error, empty, children }) {
  if (loading) return <div className="state-message">Loading...</div>;
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
  const summary = useRequest(rewardsApi.summary, {
    balances: { ve: 0, sve: 0, gems: 0, tokens: 0, xp: 0 },
    level: 1,
    levelProgressPercent: 0,
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    fullName: user.fullName,
    username: user.username,
    avatarUrl: user.avatarUrl || "",
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const cards = [
    ["VEs", "ve", Gem],
    ["SVEs", "sve", Trophy],
    ["Gems", "gems", Gem],
    ["Tokens", "tokens", Wallet],
  ];
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
      setMessage(errorMessage(error));
    } finally {
      setSaving(false);
    }
  }
  return (
    <>
      <section className="welcome-card">
        <div className="avatar">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt="" />
          ) : (
            <UserRound size={28} />
          )}
        </div>
        <div className="welcome-copy">
          <p className="eyebrow">MEMBER PROFILE</p>
          <h2>Welcome, {user.fullName}</h2>
          <p>
            @{user.username} · {user.email}
          </p>
        </div>
        <span className="member-badge">
          {user.role === "admin" ? "Admin" : "Member"}
        </span>
        <button
          className="secondary-button"
          type="button"
          onClick={() => {
            setForm({
              fullName: user.fullName,
              username: user.username,
              avatarUrl: user.avatarUrl || "",
            });
            setEditing((current) => !current);
            setMessage("");
          }}
        >
          {editing ? "Cancel" : "Edit profile"}
        </button>
      </section>
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
        <section className="reward-grid">
          {cards.map(([label, key, Icon]) => (
            <article className="reward-card" key={key}>
              <div className="reward-icon">
                <Icon size={20} />
              </div>
              <p>{label}</p>
              <strong>{summary.data.balances[key].toLocaleString()}</strong>
              <span>Available balance</span>
            </article>
          ))}
          <article className="reward-card">
            <div className="reward-icon">
              <Trophy size={20} />
            </div>
            <p>XP</p>
            <strong>{summary.data.balances.xp.toLocaleString()}</strong>
            <span>Level {summary.data.level}</span>
          </article>
        </section>
      </StateMessage>
      <section className="level-card">
        <div>
          <p className="eyebrow">LEVEL PROGRESS</p>
          <h2>Level {summary.data.level}</h2>
          <p>Verified XP progress toward the next level.</p>
          <div className="progress-track">
            <span style={{ width: `${summary.data.levelProgressPercent}%` }} />
          </div>
        </div>
        <div className="level-symbol">
          <Trophy size={26} />
        </div>
      </section>
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
              <strong>{value.toLocaleString()}</strong>
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
                    {new Date(item.createdAt).toLocaleDateString()} ·{" "}
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
              const percent = Math.min(
                Math.round(((progress?.progress || 0) / item.target) * 100),
                100,
              );
              return (
                <article
                  className={`achievement-card ${progress?.unlockedAt ? "unlocked" : ""}`}
                  key={item._id}
                >
                  <div className="achievement-icon">
                    <Trophy size={21} />
                  </div>
                  <div>
                    <span className="category-label">{item.category}</span>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    <div className="progress-track">
                      <span
                        style={{
                          width: `${progress?.unlockedAt ? 100 : percent}%`,
                        }}
                      />
                    </div>
                    <small>
                      {progress?.unlockedAt
                        ? `Unlocked ${new Date(progress.unlockedAt).toLocaleDateString()}`
                        : `${progress?.progress || 0} / ${item.target}`}
                    </small>
                  </div>
                  {progress?.unlockedAt ? (
                    <CheckCircle2 className="success-icon" />
                  ) : (
                    <XCircle className="muted-icon" />
                  )}
                </article>
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
        <section className="referral-banner">
          <div>
            <p className="eyebrow">YOUR REFERRAL LINK</p>
            <strong>{link}</strong>
          </div>
          <button className="secondary-button" onClick={copy}>
            <Clipboard size={15} />
            {copied ? "Copied" : "Copy link"}
          </button>
        </section>
        <section className="stat-grid">
          <article className="stat-card">
            <span>TOTAL</span>
            <strong>{summary.data.total}</strong>
          </article>
          <article className="stat-card">
            <span>SUCCESSFUL</span>
            <strong>{summary.data.successful}</strong>
          </article>
          <article className="stat-card">
            <span>PENDING</span>
            <strong>{summary.data.pending}</strong>
          </article>
          <article className="stat-card">
            <span>REWARDS</span>
            <strong>{summary.data.eligibleRewards}</strong>
          </article>
        </section>
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
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
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
  const [submitting, setSubmitting] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await withdrawalsApi.create({ ...form, amount: Number(form.amount) });
      setForm({ amount: "", payoutMethod: "bank", payoutDetails: "" });
      setMessage("Withdrawal request submitted for admin review.");
      summary.reload();
      list.reload();
    } catch (error) {
      setMessage(errorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <>
      <StateMessage {...summary}>
        <section className="stat-grid">
          <article className="stat-card">
            <span>AVAILABLE</span>
            <strong>{summary.data.available}</strong>
          </article>
          <article className="stat-card">
            <span>PENDING</span>
            <strong>{summary.data.pending}</strong>
          </article>
          <article className="stat-card">
            <span>COMPLETED</span>
            <strong>{summary.data.completed}</strong>
          </article>
          <article className="stat-card">
            <span>MINIMUM</span>
            <strong>{summary.data.minimum}</strong>
          </article>
        </section>
      </StateMessage>
      <div className="two-column">
        <section className="panel">
          <div className="panel-heading">
            <h2>Request withdrawal</h2>
          </div>
          {message && (
            <div className="form-notice" role="status">
              {message}
            </div>
          )}
          <form className="auth-form" onSubmit={submit}>
            <label>
              Amount
              <input
                type="number"
                min={summary.data.minimum}
                max={summary.data.available}
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </label>
            <label>
              Payout method
              <select
                value={form.payoutMethod}
                onChange={(e) =>
                  setForm({ ...form, payoutMethod: e.target.value })
                }
              >
                <option value="bank">Bank transfer</option>
                <option value="paypal">PayPal</option>
              </select>
            </label>
            <label>
              Payout details
              <input
                value={form.payoutDetails}
                onChange={(e) =>
                  setForm({ ...form, payoutDetails: e.target.value })
                }
                placeholder="Account or wallet details"
                required
              />
            </label>
            <button className="primary-button" disabled={submitting}>
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
                      {new Date(item.createdAt).toLocaleDateString()} ·{" "}
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
