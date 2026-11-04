import { CheckCircle2, Trophy, XCircle } from "lucide-react";

function AchievementCard({ achievement, progress }) {
  const target = Math.max(Number(achievement?.target) || 0, 1);
  const current = Math.max(Number(progress?.progress) || 0, 0);
  const unlocked = Boolean(progress?.unlockedAt);
  const percent = unlocked ? 100 : Math.min(Math.round((current / target) * 100), 100);

  return <article className={`achievement-card ${unlocked ? "unlocked" : ""}`}>
    <div className="achievement-icon"><Trophy size={21} aria-hidden="true" /></div>
    <div>
      <span className="category-label">{achievement?.category || "General"}</span>
      <h3>{achievement?.name || "Achievement"}</h3>
      <p>{achievement?.description || "Keep progressing to unlock this achievement."}</p>
      <div className="progress-track"><span style={{ width: `${percent}%` }} /></div>
      <small>{unlocked ? `Unlocked ${new Date(progress.unlockedAt).toLocaleDateString()}` : `${current} / ${Number(achievement?.target) || 0}`}</small>
    </div>
    {unlocked ? <CheckCircle2 className="success-icon" aria-label="Unlocked" /> : <XCircle className="muted-icon" aria-label="Locked" />}
  </article>;
}

export default AchievementCard;
