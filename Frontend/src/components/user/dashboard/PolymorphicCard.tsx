import React from 'react';
import './PolymorphicCard.css';

interface Props {
  name: string;
  path: string;
}

const icons: {[key:string]: string} = {
  'Complain': '⚠️',
  'Check Status': '✔️',
  'People Poll': '📊',
  'Feedback': '💬',
  'LeaderBoard': '🏆',
  'My Rewards': '💰',
};

const descriptions: {[key:string]: string} = {
  'Complain': 'Report civic issues quickly',
  'Check Status': 'Track your complaints',
  'People Poll': 'Vote on community matters',
  'Feedback': 'Share your experience',
  'LeaderBoard': 'Top contributors',
  'My Rewards': 'See your rewards',
};

const PolymorphicCard: React.FC<Props> = ({ name, path }) => (
  <a className="floating-glass-card card-nav-link" href={path}>
    <span className="card-glow" />
    <div className="card-content">
      <div className="icon-container">
        <div className="card-icon" style={{ fontSize: 48 }}>
          {icons[name] || '❔'}
        </div>
      </div>
      <div className="card-title">{name}</div>
      <div className="card-description">{descriptions[name] || ''}</div>
      <button className="animated-button">
        <span className="circle" />
        <span className="text">ENTRY</span>
        <svg className="arr-1" viewBox="0 0 16 16"><path d="M4 8h8M8 4l4 4-4 4"/></svg>
        <svg className="arr-2" viewBox="0 0 16 16"><path d="M4 8h8M8 4l4 4-4 4"/></svg>
      </button>
    </div>
  </a>
);

export default PolymorphicCard;
