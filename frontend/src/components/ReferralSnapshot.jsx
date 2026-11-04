import { Clipboard } from "lucide-react";

function ReferralSnapshot({ summary = {}, referrals = [], onCopy, copied = false }) {
  const link = summary.code ? `${window.location.origin}/register?ref=${summary.code}` : "Referral link unavailable";
  return <>
    <section className="referral-banner">
      <div><p className="eyebrow">YOUR REFERRAL LINK</p><strong>{link}</strong></div>
      <button className="secondary-button" type="button" onClick={onCopy} disabled={!summary.code}><Clipboard size={15} aria-hidden="true" />{copied ? "Copied" : "Copy link"}</button>
    </section>
    <section className="stat-grid">{[["TOTAL", summary.total], ["SUCCESSFUL", summary.successful], ["PENDING", summary.pending], ["REWARDS", summary.eligibleRewards ?? summary.rewardsEarned]].map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{Number(value) || 0}</strong></article>)}</section>
    {referrals.length > 0 && <div className="record-list">{referrals.map((item) => <div className="record-row" key={item._id}><div><strong>Referral</strong><span>{new Date(item.createdAt).toLocaleDateString()}</span></div><b>{item.status}</b></div>)}</div>}
  </>;
}

export default ReferralSnapshot;
