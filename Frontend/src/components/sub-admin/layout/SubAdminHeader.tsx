import React, { useState, useEffect } from 'react';
import { Bell, User, X } from 'lucide-react';
import { getUserProfile, updateSubAdminProfile } from '../../../services/apiService';
import './SubAdminLayout.css';

// Define the types for our user and props
interface SubAdminUser {
    name: string;
    profilePictureUrl: string;
}

interface ProfileModalProps {
    user: SubAdminUser;
    onClose: () => void;
    onUpdate: (user: SubAdminUser) => void;
}


// Profile Modal Component with proper types
const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onUpdate }) => {
    const [name, setName] = useState(user.name);
    const [profilePicUrl, setProfilePicUrl] = useState(user.profilePictureUrl || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const response = await updateSubAdminProfile({ name, profilePictureUrl: profilePicUrl });
            onUpdate(response.data.profile); // Update parent state
            onClose(); // Close modal
        } catch (error) {
            console.error("Profile update failed:", error);
            alert("Error: Profile could not be updated.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="profile-modal-overlay">
            <div className="profile-modal">
                <div className="modal-header">
                    <h3>Edit Your Profile</h3>
                    <button onClick={onClose} className="close-button"><X size={20} /></button>
                </div>
                <form onSubmit={handleSave}>
                    <div className="profile-picture-section">
                        <img 
                            src={profilePicUrl || `https://placehold.co/100x100/3b82f6/FFFFFF?text=${name ? name.charAt(0) : 'U'}`} 
                            alt="Profile" 
                            className="profile-pic-preview"
                        />
                         <div className="form-group">
                            <label htmlFor="profilePicUrl">Profile Picture URL</label>
                            <input
                                id="profilePicUrl"
                                type="text"
                                placeholder="Enter image URL..."
                                value={profilePicUrl}
                                onChange={(e) => setProfilePicUrl(e.target.value)}
                            />
                        </div>
                    </div>
                   
                    <div className="form-group">
                        <label htmlFor="name">Display Name</label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="save-button" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};


// Main Header Component with proper types
const SubAdminHeader: React.FC = () => {
    const [user, setUser] = useState<SubAdminUser>({ name: "Sub-Admin User", profilePictureUrl: "" });
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getUserProfile();
                setUser(response.data);
            } catch (error)
             {
                console.error("Failed to fetch profile:", error);
            }
        };
        fetchProfile();
    }, []);

    const handleProfileUpdate = (updatedUser: SubAdminUser) => {
        setUser(updatedUser);
    };

    return (
        <>
            <header className="sub-admin-header">
                <div className="header-greeting">
                    <h3>Welcome Back, {user.name}!</h3>
                    <p>Here is the summary of your center's activities.</p>
                </div>
                <div className="header-actions">
                    <button className="icon-button">
                        <Bell size={20} />
                    </button>
                    <div className="user-profile" onClick={() => setIsModalOpen(true)}>
                        {user.profilePictureUrl ? (
                            <img src={user.profilePictureUrl} alt="Profile" className="profile-pic" />
                        ) : (
                            <User size={20} />
                        )}
                    </div>
                </div>
            </header>
            {isModalOpen && <ProfileModal user={user} onClose={() => setIsModalOpen(false)} onUpdate={handleProfileUpdate} />}
        </>
    );
};

export default SubAdminHeader;

