import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyOtp, resendOtp } from '../services/apiService';
import './OTPPage.css';

const OTPPage: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(new Array(4).fill(""));
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(30);
    
    const navigate = useNavigate();
    const location = useLocation();
    const contactInfo = location.state?.contactInfo;
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleChange = (element: HTMLInputElement, index: number) => {
        if (isNaN(Number(element.value))) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        if (element.nextSibling && element.value) {
            (element.nextSibling as HTMLInputElement).focus();
        }
    };

    const handleResendOtp = async () => {
        if (countdown > 0 || !contactInfo) return;
        try {
            await resendOtp(contactInfo);
            alert('A new OTP has been sent.');
            setCountdown(30);
        } catch (err: any) {
            setError(err.response?.data?.msg || "Failed to resend OTP.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const finalOtp = otp.join("");

        if (finalOtp.length !== 4) {
            setError("Please enter the complete 4-digit code.");
            setIsLoading(false);
            return;
        }
        
        try {
            // 1. Get the full response from the backend
            const response = await verifyOtp({ contactInfo, otp: finalOtp });
            
            // 2. Destructure both token and role from the response data
            const { token, role } = response.data;
            
            localStorage.setItem('authToken', token);
            alert("Verification successful!");

            // 3. Use the role variable for correct redirection
            if (role === 'main-admin') {
                navigate('/admin/dashboard');
            } else if (role === 'sub-admin') {
                navigate('/sub-admin/dashboard');
            } else {
                navigate('/dashboard');
            }

        } catch (err: any) {
            setError(err.response?.data?.msg || "Verification failed.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="otp-container">
            <div className="otp-box">
                <h2 className="otp-title">Account Verification</h2>
                <p className="otp-subtitle">Enter the code sent to {contactInfo}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="otp-input-group">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                type="text"
                                className="otp-input"
                                maxLength={1}
                                value={data}
                                onChange={e => handleChange(e.target, index)}
                                onFocus={e => e.target.select()}
                                ref={el => inputsRef.current[index] = el}
                            />
                        ))}
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn-submit-new" disabled={isLoading}>
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </button>
                    
                    <div className="resend-container">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={countdown > 0}
                            className="resend-btn"
                        >
                            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPPage;