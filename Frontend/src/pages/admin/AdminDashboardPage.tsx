import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import StatCard from '../../components/admin/dashboard/StatCard';
import { getComplaints } from '../../services/apiService';
import { Complaint } from '../../types';
// NEW: Import Material-UI Icons
import ListAltIcon from '@mui/icons-material/ListAlt';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import '../admin/AdminPages.css';

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const complaints: Complaint[] = await getComplaints();
        const total = complaints.length;
        const pending = complaints.filter(c => c.status === 'Pending').length;
        const resolved = complaints.filter(c => c.status === 'Resolved').length;
        setStats({ total, pending, resolved });
      } catch (error) {
        console.error("Failed to fetch complaint stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return <AdminLayout><div>Loading...</div></AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="page-container">
        <div className="page-header">
            <h2>Dashboard Overview</h2>
            <p>A quick summary of the application's status.</p>
        </div>
        <div className="stats-grid">
            {/* Icons have been replaced with Material-UI components */}
            <StatCard title="Total Complaints" value={stats.total} icon={<ListAltIcon />} color="#3498db" />
            <StatCard title="Pending Complaints" value={stats.pending} icon={<ErrorOutlineIcon />} color="#f39c12" />
            <StatCard title="Resolved Complaints" value={stats.resolved} icon={<CheckCircleOutlineIcon />} color="#2ecc71" />
        </div>
        {/* We will add 3D charts and other analytics here later */}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;