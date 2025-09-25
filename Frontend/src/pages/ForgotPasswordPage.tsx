import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { forgotPassword } from '../services/apiService';
import './AuthPage.css'; // Reuse the beautiful styles
import MailOutlineIcon from '@mui/icons-material/MailOutline';

const ForgotPasswordPage: React.FC = () => {
    const [contactInfo, setContactInfo] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            await forgotPassword(contactInfo);
            setMessage('If an account exists, a reset code has been sent.');
            setTimeout(() => {
                navigate('/reset-password', { state: { contactInfo } });
            }, 3000);
        } catch (err: any) {
            // Still show a generic message on error for security
            setMessage('If an account exists, a reset code has been sent.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container-new">
            <div className="auth-box-new">
                <form className="auth-form-new" onSubmit={handleSubmit}>
                    <h2 className="auth-title-new">Reset Password</h2>
                    <p className="auth-subtitle-new">
                        Enter your registered Email or Phone to receive a code.
                    </p>
                    <div className="input-group-new">
                        <MailOutlineIcon className="input-icon" />
                        <input
                            className="auth-input"
                            type="text"
                            placeholder="Email or Phone Number"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    {message && <p className="success-message">{message}</p>}
                    <button type="submit" className="btn-submit-new" disabled={isLoading}>
                        {isLoading ? 'Sending...' : 'Send Reset Code'}
                    </button>
                    <p className="toggle-form-new" onClick={() => navigate('/auth')}>
                        ← Back to Login
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;