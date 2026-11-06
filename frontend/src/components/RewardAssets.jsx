import { Gem, Sparkles, Trophy, Wallet } from "lucide-react";

const assets = [
  ["VEs", "ve", Gem, "Your available VELoop rewards.", "violet"],
  ["SVEs", "sve", Trophy, "Silver VELoop rewards.", "blue"],
  ["Gems", "gems", Sparkles, "Gems available for supported features.", "pink"],
  ["Tokens", "tokens", Wallet, "Tokens available for eligible withdrawals.", "gold"],
  ["XP", "xp", Trophy, "Experience used for level progression.", "green"],
];

function RewardAssets({ rewards = {} }) {
  return <section className="reward-grid" aria-label="Reward balances">{assets.map(([label, key, Icon, description, tone]) => (
    <article className={`reward-card reward-${tone}`} key={key}>
      <div className="reward-card-top"><div className="reward-icon"><Icon size={18} aria-hidden="true" /></div><span className="balance-label">BALANCE</span></div>
      <p title={description}>{label}</p>
      <strong>{(Number(rewards[key]) || 0).toLocaleString()}</strong>
      <span>{description}</span>
    </article>
  ))}</section>;
}

export default RewardAssets;
