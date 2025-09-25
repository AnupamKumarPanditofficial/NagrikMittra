// src/pages/HomePage.tsx
import React from 'react';
import Header from '../components/layout/Header';
import CategoryCard from '../components/home/CategoryCard';
import './HomePage.css';
import heroImage from '../assets/images/hero-illustration.png';

const HomePage: React.FC = () => {
  return (
    <div className="homepage-container">
      <Header />
      <main className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Report an Issue,<br/>Make a Difference</h1>
          <p className="hero-subtitle">
            Join thousands of citizens making their communities better. Report issues, track progress, and see real change happen.
          </p>
          <div className="category-cards-container">
            <CategoryCard icon="🛣️" title="Roads" color="#ff7675" />
            <CategoryCard icon="💧" title="Water" color="#74b9ff" />
            <CategoryCard icon="🗑️" title="Waste" color="#55efc4" />
            <CategoryCard icon="⚡" title="Electricity" color="#ffeaa7" />
          </div>
        </div>
        <div className="hero-image-container">
           <img src={heroImage} alt="Community Illustration" className="hero-image" />
        </div>
      </main>
    </div>
  );
}

export default HomePage;