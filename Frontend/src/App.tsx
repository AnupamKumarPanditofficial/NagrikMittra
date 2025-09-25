import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- Import Core Styles ---
import './styles/GlobalStyles.css';

// --- Import Components ---
import ProtectedRoute from './components/auth/ProtectedRoute';

// --- Import Public Pages ---
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import OTPPage from './pages/OTPPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

// --- Import Admin Pages ---
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminSubAdminPage from './pages/admin/AdminSubAdminPage';
import AdminTasksPage from './pages/admin/AdminTasksPage';
import AdminRequestsPage from './pages/admin/AdminRequestsPage';
import AdminVerifyPage from './pages/admin/AdminVerifyPage';

// --- Import User Pages ---
import UserDashboardPage from './pages/user/UserDashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import ComplainPage from './pages/user/ComplainPage';
import CheckStatusPage from './pages/user/CheckStatusPage';
import PeoplePollPage from './pages/user/PeoplePollPage';
import FeedbackPage from './pages/user/FeedbackPage';
import LeaderBoardPage from './pages/user/LeaderBoardPage';
import MyRewardPage from './pages/user/MyRewardPage';

// --- Import Sub-Admin Pages ---
import SubAdminDashboardPage from './pages/sub-admin/SubAdminDashboardPage';
import SubAdminCurrentRequestPage from './pages/sub-admin/SubAdminCurrentRequestPage';
import SubAdminPendingRequestPage from './pages/sub-admin/SubAdminPendingRequestPage';
import SubAdminMessagesPage from './pages/sub-admin/SubAdminMessagesPage';


const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* ========================================================== */}
        {/* =============== PUBLIC ROUTES ============================ */}
        {/* ========================================================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/verify-otp" element={<OTPPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ========================================================== */}
        {/* =============== PROTECTED ROUTES ========================= */}
        {/* ========================================================== */}

        {/* --- Protected User Routes --- */}
        <Route
          path="/dashboard"
          element={ <ProtectedRoute><UserDashboardPage /></ProtectedRoute> }
        />
        <Route path="/user/profile" element={<ProfilePage />} />
        <Route
          path="/user/complain"
          element={ <ProtectedRoute><ComplainPage /></ProtectedRoute> }
        />
        <Route
          path="/user/check-status"
          element={ <ProtectedRoute><CheckStatusPage /></ProtectedRoute> }
        />
        <Route
          path="/user/poll"
          element={ <ProtectedRoute><PeoplePollPage /></ProtectedRoute> }
        />
        <Route
          path="/user/feedback"
          element={ <ProtectedRoute><FeedbackPage /></ProtectedRoute> }
        />
        <Route
          path="/user/leaderboard"
          element={ <ProtectedRoute><LeaderBoardPage /></ProtectedRoute> }
        />
        <Route
          path="/user/rewards"
          element={ <ProtectedRoute><MyRewardPage /></ProtectedRoute> }
        />

        {/* --- Protected Main-Admin Routes --- */}
        <Route 
          path="/admin/dashboard" 
          element={ <ProtectedRoute><AdminDashboardPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/sub-admins" 
          element={ <ProtectedRoute><AdminSubAdminPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/tasks" 
          element={ <ProtectedRoute><AdminTasksPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/requests" 
          element={ <ProtectedRoute><AdminRequestsPage /></ProtectedRoute> } 
        />
        <Route 
          path="/admin/verify" 
          element={ <ProtectedRoute><AdminVerifyPage /></ProtectedRoute> } 
        />

        {/* --- Protected Sub-Admin Routes --- */}
        <Route path="/sub-admin" element={<Navigate to="/sub-admin/dashboard" replace />} />
        <Route 
          path="/sub-admin/dashboard" 
          element={ <ProtectedRoute><SubAdminDashboardPage /></ProtectedRoute> } 
        />
        <Route 
          path="/sub-admin/current-requests" 
          element={ <ProtectedRoute><SubAdminCurrentRequestPage /></ProtectedRoute> } 
        />
        <Route 
          path="/sub-admin/pending-requests" 
          element={ <ProtectedRoute><SubAdminPendingRequestPage /></ProtectedRoute> } 
        />
        <Route 
          path="/sub-admin/messages" 
          element={ <ProtectedRoute><SubAdminMessagesPage /></ProtectedRoute> } 
        />

      </Routes>
    </Router>
  );
}

export default App;

