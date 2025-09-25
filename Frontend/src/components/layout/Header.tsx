// src/components/layout/Header.tsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="header">
      <Link to="/" className="logo-container">
        <span className="logo-text">🌐 NagrikMittra</span>
      </Link>
      <nav className="nav-links">
        <Link to="/auth">Submit Complaint</Link>
        <Link to="/auth">Track Status</Link>
      </nav>
      <div className="auth-buttons">
        <button onClick={() => navigate('/auth')} className="btn btn-login">Login</button>
        <button onClick={() => navigate('/auth')} className="btn btn-register">Register</button>
      </div>
    </header>
  );
}

export default Header;