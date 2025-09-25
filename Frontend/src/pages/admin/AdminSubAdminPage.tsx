import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/layout/AdminLayout';
import { createSubAdmin, getSubAdmins, updateSubAdminStatus } from '../../services/apiService';
import './AdminPages.css';

interface SubAdmin {
    _id: string;
    email: string;
    centerName: string;
    status: 'Active' | 'Inactive';
}

const AdminSubAdminPage: React.FC = () => {
    const [subAdmins, setSubAdmins] = useState<SubAdmin[]>([]);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [centerName, setCenterName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);

    const fetchSubAdmins = async () => {
        try {
            setIsLoading(true);
            const data = await getSubAdmins();
            setSubAdmins(data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch sub-admins:", err);
            setError("Could not load sub-admin data. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSubAdmins();
    }, []);

    const handleCreateSubAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!email || !password || !centerName) {
            setFormError("All fields are required.");
            return;
        }

        try {
            await createSubAdmin({ email, password, centerName });
            setEmail('');
            setPassword('');
            setCenterName('');
            await fetchSubAdmins(); // Refresh the list
            alert('New sub-admin created successfully!');
        } catch (err: any) {
            console.error("Failed to create sub-admin:", err);
            const errorMessage = err.response?.data?.msg || "An unexpected error occurred.";
            setFormError(errorMessage);
        }
    };

    const handleToggleStatus = async (adminId: string, currentStatus: 'Active' | 'Inactive') => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        // Using a simple confirmation dialog in English
        if (window.confirm(`Are you sure you want to set this sub-admin to "${newStatus}"?`)) {
            try {
                await updateSubAdminStatus(adminId, newStatus);
                await fetchSubAdmins(); // Refresh the list after update
                alert(`Sub-admin status successfully updated to "${newStatus}".`);
            } catch (err: any) {
                console.error("Failed to update status:", err);
                const errorMessage = err.response?.data?.msg || "Could not update status.";
                alert(`Error: ${errorMessage}`);
            }
        }
    };

    return (
        <AdminLayout>
            <div className="page-container">
                <div className="page-header">
                    <h2>Create & Manage Sub-Admins</h2>
                    <p>Generate and control credentials for sub-admin centers.</p>
                </div>

                <div className="content-grid">
                    <div className="form-card card-glass">
                        <h3>Generate New Credentials</h3>
                        <form onSubmit={handleCreateSubAdmin}>
                            <div className="form-group">
                                <label htmlFor="email">Email ID</label>
                                <input 
                                    type="email" 
                                    id="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input 
                                    type="password" 
                                    id="password" 
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required 
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="centerName">Center Name</label>
                                <input 
                                    type="text" 
                                    id="centerName" 
                                    value={centerName}
                                    onChange={(e) => setCenterName(e.target.value)}
                                    required 
                                />
                            </div>
                            {formError && <p style={{ color: '#ffb3b3', marginBottom: '1rem', fontSize: '0.9rem' }}>{formError}</p>}
                            <button type="submit" className="btn-primary">Generate</button>
                        </form>
                    </div>

                    <div className="table-card card-glass">
                        <h3>Existing Sub-Admins</h3>
                        {isLoading ? (
                            <p>Loading...</p>
                        ) : error ? (
                            <p style={{ color: '#ffb3b3' }}>{error}</p>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Email ID</th>
                                        <th>Center Name</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {subAdmins.length > 0 ? subAdmins.map(admin => (
                                        <tr key={admin._id}>
                                            <td>{admin.email}</td>
                                            <td>{admin.centerName}</td>
                                            <td><span className={`status-badge ${admin.status.toLowerCase()}`}>{admin.status}</span></td>
                                            <td>
                                                <button 
                                                    className="btn-secondary" 
                                                    onClick={() => handleToggleStatus(admin._id, admin.status)}
                                                >
                                                    {admin.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center' }}>No sub-admins found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSubAdminPage;

