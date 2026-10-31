
import { UserRound, Gem, Trophy, Wallet, ArrowRight } from "lucide-react";

const demoRewards = [
  { label: "VEs", value: "—", icon: Gem },
  { label: "SVE", value: "—", icon: Trophy },
  { label: "Gems", value: "—", icon: Gem },
  { label: "Tokens", value: "—", icon: Wallet },
];

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">VELO<span>op</span></div>
        <p className="nav-heading">ACCOUNT</p>
        <div className="nav-item active">My Profile</div>
        <div className="nav-item">Rewards</div>
        <div className="nav-item">Achievements</div>
        <div className="nav-item">Referrals</div>
        <div className="nav-item">Withdrawals</div>
      </aside>

      <section className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1>My Profile</h1>
          </div>
          <button className="icon-button" aria-label="Profile">
            <UserRound size={20} />
          </button>
        </header>

        <section className="welcome-card">
          <div className="avatar"><UserRound size={28} /></div>
          <div className="welcome-copy">
            <p className="eyebrow">MEMBER PROFILE</p>
            <h2>Welcome to VELOop</h2>
            <p>Your rewards journey starts here.</p>
          </div>
          <span className="member-badge">Member</span>
        </section>

        <div className="section-heading">
          <div>
            <h2>Your Rewards</h2>
            <p>Account balances will appear when connected to the backend.</p>
          </div>
        </div>

        <section className="reward-grid">
          {demoRewards.map(({ label, value, icon: Icon }) => (
            <article className="reward-card" key={label}>
              <div className="reward-icon"><Icon size={20} /></div>
              <p>{label}</p>
              <strong>{value}</strong>
              <span>Awaiting account data</span>
            </article>
          ))}
        </section>

        <section className="level-card">
          <div>
            <p className="eyebrow">LEVEL PROGRESS</p>
            <h2>Your next milestone</h2>
            <p>Progress will be calculated from verified account data.</p>
          </div>
          <div className="level-symbol"><Trophy size={26} /></div>
        </section>

        <button className="quick-action">
          <span><Wallet size={19} /> View withdrawals</span>
          <ArrowRight size={19} />
        </button>

        <p className="demo-note">
          Development preview · No real account data is connected
        </p>
      </section>
    </main>
  );
}

export default App;
