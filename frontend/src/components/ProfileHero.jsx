import { ArrowUpRight, CalendarDays, ShieldCheck, UserRound } from "lucide-react";

function ProfileHero({ profile, onEdit, editing = false }) {
  const memberStatus = profile?.status === "active" ? "Active member" : profile?.status || "Member";

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
          <div className="profile-kicker"><span className="live-dot" /> MEMBER PROFILE</div>
          <h2>{profile?.fullName || "Your profile"}</h2>
          <p>{profile?.username ? `@${profile.username}` : "Username unavailable"}{profile?.email ? `  ·  ${profile.email}` : ""}</p>
          <div className="profile-meta">
            <span><ShieldCheck size={14} /> {memberStatus}</span>
            {profile?.memberSince && <span><CalendarDays size={14} /> Member since {new Date(profile.memberSince).toLocaleDateString(undefined, { month: "short", year: "numeric" })}</span>}
          </div>
        </div>
        <div className="profile-hero-actions">
          <span className="hero-rank">VELoop member <strong>01</strong></span>
          {onEdit && <button className="hero-edit-button" type="button" onClick={onEdit}>{editing ? "Close editor" : "Edit profile"} <ArrowUpRight size={16} /></button>}
        </div>
      </div>
    </section>
  );
}

export default ProfileHero;
