import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BarChart2, CheckSquare, Send, Clock, LogOut } from 'lucide-react';
import './SubAdminLayout.css';

const SubAdminSidebar: React.FC = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (window.confirm("Are you sure you want to log out?")) {
            localStorage.removeItem('authToken');
            navigate('/');
        }
    };

    return (
        <div
            className={`sub-admin-sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div>
                <div className="sidebar-header">
                    <h3>{isExpanded ? 'Center Panel' : 'CP'}</h3>
                </div>
                <nav className="sidebar-nav">
                    <NavLink to="/sub-admin/dashboard" className="nav-item">
                        <BarChart2 size={20} />
                        {isExpanded && <span>Dashboard</span>}
                    </NavLink>
                    <NavLink to="/sub-admin/current-requests" className="nav-item">
                        <CheckSquare size={20} />
                        {isExpanded && <span>Current Requests</span>}
                    </NavLink>
                    <NavLink to="/sub-admin/pending-requests" className="nav-item">
                        <Clock size={20} />
                        {isExpanded && <span>Pending Requests</span>}
                    </NavLink>
                    <NavLink to="/sub-admin/messages" className="nav-item">
                        <Send size={20} />
                        {isExpanded && <span>Admin Messages</span>}
                    </NavLink>
                </nav>
            </div>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="nav-item logout-btn">
                    <LogOut size={20} />
                    {isExpanded && <span>Logout</span>}
                </button>
            </div>
        </div>
    );
};

export default SubAdminSidebar;

