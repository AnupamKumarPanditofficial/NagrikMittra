import React from 'react';
import './UserDashboardPage.css';
import UserHeader from '../../components/user/dashboard/UserHeader';
import LocationDisplay from '../../components/user/dashboard/LocationDisplay';
import HeroSection from '../../components/user/dashboard/HeroSection';

const UserDashboardPage: React.FC = () => {
  return (
    <div className="user-dashboard-page">
      <UserHeader />
      <LocationDisplay />
      <HeroSection />
    </div>
  );
};

export default UserDashboardPage;
