// src/pages/ResetPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resetPassword } from '../services/apiService';
import './ResetPasswordPage.css';

const ResetPasswordPage: React.FC = () => {
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const contactInfo = location.state?.contactInfo;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await resetPassword({ contactInfo, otp, newPassword });
            alert('Password has been reset successfully! Please log in with your new password.');
            navigate('/auth');
        } catch (err: any) {
            setError(err.response?.data?.msg || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2 className="auth-title">Create New Password</h2>
                    <p style={{ textAlign: 'center', opacity: 0.8 }}>Enter the OTP sent to {contactInfo}</p>
                    <input className="auth-input" type="text" placeholder="4-Digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                    <input className="auth-input" type="password" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                    <input className="auth-input" type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-submit" disabled={isLoading}>
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;