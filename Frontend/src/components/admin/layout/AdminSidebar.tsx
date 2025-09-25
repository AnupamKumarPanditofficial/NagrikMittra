import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import GroupIcon from '@mui/icons-material/Group';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import LogoutIcon from '@mui/icons-material/Logout'; // Import Logout Icon
import './AdminSidebar.css';

const AdminSidebar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the login token
    navigate('/'); // Redirect to the homepage
  };

  return (
    <div
      className={`admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div>
        <div className="sidebar-header">
          <h3>{isExpanded ? 'Project Civic' : 'PC'}</h3>
        </div>
        <nav className="sidebar-nav">
          <NavLink to="/admin/dashboard" className="nav-item">
            <DashboardIcon />
            {isExpanded && <span>Dashboard</span>}
          </NavLink>
          <NavLink to="/admin/sub-admins" className="nav-item">
            <GroupIcon />
            {isExpanded && <span>Sub-Admins</span>}
          </NavLink>
          <NavLink to="/admin/requests" className="nav-item">
            <DynamicFeedIcon />
            {isExpanded && <span>Requests</span>}
          </NavLink>
          <NavLink to="/admin/verify" className="nav-item">
            <FactCheckIcon />
            {isExpanded && <span>Verify</span>}
          </NavLink>
        </nav>
      </div>

      {/* Logout Button added at the bottom */}
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="nav-item logout-btn">
          <LogoutIcon />
          {isExpanded && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;