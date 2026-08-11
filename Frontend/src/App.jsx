import { Routes, Route } from "react-router-dom";

// 🌍 PÚBLICO
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import CreateProfile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

// 🔒 PRIVADO
import Dashboard from "./pages/Dashboard";
import MyApplications from "./pages/MyApplications";
import MyJobs from "./pages/MyJobs";
import CreateJob from "./pages/CreateJob";
import JobApplications from "./pages/JobApplications";
import ExploreJobs from "./pages/ExploreJobs";
import JobDetail from "./pages/JobDetail";
import JobHistory from "./pages/JobHistory";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import Messages from "./pages/Messages";
import Notifications from "./pages/Notifications";
import Review from "./pages/Review";

// 🛡️ ADMIN
import AdminDashboard from "./pages/AdminDashboard";

import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* 🌍 PÚBLICAS */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/create-profile" element={<CreateProfile />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* 🔒 PRIVADAS (requieren sesión iniciada) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/applications" element={<ProtectedRoute><MyApplications /></ProtectedRoute>} />
      <Route path="/my-jobs" element={<ProtectedRoute><MyJobs /></ProtectedRoute>} />
      <Route path="/create" element={<CreateJob />} />
      <Route path="/explore" element={<ExploreJobs />} />
      <Route path="/job/:id" element={<ProtectedRoute><JobDetail /></ProtectedRoute>} />
      <Route path="/job-applications/:jobId" element={<ProtectedRoute><JobApplications /></ProtectedRoute>} />
      <Route path="/job-history" element={<ProtectedRoute><JobHistory /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/user/:id" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/chat/:chatId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
      <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/review/:jobId" element={<ProtectedRoute><Review /></ProtectedRoute>} />

      {/* 🛡️ ADMIN (requiere rol admin) */}
      <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    </Routes>
  );
}

export default App;