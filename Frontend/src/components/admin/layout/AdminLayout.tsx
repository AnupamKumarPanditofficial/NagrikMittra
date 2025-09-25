import React, { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; 
import type { Engine } from "@tsparticles/engine";
import particlesOptions from './particles.json';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

// 1. DEFINE THE PROPS TYPE
interface AdminLayoutProps {
  children: React.ReactNode;
}

// 2. APPLY THE PROPS TYPE TO THE COMPONENT
const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadFull(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  if (init) {
    return (
      <div className="admin-layout">
        <Particles
          id="tsparticles"
          options={particlesOptions as any}
        />
        <AdminSidebar />
        <main className="admin-main-content">
          <AdminHeader />
          <div className="content-area">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return <></>;
};

export default AdminLayout;