import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import { getAllRequests, updateRequestStatus } from '../../services/apiService';
import './AdminPages.css';

// Define the structure of the incoming data
interface SubAdminInfo {
    _id: string;
    name: string;
    centerName: string;
    email: string;
}

interface Request {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
    subAdmin: SubAdminInfo | null; // Can be null if sub-admin is deleted
}

const AdminRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await getAllRequests();
            setRequests(res.data);
            setError(null);
        } catch (err) {
            setError('Failed to load incoming requests.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleStatusUpdate = async (id: string, status: 'Approved' | 'Rejected') => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this request?`)) return;

        try {
            await updateRequestStatus(id, status);
            fetchRequests(); // Refresh list after update
        } catch (err) {
            alert('Failed to update status.');
            console.error(err);
        }
    };

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <h2>Manage Sub-Admin Requests</h2>
                    <p>Review, approve, or reject incoming requests from all centers.</p>
                </div>

                <div className="table-card card-glass">
                    <h3>Incoming Requests</h3>
                    {isLoading ? <p>Loading requests...</p> : error ? <p style={{color: '#ffb3b3'}}>{error}</p> :
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Center Name</th>
                                    <th>Request Title</th>
                                    <th style={{ minWidth: '300px' }}>Description</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.length > 0 ? requests.map(req => (
                                    <tr key={req._id}>
                                        {/* ADDED A CHECK HERE to prevent crashing */}
                                        <td>{req.subAdmin ? req.subAdmin.centerName : 'Deleted User'}</td>
                                        <td>{req.title}</td>
                                        <td>{req.description}</td>
                                        <td>{new Date(req.date).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`status-badge ${req.status.toLowerCase()}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td>
                                            {req.status === 'Pending' && (
                                                <div className="action-buttons">
                                                    <button className="btn-approve" onClick={() => handleStatusUpdate(req._id, 'Approved')}>Approve</button>
                                                    <button className="btn-reject" onClick={() => handleStatusUpdate(req._id, 'Rejected')}>Reject</button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} style={{textAlign: 'center'}}>No incoming requests found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminRequestsPage;

