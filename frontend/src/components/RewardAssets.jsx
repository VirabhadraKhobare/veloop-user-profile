import { Gem, Trophy, Wallet } from "lucide-react";

const assets = [
  ["VEs", "ve", Gem, "Your available VELoop rewards."],
  ["SVEs", "sve", Trophy, "Silver VELoop rewards."],
  ["Gems", "gems", Gem, "Gems available for supported features."],
  ["Tokens", "tokens", Wallet, "Tokens available for eligible withdrawals."],
  ["XP", "xp", Trophy, "Experience used for level progression."],
];

function RewardAssets({ rewards = {} }) {
  return <section className="reward-grid" aria-label="Reward balances">{assets.map(([label, key, Icon, description]) => (
    <article className="reward-card" key={key}>
      <div className="reward-icon"><Icon size={20} aria-hidden="true" /></div>
      <p title={description}>{label}</p>
      <strong>{(Number(rewards[key]) || 0).toLocaleString()}</strong>
      <span>{description}</span>
    </article>
  ))}</section>;
}

export default RewardAssets;
