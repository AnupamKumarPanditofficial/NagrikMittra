import React from 'react';
import './HeroSection.css';
import PolymorphicCard from './PolymorphicCard';

const cards = [
  { name: 'Complain', path: '/user/complain' },
  { name: 'Check Status', path: '/user/check-status' },
  { name: 'People Poll', path: '/user/poll' },
  { name: 'Feedback', path: '/user/feedback' },
  { name: 'LeaderBoard', path: '/user/leaderboard' },
  { name: 'My Rewards', path: '/user/rewards' },
];

const HeroSection: React.FC = () => (
  <section className="hero-section-modern">
    <div className="hero-background"></div>
    <div className="hero-content">
      <div className="cards-grid-container">
        {cards.map((card, index) => (
          <div key={card.name} className="card-wrapper" style={{ animationDelay: `${index * 0.1}s` }}>
            <PolymorphicCard name={card.name} path={card.path} />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HeroSection;
