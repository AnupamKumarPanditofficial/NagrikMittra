import React from 'react';
import SubAdminHeader from './SubAdminHeader';
import SubAdminSidebar from './SubAdminSidebar';
import './SubAdminLayout.css';

interface SubAdminLayoutProps {
  children: React.ReactNode;
}

const SubAdminLayout: React.FC<SubAdminLayoutProps> = ({ children }) => {
  return (
    <div className="sub-admin-layout">
      <SubAdminSidebar />
      <main className="sub-admin-main-content">
        <SubAdminHeader />
        <div className="content-area">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SubAdminLayout;