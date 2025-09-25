import React from 'react';
import { useNavigate } from 'react-router-dom';
import './UserHeader.css';

const UserHeader = () => {
  const navigate = useNavigate();

  return (
    <header className="header-3d">
      <nav className="user-nav">
        <div className="logo-3d" onClick={() => navigate('/user/profile')}>
          Nagrik<span>Mittra</span>
        </div>

        {/* CENTER SECTION WITH LOADER & LOCATION */}
        <div className="header-center-section">
          {/* 3D Spinning Cube Loader */}
          <div className="cube-loader-container">
            <div className="spinner">
              <div />
              <div />
              <div />
              <div />
              <div />
              <div />
            </div>
          </div>
        </div>

        {/* MODERN PROFILE SECTION */}
        <div className="modern-profile-section">
          <div 
            className="profile-avatar-container"
            onClick={() => navigate('/user/profile')}
          >
            <div className="profile-avatar">
              <div className="avatar-glow"></div>
              <div className="avatar-content">
                <span className="user-initial">N</span>
              </div>
              <div className="online-indicator"></div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default UserHeader;
