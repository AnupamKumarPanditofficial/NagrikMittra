import React, { useState, useEffect } from 'react';
import SubAdminLayout from '../../components/sub-admin/layout/SubAdminLayout';
import { createRequest, getMyRequests } from '../../services/apiService';
import { PlusCircle, Send, Clock, Check, X } from 'lucide-react';
import './SubAdminPages.css';

interface Request {
    _id: string;
    title: string;
    description: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    date: string;
}

const SubAdminMessagesPage: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRequests = async () => {
        try {
            setIsLoading(true);
            const res = await getMyRequests();
            setRequests(res.data);
        } catch (err) {
            setError('Failed to load requests.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !description) {
            alert('Please fill in both the title and description.');
            return;
        }
        try {
            await createRequest({ title, description });
            setTitle('');
            setDescription('');
            fetchRequests(); // Refresh the list
            alert('Request sent successfully!');
        } catch (err) {
            alert('Failed to send request.');
            console.error(err);
        }
    };
    
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Approved': return <Check size={18} className="status-icon approved" />;
            case 'Rejected': return <X size={18} className="status-icon rejected" />;
            default: return <Clock size={18} className="status-icon pending" />;
        }
    };

    return (
        <SubAdminLayout>
            <div className="sub-admin-page-container">
                <div className="page-header">
                    <h2>Request Center</h2>
                    <p>Send new requests to the Main Admin and track their status.</p>
                </div>

                <div className="request-grid">
                    {/* New Request Form */}
                    <div className="form-card-request">
                        <h3><PlusCircle size={20} /> Create New Request</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Request Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g., Need more cleaning supplies"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Description</label>
                                <textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    placeholder="Provide details about your request..."
                                    required
                                ></textarea>
                            </div>
                            <button type="submit" className="btn-send-request">
                                <Send size={16} /> Send Request
                            </button>
                        </form>
                    </div>

                    {/* Sent Requests List */}
                    <div className="table-card-request">
                        <h3><Clock size={20} /> Your Sent Requests</h3>
                        <div className="request-list">
                            {isLoading ? <p>Loading...</p> : error ? <p>{error}</p> :
                                requests.length > 0 ? requests.map(req => (
                                    <div key={req._id} className={`request-item status-${req.status.toLowerCase()}`}>
                                        <div className="request-item-header">
                                            <h4>{req.title}</h4>
                                            <span className={`status-pill ${req.status.toLowerCase()}`}>
                                                {getStatusIcon(req.status)} {req.status}
                                            </span>
                                        </div>
                                        <p className="request-desc">{req.description}</p>
                                        <p className="request-date">
                                            Sent on: {new Date(req.date).toLocaleDateString()}
                                        </p>
                                    </div>
                                )) : <p>You haven't sent any requests yet.</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </SubAdminLayout>
    );
};

export default SubAdminMessagesPage;

