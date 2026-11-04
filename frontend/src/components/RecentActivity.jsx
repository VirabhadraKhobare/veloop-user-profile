function RecentActivity({ items = [] }) {
  return <section className="panel">
    <div className="panel-heading"><h2>Recent activity</h2></div>
    {items.length === 0 ? <div className="state-message">No recent activity yet.</div> : <div className="record-list">
      {items.map((item) => <div className="record-row" key={item.id || item._id}>
        <div><strong>{item.description || "Account activity"}</strong><span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"} · {item.status || "completed"}</span></div>
        <b className={Number(item.amount) >= 0 ? "positive" : "negative"}>{Number(item.amount) >= 0 ? "+" : ""}{Number(item.amount || 0).toLocaleString()} {(item.asset || "").toUpperCase()}</b>
      </div>)}
    </div>}
  </section>;
}

export default RecentActivity;
