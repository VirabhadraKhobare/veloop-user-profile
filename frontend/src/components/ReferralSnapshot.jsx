import { Clipboard, Copy, UsersRound } from "lucide-react";

function ReferralSnapshot({ summary = {}, referrals = [], onCopy, copied = false, compact = false }) {
  const link = summary.code ? `${window.location.origin}/register?ref=${summary.code}` : "Referral link unavailable";
  const content = <>
    <div className="referral-code-box"><div><span>Your referral code</span><strong>{summary.code || "Unavailable"}</strong></div><button className="copy-button" type="button" onClick={onCopy} disabled={!summary.code} aria-label="Copy referral code"><Copy size={14} />{copied ? "Copied" : "Copy"}</button></div>
    <div className="referral-stats">{[["INVITED", summary.total], ["SUCCESSFUL", summary.successful], ["BONUS XP", summary.eligibleRewards ?? summary.rewardsEarned]].map(([label, value]) => <div key={label}><strong>{Number(value) || 0}</strong><span>{label}</span></div>)}</div>
  </>;
  if (compact) return <section className="dashboard-card referral-card"><div className="dashboard-card-heading"><div><p className="eyebrow">GROW TOGETHER</p><h2>Referral snapshot</h2></div><UsersRound size={22} /></div>{content}</section>;
  return <><section className="referral-banner"><div><p className="eyebrow">YOUR REFERRAL LINK</p><strong>{link}</strong></div><button className="secondary-button" type="button" onClick={onCopy} disabled={!summary.code}><Clipboard size={15} aria-hidden="true" />{copied ? "Copied" : "Copy link"}</button></section><section className="stat-grid">{[["TOTAL", summary.total], ["SUCCESSFUL", summary.successful], ["PENDING", summary.pending], ["REWARDS", summary.eligibleRewards ?? summary.rewardsEarned]].map(([label, value]) => <article className="stat-card" key={label}><span>{label}</span><strong>{Number(value) || 0}</strong></article>)}</section>{referrals.length > 0 && <div className="record-list">{referrals.map((item) => <div className="record-row" key={item._id}><div><strong>Referral</strong><span>{new Date(item.createdAt).toLocaleDateString()}</span></div><b>{item.status}</b></div>)}</div>}</>;
}

export default ReferralSnapshot;
