import React from 'react';
import './MyRewardPage.css';

const myReward = {
  user: "Anupam Kumar",
  avatar: "https://randomuser.me/api/portraits/men/65.jpg",
  points: 1100,
  cash: 850,
  badges: [
    { name: "Citizen Star", img: "https://img.icons8.com/color/48/000000/star.png" },
    { name: "Positive Leader", img: "https://img.icons8.com/color/48/000000/heart-with-ribbon.png" }
  ],
  recentActivity: "Received positive community feedback for civic improvement.",
  message: "Keep up the positive actions! More rewards are waiting for active contributors."
};

const MyRewardPage: React.FC = () => (
  <div className="reward-web-bg">
    <div className="reward-header">
      <button className="back-btn" onClick={() => window.history.back()}>← Back</button>
      <h1 className="reward-page-title">My Rewards & Achievements</h1>
    </div>
    <div className="reward-main-card">
      <div className="reward-details-flex">
        <img src={myReward.avatar} className="reward-avatar" alt={myReward.user} />
        <div className="reward-user-info">
          <div className="reward-user-name">{myReward.user}</div>
          <div className="reward-numbers-group">
            <div className="reward-info-block">
              <div className="reward-block-label">Points</div>
              <div className="reward-block-value">{myReward.points}</div>
            </div>
            <div className="reward-info-block">
              <div className="reward-block-label">Cash Earned</div>
              <div className="reward-block-value">₹{myReward.cash}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="reward-badges-row">
        {myReward.badges.map((b,i) => (
          <span className="reward-badge-item" key={i}>
            <img src={b.img} alt={b.name} />
            <span className="badge-label">{b.name}</span>
          </span>
        ))}
      </div>
      <div className="reward-activity-row">
        <span className="reward-activity-label">Recent Activity:</span>
        <span className="reward-activity-desc">{myReward.recentActivity}</span>
      </div>
      <div className="reward-message-banner">
        {myReward.message}
      </div>
    </div>
  </div>
);

export default MyRewardPage;
