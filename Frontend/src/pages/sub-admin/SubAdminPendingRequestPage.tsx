import React from 'react';
import SubAdminLayout from '../../components/sub-admin/layout/SubAdminLayout';
import './SubAdminPages.css';

// Dummy Data for pending requests
const pendingRequests = [
    { id: 'REQ-001', area: 'Bandra West', issue: 'Broken Streetlight', date: '2025-09-10', status: 'Pending Assignment' },
    { id: 'REQ-003', area: 'Andheri East', issue: 'Pothole on main road', date: '2025-09-08', status: 'Pending Assignment' },
    { id: 'REQ-005', area: 'Dadar Station Area', issue: 'Garbage overflow', date: '2025-09-05', status: 'Awaiting Resources' },
    { id: 'REQ-008', area: 'Juhu Beach', issue: 'Blocked drainage', date: '2025-09-01', status: 'Pending Assignment' },
];

const SubAdminPendingRequestPage: React.FC = () => {
  return (
    <SubAdminLayout>
         <div className="sub-admin-page-container">
            <div className="page-header">
                <h2>All Pending Requests</h2>
                <p>A history of all civic issues that are yet to be resolved.</p>
            </div>
            <div className="table-card-wrapper">
                 <table className="data-table-sub">
                    <thead>
                        <tr>
                            <th>Request ID</th>
                            <th>Area</th>
                            <th>Issue Details</th>
                            <th>Date Submitted</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pendingRequests.map(req => (
                            <tr key={req.id}>
                                <td>{req.id}</td>
                                <td>{req.area}</td>
                                <td>{req.issue}</td>
                                <td>{req.date}</td>
                                <td><span className="status-badge-pending">{req.status}</span></td>
                                <td><button className="btn-secondary-sub">View Details</button></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </SubAdminLayout>
  );
};

export default SubAdminPendingRequestPage;
