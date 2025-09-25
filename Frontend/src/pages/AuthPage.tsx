import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { loadFull } from "tsparticles"; 
import type { Engine } from "@tsparticles/engine";
import { motion } from 'framer-motion';
import ReCAPTCHA from "react-google-recaptcha";

import { registerUser, registerAdmin, registerDepartment, loginUser } from '../services/apiService'; // Added registerDepartment import
import particlesOptions from '../assets/particles.json';
import './AuthPage.css';

import MailOutlineIcon from '@mui/icons-material/MailOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

const AuthPage: React.FC = () => {
    const [init, setInit] = useState(false);
    const [step, setStep] = useState<'role' | 'adminRole' | 'departmentRole' | 'form'>('role'); // Added departmentRole step
    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [role, setRole] = useState<'citizen' | 'official' | 'department' | null>(null); // Added department role
    const [adminRole, setAdminRole] = useState<'main-admin' | 'sub-admin' | null>(null);
    const [departmentType, setDepartmentType] = useState<'water' | 'infrastructure' | 'electricity' | 'waste' | null>(null); // New state for department selection
    const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
    const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: '',
        contactInfo: '',
        password: '',
        confirmPassword: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const passwordsMatch = formData.password && formData.confirmPassword && formData.password === formData.confirmPassword;

    useEffect(() => {
        initParticlesEngine(async (engine: Engine) => {
            await loadFull(engine);
        }).then(() => {
            setInit(true);
        });
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (mode === 'signup' && formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            setIsLoading(false); return;
        }
        if (mode === 'signup' && !passwordsMatch && role !== 'department') {
            // Password match not required for department? Assuming always required, so still check for department
            setError("Passwords do not match.");
            setIsLoading(false); return;
        }
        if (!recaptchaToken) {
            setError("Please complete the reCAPTCHA.");
            setIsLoading(false); return;
        }

        let finalContactInfo = formData.contactInfo;
        if (contactMethod === 'phone') {
            if (!/^\d{10}$/.test(formData.contactInfo)) {
                setError("Please enter a valid 10-digit phone number.");
                setIsLoading(false); return;
            }
            finalContactInfo = `+91${formData.contactInfo}`;
        }

        try {
            if (mode === 'signup') {
                const { fullName, password } = formData;
                if (role === 'official' && adminRole === 'main-admin') {
                    // Main admin registration function
                    await registerAdmin({ name: fullName, contactInfo: finalContactInfo, password, recaptchaToken });
                    navigate('/verify-otp', { state: { contactInfo: finalContactInfo } });
                    return;
                }
                if (role === 'official' && adminRole === 'sub-admin') {
                    // Sub-admin is not signing up in form step, so this case won't occur here.
                    // Just in case, fallback to user registration?
                    await registerUser({ name: fullName, contactInfo: finalContactInfo, password, recaptchaToken });
                    navigate('/verify-otp', { state: { contactInfo: finalContactInfo } });
                    return;
                }
                if (role === 'department') {
                    // Department registration requires departmentType & email & password
                    if (!departmentType) {
                        setError("Please select your department.");
                        setIsLoading(false);
                        return;
                    }
                    if (!finalContactInfo || contactMethod !== 'email') {
                        setError("Department registration requires a valid Email.");
                        setIsLoading(false);
                        return;
                    }
                    await registerDepartment({ 
                        department: departmentType, 
                        contactInfo: finalContactInfo, 
                        password, 
                        recaptchaToken 
                    });
                    navigate('/verify-otp', { state: { contactInfo: finalContactInfo } });
                    return;
                }
                // Citizen registration
                await registerUser({ name: fullName, contactInfo: finalContactInfo, password, recaptchaToken });
                navigate('/verify-otp', { state: { contactInfo: finalContactInfo } });

            } else {
                // Login
                const { password } = formData;
                const response = await loginUser({ contactInfo: finalContactInfo, password, recaptchaToken });
                const { token, role: userRole } = response.data;
                localStorage.setItem('authToken', token);
                alert('Login successful!');

                if (userRole === 'main-admin') navigate('/admin/dashboard');
                else if (userRole === 'sub-admin') navigate('/sub-admin/dashboard');
                else if (userRole === 'department') navigate('/department/dashboard');
                else navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.msg || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        if (step === 'role') {
            return (
                <motion.div key="role" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <h2 className="auth-title-new">How are you joining?</h2>
                    <div className="role-options">
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            onClick={() => { setRole('citizen'); setStep('form'); setMode('signup'); }} 
                            className="role-card"
                        >
                            <h3>As a Citizen</h3>
                        </motion.button>
                        <motion.button 
                            whileHover={{ scale: 1.05 }} 
                            onClick={() => { setRole('official'); setStep('adminRole'); }} 
                            className="role-card"
                        >
                            <h3>As an Official</h3>
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => { setRole('department'); setStep('departmentRole'); }}
                            className="role-card"
                        >
                            <h3>As a Department</h3>
                        </motion.button>
                    </div>
                </motion.div>
            );
        }

        if (step === 'adminRole') {
            return (
                <motion.div key="adminRole" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button type="button" onClick={() => setStep('role')} className="back-button">← Back</button>
                    <h2 className="auth-title-new">Select Official Type</h2>
                    <div className="role-options">
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setAdminRole('main-admin'); setStep('form'); setMode('signup'); }} className="role-card"><h3>Main-Admin</h3></motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setAdminRole('sub-admin'); setStep('form'); setMode('login'); }} className="role-card"><h3>Sub-Admin</h3></motion.button>
                    </div>
                </motion.div>
            );
        }

        if (step === 'departmentRole') {
            return (
                <motion.div key="departmentRole" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button type="button" onClick={() => setStep('role')} className="back-button">← Back</button>
                    <h2 className="auth-title-new">Select Department</h2>
                    <div className="role-options department-options">
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setDepartmentType('water'); setStep('form'); setMode('signup'); }} className={`role-card ${departmentType === 'water' ? 'selected' : ''}`}><h3>Water</h3></motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setDepartmentType('infrastructure'); setStep('form'); setMode('signup'); }} className={`role-card ${departmentType === 'infrastructure' ? 'selected' : ''}`}><h3>Infrastructure</h3></motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setDepartmentType('electricity'); setStep('form'); setMode('signup'); }} className={`role-card ${departmentType === 'electricity' ? 'selected' : ''}`}><h3>Electricity</h3></motion.button>
                        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setDepartmentType('waste'); setStep('form'); setMode('signup'); }} className={`role-card ${departmentType === 'waste' ? 'selected' : ''}`}><h3>Waste Management</h3></motion.button>
                    </div>
                </motion.div>
            );
        }

        if (step === 'form') {
            return (
                <motion.form key="form" className="auth-form-new" onSubmit={handleFormSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <button type="button" onClick={() => { 
                        if(role === 'department') setStep('departmentRole'); 
                        else if(adminRole) setStep('adminRole'); 
                        else setStep('role');
                        setAdminRole(null);
                        setDepartmentType(null);
                    }} className="back-button">← Back</button>
                    <h2 className="auth-title-new">{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
                    <p className="auth-subtitle-new">
                        {role === 'department' ? `as a Department - ${departmentType || 'Select Department'}` : 
                         (adminRole === 'main-admin' ? 'as Main-Admin' : adminRole === 'sub-admin' ? 'as Sub-Admin' : 'as a Citizen')}
                    </p>
                    
                    {mode === 'signup' && role !== 'department' && (
                        <div className="input-group-new">
                            <PersonOutlineIcon className="input-icon" />
                            <input name="fullName" type="text" placeholder="Full Name" required onChange={handleInputChange} />
                        </div>
                    )}

                    {/* Contact info input */}
                    {(mode === 'signup' || (mode === 'login' && role !== 'department')) && (
                        <div className="contact-method-selector">
                            <label className={contactMethod === 'email' ? 'active' : ''}>
                                <input type="radio" value="email" checked={contactMethod === 'email'} onChange={() => setContactMethod('email')} />
                                Email
                            </label>
                            <label className={contactMethod === 'phone' ? 'active' : ''}>
                                <input type="radio" value="phone" checked={contactMethod === 'phone'} onChange={() => setContactMethod('phone')} />
                                Phone
                            </label>
                        </div>
                    )}

                    {/* For department role, always show email input, no phone */}
                    {role === 'department' ? (
                        <div className="input-group-new">
                            <MailOutlineIcon className="input-icon" />
                            <input name="contactInfo" type="email" placeholder="Email Address" value={formData.contactInfo} onChange={handleInputChange} required />
                        </div>
                    ) : (contactMethod === 'phone' ? (
                        <div className="phone-input-container">
                            <PhoneIphoneIcon className="input-icon" />
                            <span className="country-code">+91</span>
                            <input name="contactInfo" className="phone-input" type="tel" placeholder="10-Digit Mobile Number" value={formData.contactInfo} onChange={handleInputChange} required maxLength={10} />
                        </div>
                    ) : (
                        <div className="input-group-new">
                            <MailOutlineIcon className="input-icon" />
                            <input name="contactInfo" type="text" placeholder="Email Address" value={formData.contactInfo} onChange={handleInputChange} required />
                        </div>
                    ))}

                    {/* ===== PASSWORD FIELD WITH TOGGLE ===== */}
                    <div className="input-group-new password-container">
                        <LockOutlinedIcon className="input-icon" />
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                        />
                        <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? '🙈' : '👁️'}
                        </button>
                    </div>
                    
                    {/* ===== CONFIRM PASSWORD FIELD WITH TOGGLE ===== */}
                    {mode === 'signup' && (
                        <div className="input-group-new password-container">
                            <LockOutlinedIcon className="input-icon" />
                            <input
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                            />
                            <button type="button" className="toggle-password" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    )}

                    {mode === 'signup' && formData.confirmPassword && !passwordsMatch && <p className="error-message">Passwords do not match!</p>}
                    
                    {error && <p className="error-message">{error}</p>}

                    <div className="recaptcha-container">
                        <ReCAPTCHA sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY!} onChange={(token) => setRecaptchaToken(token)} theme="dark"/>
                    </div>
                    
                    {mode === 'login' && <div className="actions-row"><Link to="/forgot-password">Forgot Password?</Link></div>}

                    <button type="submit" className="btn-submit-new" disabled={isLoading || !recaptchaToken}>
                        {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Create Account')}
                    </button>

                    {adminRole !== 'sub-admin' && role !== 'department' && <p className="toggle-form-new" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                        {mode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
                    </p>}
                </motion.form>
            );
        }
    };

    if (!init) return null;

    return (
        <div className="auth-container-new">
            <Particles id="tsparticles" options={particlesOptions as any} />
            <motion.div className="auth-box-new" initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 100 }}>
                {renderContent()}
            </motion.div>
        </div>
    );
};

export default AuthPage;
