import { Routes, Route } from "react-router-dom";

// 🌍 PÚBLICO
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import HowItWorks from "./pages/HowItWorks";
import CreateProfile from "./pages/CreateProfile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

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

      {/* 🔒 PRIVADAS */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/applications" element={<MyApplications />} />
      <Route path="/my-jobs" element={<MyJobs />} />
      <Route path="/create" element={<CreateJob />} />
      <Route path="/explore" element={<ExploreJobs />} />
      <Route path="/job/:id" element={<JobDetail />} />
      <Route path="/job-applications/:jobId" element={<JobApplications />} />
      <Route path="/job-history" element={<JobHistory />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/user/:id" element={<UserProfile />} />
      <Route path="/chat/:chatId" element={<Chat />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/review/:jobId" element={<Review />} />
    </Routes>

  );
}

export default App;
