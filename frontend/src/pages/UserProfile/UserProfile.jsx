import ProfileHero from "../../components/ProfileHero";
import RewardAssets from "../../components/RewardAssets";
import LevelProgress from "../../components/LevelProgress";
import RecentActivity from "../../components/RecentActivity";

function UserProfile({ profile, rewards, levelProgress, activity, onEdit, editing }) {
  return (
    <>
      <ProfileHero profile={profile} onEdit={onEdit} editing={editing} />
      <RewardAssets rewards={rewards} />
      <LevelProgress progress={levelProgress} />
      <RecentActivity items={activity} />
    </>
  );
}

export default UserProfile;
