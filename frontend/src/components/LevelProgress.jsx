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
      <div>
        <p className="eyebrow">LEVEL PROGRESS</p>
        <h2>Level {level.currentLevel || 1} · {level.currentLevelName || "Reward Level 01"}</h2>
        <p>{currentXp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP · {xpRemaining.toLocaleString()} XP to level {nextLevel}</p>
        <div className="progress-track"><span style={{ width: `${percent}%` }} aria-label={`${percent}% complete`} /></div>
      </div>
      <div className="level-symbol"><Trophy size={26} aria-hidden="true" /></div>
    </section>
  );
}

export default LevelProgress;
