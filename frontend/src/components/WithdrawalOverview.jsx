import { ArrowUpRight, CheckCircle2, Clock3, CircleDollarSign, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";

function WithdrawalOverview({ summary = {}, withdrawals = [] }) {
  const stats = [["AVAILABLE", summary.available, WalletCards, "Ready to withdraw"], ["PENDING", summary.pending, Clock3, "Awaiting review"], ["COMPLETED", summary.completed, CheckCircle2, "Paid out"], ["MINIMUM", summary.minimum, CircleDollarSign, "Required to request"]];
  return <section className="overview-card">
    <div className="panel-heading"><div><p className="eyebrow">WITHDRAWAL OVERVIEW</p><h2>Your cash-out status</h2></div><Link className="panel-link" to="/withdrawals">Manage withdrawals <ArrowUpRight size={14} /></Link></div>
    <section className="stat-grid">{stats.map(([label, value, Icon, hint]) => <article className="stat-card withdrawal-stat" key={label}><div className="stat-icon"><Icon size={16} /></div><span>{label}</span><strong>{value == null ? "—" : Number(value).toLocaleString()}</strong><small>{hint}</small></article>)}</section>
    {withdrawals.length > 0 && <div className="record-list">{withdrawals.map((item) => <div className="record-row" key={item._id}><div><strong>{item.referenceId}</strong><span>{new Date(item.createdAt).toLocaleDateString()} · {item.payoutMethod}</span></div><b>{item.status}</b></div>)}</div>}
  </section>;
}

export default WithdrawalOverview;
