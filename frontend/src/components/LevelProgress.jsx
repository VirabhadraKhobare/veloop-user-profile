import { Trophy } from "lucide-react";

function LevelProgress({ progress }) {
  const level = progress || {};
  const percent = Math.max(0, Math.min(Number(level.progressPercent) || 0, 100));
  const currentXp = Number(level.currentXp) || 0;
  const nextLevelXp = Number(level.nextLevelXp) || 0;
  const xpRemaining = Number(level.xpRemaining) || 0;
  const nextLevel = level.nextLevel || (level.currentLevel || 1) + 1;

  return (
    <section className="level-card" aria-label="Level progress">
      <div className="level-copy">
        <div className="level-title-row"><p className="eyebrow">PROGRESSION PATH</p><span>{percent}% complete</span></div>
        <h2>Level {level.currentLevel || 1} <em>{level.currentLevelName || "Reward Level 01"}</em></h2>
        <p>{currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP <strong>·</strong> {xpRemaining.toLocaleString()} XP to level {nextLevel}</p>
        <div className="progress-track"><span style={{ width: `${percent}%` }} aria-label={`${percent}% complete`} /></div>
      </div>
      <div className="level-symbol"><Trophy size={23} aria-hidden="true" /><span>LVL<br /><strong>{level.currentLevel || 1}</strong></span></div>
    </section>
  );
}

export default LevelProgress;
