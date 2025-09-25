import React from 'react';
import SubAdminLayout from '../../components/sub-admin/layout/SubAdminLayout';
import { PieChart, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Pie, Cell } from 'recharts';
import { AlertCircle, CheckCircle, List } from 'lucide-react';
import './SubAdminPages.css';

// --- DUMMY DATA ---
const pieData = [
    { name: 'Resolved', value: 400 },
    { name: 'Pending', value: 150 },
    { name: 'In Progress', value: 250 },
];
const COLORS = ['#00C49F', '#FFBB28', '#0088FE'];

const barData = [
    { month: 'Jan', resolved: 30 },
    { month: 'Feb', resolved: 45 },
    { month: 'Mar', resolved: 60 },
    { month: 'Apr', resolved: 50 },
    { month: 'May', resolved: 70 },
    { month: 'Jun', resolved: 85 },
];

const StatCard = ({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) => (
    <div className="stat-card" style={{ borderLeftColor: color }}>
        <div className="stat-icon" style={{ backgroundColor: color }}>{icon}</div>
        <div className="stat-info">
            <h4>{title}</h4>
            <p>{value}</p>
        </div>
    </div>
);


const SubAdminDashboardPage: React.FC = () => {
    return (
        <SubAdminLayout>
            <div className="sub-admin-page-container">
                {/* --- STATS GRID --- */}
                <div className="stats-grid">
                    <StatCard title="Total Requests" value={800} icon={<List size={24} />} color="#0088FE" />
                    <StatCard title="Resolved This Month" value={70} icon={<CheckCircle size={24} />} color="#00C49F" />
                    <StatCard title="Pending Urgent Action" value={12} icon={<AlertCircle size={24} />} color="#FF8042" />
                </div>

                {/* --- CHARTS GRID --- */}
                <div className="charts-grid">
                    <div className="chart-card">
                        <h3>Requests Status Overview</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-card">
                        <h3>Monthly Resolved Requests</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={barData}>
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="resolved" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </SubAdminLayout>
    );
};

export default SubAdminDashboardPage;
