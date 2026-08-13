import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { Briefcase, History, HardHat, MessageCircle, Bell, User, Hand } from "lucide-react";
import StatCardSkeleton from "../components/StatSkeletonCard";
import Avatar from "../components/Avatar";
import { apiFetch } from "../api/client";
import { useUnreadNotificationsCount } from "../hooks/useNotifications";

function Dashboard() {
  const { user, logout } = useContext(UserContext);

  const navigate = useNavigate();

  // =====================================
  // 🔥 STATES
  // =====================================
  const [menuOpen, setMenuOpen] = useState(false);

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [unreadMessages, setUnreadMessages] = useState(0);

  const unreadNotifications = useUnreadNotificationsCount(user?.id);

  const [averageRating, setAverageRating] = useState(0);

  // =====================================
  // 🔥 CARGAR TRABAJOS (solo los del usuario, no todos los de la plataforma)
  // =====================================
  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        const response = await apiFetch(`http://localhost:8000/jobs/user/${user.id}`);

        if (!response.ok) {
          throw new Error("Error cargando trabajos");
        }

        const data = await response.json();

        setJobs(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user?.id]);

  

  // =====================================
  // 🔥 ALERTAS (mensajes sin leer -- las notificaciones ahora vienen
  // de useUnreadNotificationsCount, con caché compartida vía React Query)
  // =====================================
  const loadAlerts = async () => {
    try {
      if (!user) return;

      // 🔥 conversaciones
      const conversationsResponse = await apiFetch(`http://localhost:8000/conversations/user/${user.id}`);

      // =====================================
      // 🔥 MENSAJES
      // =====================================
      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();

        const unreadMessagesCount = conversations.reduce((acc, convo) => acc + (convo.unread_count || 0), 0);

        setUnreadMessages(unreadMessagesCount);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // 🔥 AUTO REFRESH ALERTAS
  // =====================================
  useEffect(() => {
    if (!user) return;

    loadAlerts();

    const interval = setInterval(() => {
      loadAlerts();
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    loadRating();
  }, [user]);

  const loadRating = async () => {
    try {
      if (!user) return;

      const response = await apiFetch(`http://localhost:8000/reviews/average/${user.id}`);

      if (!response.ok) {
        throw new Error("Error obteniendo calificación");
      }

      const data = await response.json();

      setAverageRating(data.average_rating);
    } catch (error) {
      console.error(error);
    }
  };
  // =====================================
  // 🔥 USER JOBS (ya vienen filtrados por el backend)
  // =====================================
  const userJobs = jobs;

  // =====================================
  // 🔥 STATS
  // =====================================
  const stats = [
    {
      label: "Trabajos Publicados",
      value: userJobs.length,
    },

    {
      label: "Mensajes Nuevos",
      value: unreadMessages,
    },

    {
      label: "Notificaciones",
      value: unreadNotifications,
    },

    {
      label: "Calificación",
      value: averageRating > 0 ? `⭐ ${averageRating}` : "Sin reseñas",
    },
  ];

  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen">
      {/* ===================================== */}
      {/* 🔥 HEADER */}
      {/* ===================================== */}
      <DashboardHeader showBell={true} showBackButton={false} />

      <div className="flex">
      {/* ===================================== */}
      {/* 🔥 SIDEBAR */}
      {/* ===================================== */}
      <aside
        className={`
          app-sidebar left-0 w-64 bg-white rounded-lg border-r border-gray-50 dark:border-r-slate-500 p-6 shadow
          transform transition-transform duration-300 
          dark:bg-slate-800
          ${menuOpen ? "translate-x-0 z-50" : "-translate-x-full"}
          md:translate-x-0 md:flex md:z-30 flex-col justify-between
        `}
      >
        {/* 🔥 CERRAR */}
        <button
          onClick={() => setMenuOpen(false)}
          className="md:hidden absolute top-4 right-4 text-xl font-bold dark:text-white"
        >
          ✕
        </button>

        {/* ===================================== */}
        {/* 🔥 NAV */}
        {/* ===================================== */}
        <div className="mt-10 transition-colors duration-200 group-hover:translate-x-1">
          <nav className="flex flex-col gap-4 text-gray-600 dark:text-gray-400 ">
            <span
              onClick={() => navigate("/applications")}
              className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Mis Postulaciones <Briefcase className="w-5 h-5" />
            </span>

            <span
              onClick={() => navigate("/job-history")}
              className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Historial <History className="w-5 h-5" />
            </span>

            <span
              onClick={() => navigate("/my-jobs")}
              className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Mis Trabajos <HardHat className="w-5 h-5" />
            </span>

            {/* 🔥 MENSAJES */}
            <div
              onClick={() => navigate("/messages")}
              className="cursor-pointer flex items-center justify-between transition-all duration-300 hover:scale-105 active:scale-95 "
            >
              <span className="flex items-center gap-2">
                Mensajes
                <MessageCircle className="w-5 h-5" />
              </span>

              {unreadMessages > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-[1px]">{unreadMessages}</span>
              )}
            </div>

            {/* 🔥 NOTIFICACIONES */}
            <div
              onClick={() => navigate("/notifications")}
              className="cursor-pointer flex items-center justify-between transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <span className="flex items-center gap-2">
                {" "}
                Notificaciones <Bell className="w-5 h-5" />
              </span>

              {unreadNotifications > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-[1px]">{unreadNotifications}</span>
              )}
            </div>

            <span
              onClick={() => navigate("/profile")}
              className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Mi Perfil <User className="w-5 h-5" />
            </span>
          </nav>
        </div>

        {/* ===================================== */}
        {/* 🔥 LOGOUT */}
        {/* ===================================== */}
        <button
          onClick={() => {
            logout();

            navigate("/");
          }}
          className="text-red-500 mt-5 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* ===================================== */}
      {/* 🔥 CONTENIDO */}
      {/* ===================================== */}
      <main className="flex-1 p-6">
        {/* 🔥 MOBILE MENU */}
        <button onClick={() => setMenuOpen(true)} className="md:hidden text-2xl mb-4 dark:text-white">
          ☰
        </button>

        {/* HEADER */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={user?.name} image={user?.profile_image} size="xl" />

            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold dark:text-gray-200">
                Hola, {user?.name || "Usuario"}
                <Hand className="w-6 h-6 text-primary" />
              </h2>

              <p className="text-gray-500 dark:text-gray-400">¿Qué necesitas hacer hoy?</p>
            </div>
          </div>
        </div>

        {/* ===================================== */}
        {/* 🔥 STATS */}
        {/* ===================================== */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
            : stats.map((item) => (
                <div
                  key={item.label}
                  className="
          bg-white dark:bg-slate-800
          p-4 rounded-xl shadow
          cursor-pointer
          transition-all duration-300 ease-out
          hover:-translate-y-2
          hover:scale-105
          dark:hover:bg-slate-700
          dark:hover:ring-2
          dark:hover:ring-cyan-400/40
          dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]
        "
                >
                  <p className="text-gray-500 dark:text-gray-300 text-sm">{item.label}</p>

                  <h2 className="text-xl font-bold mt-2 dark:text-white">{item.value}</h2>
                </div>
              ))}
        </div>

        {/* ===================================== */}
        {/* 🔥 BOTONES */}
        {/* ===================================== */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <button
            onClick={() => navigate("/create")}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Publicar un Trabajo
          </button>

          <button
            onClick={() => navigate("/explore")}
            className="border border-primary text-primary px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Explorar Trabajos
          </button>
        </div>
      </main>
      </div>
    </div>
  );
}

export default Dashboard;