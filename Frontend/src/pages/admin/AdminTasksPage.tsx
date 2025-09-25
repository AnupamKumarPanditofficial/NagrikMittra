import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import { getComplaints } from '../../services/apiService';
import { Complaint } from '../../types';
import './AdminPages.css';

const AdminTasksPage: React.FC = () => {
    const [inProgressTasks, setInProgressTasks] = useState<Complaint[]>([]);
    const [pendingTasks, setPendingTasks] = useState<Complaint[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const allComplaints = await getComplaints();
                setInProgressTasks(allComplaints.filter(c => c.status === 'In Progress'));
                setPendingTasks(allComplaints.filter(c => c.status === 'Pending'));
            } catch (error) {
                console.error("Failed to fetch tasks:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, []);

    if (isLoading) {
        return <AdminLayout><div>Loading tasks...</div></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <h2>Task Management</h2>
                    <p>Monitor and manage all ongoing and pending civic issue tasks.</p>
                </div>

                <div className="content-grid-full">
                    {/* In Progress Tasks Card */}
                    <div className="table-card card-glass">
                        <h3>In Progress Tasks</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue Description</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inProgressTasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.description}</td>
                                        <td>{task.location}</td>
                                        <td><span className="status-badge in-progress">{task.status}</span></td>
                                        <td><button className="btn-secondary">View Details</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pending Tasks Card */}
                    <div className="table-card card-glass">
                        <h3>Pending Tasks</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Issue Description</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingTasks.map(task => (
                                    <tr key={task._id}>
                                        <td>{task.description}</td>
                                        <td>{task.location}</td>
                                        <td><span className="status-badge pending">{task.status}</span></td>
                                        <td><button className="btn-secondary">Assign</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTasksPage;