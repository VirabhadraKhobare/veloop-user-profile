function WithdrawalOverview({ summary = {}, withdrawals = [] }) {
  const stats = [["AVAILABLE", summary.available], ["PENDING", summary.pending], ["COMPLETED", summary.completed], ["MINIMUM", summary.minimum]];
  return <>
    <section className="stat-grid">{stats.map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{Number(value) || 0}</strong></article>)}</section>
    {withdrawals.length > 0 && <div className="record-list">{withdrawals.map((item) => <div className="record-row" key={item._id}><div><strong>{item.referenceId}</strong><span>{new Date(item.createdAt).toLocaleDateString()} · {item.payoutMethod}</span></div><b>{item.status}</b></div>)}</div>}
  </>;
}

export default WithdrawalOverview;
