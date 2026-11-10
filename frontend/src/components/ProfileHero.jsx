import { ArrowUpRight, ShieldCheck, Sparkles, Trophy, UserRound } from "lucide-react";

function ProfileHero({ profile, progress = {}, onEdit, editing = false }) {
  const memberStatus = profile?.status === "active" ? "Active member" : profile?.status || "Member";
  const currentLevel = progress.currentLevel || 1;
  const currentXp = Number(progress.currentXp) || 0;
  const nextLevelXp = Number(progress.nextLevelXp) || 1000;
  const percent = Math.max(0, Math.min(Number(progress.progressPercent) || 0, 100));

  return (
    <section className="profile-hero">
      <div className="hero-orbit hero-orbit-one" />
      <div className="hero-orbit hero-orbit-two" />
      <div className="profile-hero-content">
        <div className="profile-avatar">
          {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <UserRound size={30} aria-hidden="true" />}
          <span className="avatar-status" aria-label="Active status" />
        </div>
        <div className="profile-intro">
          <div className="profile-kicker">Good to see you,</div>
          <h2>{profile?.fullName || "Your profile"}</h2>
          <span className="profile-sample-badge">Sample profile</span>
          <p>{profile?.username ? `@${profile.username}` : "Username unavailable"}{profile?.email ? `  ·  ${profile.email}` : ""}</p>
          <div className="profile-meta">
            <span><ShieldCheck size={14} /> Level {String(currentLevel).padStart(2, "0")} · {progress.currentLevelName || "Reward Explorer"}</span>
            <span><Sparkles size={14} /> Account {memberStatus.toLowerCase()}</span>
          </div>
          <div className="hero-progress-copy"><strong>Progress to Level {currentLevel + 1}</strong><span>{currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span></div>
          <div className="hero-progress-track"><span style={{ width: `${percent}%` }} /></div>
          <small>{Number(progress.xpRemaining || nextLevelXp).toLocaleString()} XP to your next level</small>
        </div>
        <div className="profile-hero-actions">
          <div className="hero-stat"><span><Trophy size={14} /> Current level</span><strong>Q{String(currentLevel).padStart(2, "0")}</strong><small>{progress.currentLevelName || "Reward Explorer"}</small></div>
          <div className="hero-stat hero-stat-plain"><span><Sparkles size={14} /> Experience</span><strong>{currentXp.toLocaleString()}</strong><small>XP earned</small></div>
          {onEdit && <button className="hero-edit-button" type="button" onClick={onEdit}>{editing ? "Close editor" : "Edit profile"} <ArrowUpRight size={16} /></button>}
        </div>
      </div>
    </section>
  );
}

export default ProfileHero;
