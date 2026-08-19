import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";

// 🌍 PÚBLICO
// Home se importa de forma normal (no lazy): es la puerta de entrada de
// la app, así la primera pantalla no depende de un chunk adicional.
import Home from "./pages/Home";

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const CreateProfile = lazy(() => import("./pages/CreateProfile"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// 🔒 PRIVADO
const Dashboard = lazy(() => import("./pages/Dashboard"));
const MyApplications = lazy(() => import("./pages/MyApplications"));
const MyJobs = lazy(() => import("./pages/MyJobs"));
const CreateJob = lazy(() => import("./pages/CreateJob"));
const JobApplications = lazy(() => import("./pages/JobApplications"));
const ExploreJobs = lazy(() => import("./pages/ExploreJobs"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const JobHistory = lazy(() => import("./pages/JobHistory"));
const Profile = lazy(() => import("./pages/Profile"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Chat = lazy(() => import("./pages/Chat"));
const Messages = lazy(() => import("./pages/Messages"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Review = lazy(() => import("./pages/Review"));

// 🛡️ ADMIN
// El más importante de lazy-cargar: la gran mayoría de usuarios nunca
// entra aquí, no tiene sentido que descarguen este código nunca.
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));

import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import PageLoader from "./components/PageLoader";

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* 🌍 PÚBLICAS */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
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
    </Suspense>
  );
}

export default App;