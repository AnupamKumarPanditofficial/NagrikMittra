import React from 'react';
import './LeaderboardPage.css';

// Dummy leaderboard data
type UserStat = {
  id: number;
  name: string;
  avatar: string;
  stat: number;
  extra?: string;
};

const userRank = 7;
const userStats = {
  name: 'Anupam Kumar',
  avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  complaints: 27,
  polls: 19,
  positive: 16,
  false: 2,
  rewards: 940,
};

const leaderboards: { title: string; type: string; data: UserStat[]; unit: string }[] = [
  {
    title: "Most Complaint Reports",
    type: "complaints",
    unit: "complaints",
    data: [
      { id: 1, name: "Priya Shah", avatar: "https://randomuser.me/api/portraits/women/24.jpg", stat: 39 },
      { id: 2, name: "Amit Kumar", avatar: "https://randomuser.me/api/portraits/men/12.jpg", stat: 36 },
      { id: 3, name: "Mohit Rana", avatar: "https://randomuser.me/api/portraits/men/33.jpg", stat: 34 },
      { id: 7, name: "Anupam Kumar", avatar: "https://randomuser.me/api/portraits/men/65.jpg", stat: 27 },
    ],
  },
  {
    title: "Most Active in People Poll",
    type: "polls",
    unit: "votes",
    data: [
      { id: 3, name: "Mohit Rana", avatar: "https://randomuser.me/api/portraits/men/33.jpg", stat: 29 },
      { id: 1, name: "Priya Shah", avatar: "https://randomuser.me/api/portraits/women/24.jpg", stat: 26 },
      { id: 7, name: "Anupam Kumar", avatar: "https://randomuser.me/api/portraits/men/65.jpg", stat: 19 },
    ],
  },
  {
    title: "Most Positive Responses",
    type: "positive",
    unit: "positive",
    data: [
      { id: 2, name: "Amit Kumar", avatar: "https://randomuser.me/api/portraits/men/12.jpg", stat: 24 },
      { id: 7, name: "Anupam Kumar", avatar: "https://randomuser.me/api/portraits/men/65.jpg", stat: 16 },
      { id: 1, name: "Priya Shah", avatar: "https://randomuser.me/api/portraits/women/24.jpg", stat: 13 },
    ],
  },
  {
    title: "Most False Responses",
    type: "false",
    unit: "false",
    data: [
      { id: 10, name: "Shubham", avatar: "https://randomuser.me/api/portraits/men/89.jpg", stat: 6 },
      { id: 7, name: "Anupam Kumar", avatar: "https://randomuser.me/api/portraits/men/65.jpg", stat: 2 },
    ],
  },
  {
    title: "Top Reward Earners",
    type: "rewards",
    unit: "₹",
    data: [
      { id: 13, name: "Manisha S", avatar: "https://randomuser.me/api/portraits/women/88.jpg", stat: 1200 },
      { id: 7, name: "Anupam Kumar", avatar: "https://randomuser.me/api/portraits/men/65.jpg", stat: 940 },
      { id: 3, name: "Mohit Rana", avatar: "https://randomuser.me/api/portraits/men/33.jpg", stat: 910 },
    ],
  },
];

const LeaderboardPage: React.FC = () => {
  return (
    <div className="leaderboard-bg">
      <div className="user-rank-card">
        <img src={userStats.avatar} className="user-rank-avatar" alt={userStats.name} />
        <div>
          <div className="user-rank-name">{userStats.name}</div>
          <div className="user-rank-rank">Your Rank: <span className="rank-num">#{userRank}</span></div>
          <div className="user-rank-stats">
            <span>Complaints: {userStats.complaints}</span>
            <span>Poll Votes: {userStats.polls}</span>
            <span>Positive: {userStats.positive}</span>
            <span>False: {userStats.false}</span>
            <span>Rewards: ₹{userStats.rewards}</span>
          </div>
        </div>
      </div>
      {leaderboards.map(board => (
        <div className="board-section" key={board.type}>
          <div className="board-title">{board.title}</div>
          <div className="board-carousel">
            {board.data.map(u => (
              <div className={`board-card${u.id===userRank ? " highlight" : ""}`} key={u.id}>
                <img src={u.avatar} className="board-avatar" alt={u.name} />
                <div className="board-user">{u.name}{u.id===userRank && ' (You)'}</div>
                <div className="board-stat">
                  {board.unit==='₹' ? '₹' : ''}{u.stat} {board.unit!=='₹' && board.unit}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LeaderboardPage;
