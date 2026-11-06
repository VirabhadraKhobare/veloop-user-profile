import { ArrowDownLeft, ArrowUpRight, Clock3 } from "lucide-react";

function RecentActivity({ items = [] }) {
  return <section className="panel activity-panel">
    <div className="panel-heading"><div><p className="eyebrow">ACCOUNT PULSE</p><h2>Recent activity</h2></div><span className="activity-window"><Clock3 size={14} /> Last 30 days</span></div>
    {items.length === 0 ? <div className="state-message">No recent activity yet.</div> : <div className="record-list">
      {items.map((item) => <div className="record-row" key={item.id || item._id}>
        <div className="activity-record"><span className={`activity-icon ${Number(item.amount) >= 0 ? "is-positive" : "is-negative"}`}>{Number(item.amount) >= 0 ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}</span><div><strong>{item.description || "Account activity"}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"} · {item.status || "completed"}</span></div></div>
        <b className={Number(item.amount) >= 0 ? "positive" : "negative"}>{Number(item.amount) >= 0 ? "+" : ""}{Number(item.amount || 0).toLocaleString()} {(item.asset || "").toUpperCase()}</b>
      </div>)}
    </div>}
  </section>;
}

export default RecentActivity;
