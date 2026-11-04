import { UserRound } from "lucide-react";

function ProfileHero({ profile, onEdit, editing = false }) {
  const memberStatus = profile?.status === "active" ? "Active member" : profile?.status || "Member";

  return (
    <section className="welcome-card">
      <div className="avatar">
        {profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" /> : <UserRound size={28} aria-hidden="true" />}
      </div>
      <div className="welcome-copy">
        <p className="eyebrow">MEMBER PROFILE</p>
        <h2>Welcome, {profile?.fullName || "there"}</h2>
        <p>{profile?.username ? `@${profile.username}` : "Username unavailable"}{profile?.email ? ` · ${profile.email}` : ""}</p>
      </div>
      <span className="member-badge">{memberStatus}</span>
      {onEdit && <button className="secondary-button" type="button" onClick={onEdit}>{editing ? "Cancel" : "Edit profile"}</button>}
    </section>
  );
}

export default ProfileHero;
