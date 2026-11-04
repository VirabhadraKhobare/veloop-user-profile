import { ShieldCheck, Sparkles } from "lucide-react";

function Login({ children }) {
  return (
    <main className="auth-page-shell">
      <div className="auth-brand-panel">
        <div className="brand">VELO<span>op</span></div>
        <p className="eyebrow">REWARD WITH PURPOSE</p>
        <h1>Turn every action into progress.</h1>
        <p>Track your rewards, unlock achievements, and grow with the VELOop community.</p>
        <div className="auth-benefits">
          <span><Sparkles size={16} /> Personalized rewards</span>
          <span><ShieldCheck size={16} /> Secure account access</span>
        </div>
      </div>
      {children}
    </main>
  );
}

export default Login;
