import React from 'react';
import SubAdminLayout from '../../components/sub-admin/layout/SubAdminLayout';
import { MapPin, ArrowRight } from 'lucide-react';
import './SubAdminPages.css';

// Dummy Data
const places = [
    { id: 1, name: 'Bandra West', issues: 5 },
    { id: 2, name: 'Andheri East', issues: 8 },
    { id: 3, name: 'Dadar Station Area', issues: 12 },
    { id: 4, name: 'Colaba Causeway', issues: 3 },
    { id: 5, name: 'Juhu Beach', issues: 6 },
    { id: 6, name: 'Powai Lake Promenade', issues: 4 },
];

const SubAdminCurrentRequestPage: React.FC = () => {
  return (
    <SubAdminLayout>
        <div className="sub-admin-page-container">
             <div className="page-header">
                <h2>Current Active Requests by Area</h2>
                <p>Select an area to view and manage active civic requests.</p>
            </div>
            <div className="places-grid">
                {places.map(place => (
                    <div key={place.id} className="place-card">
                        <div className="place-card-header">
                           <MapPin className="place-icon" />
                           <h3>{place.name}</h3>
                        </div>
                        <div className="place-card-body">
                           <p>
                                <span className="issue-count">{place.issues}</span> Active Issues
                           </p>
                        </div>
                        <div className="place-card-footer">
                            <button className="view-now-btn">
                                View Now <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </SubAdminLayout>
  );
};

export default SubAdminCurrentRequestPage;
