import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { Briefcase, History, HardHat, MessageCircle, Bell, User, Hand, Users, Rocket, CheckCircle2 } from "lucide-react";
import StatCardSkeleton from "../components/StatSkeletonCard";
import Avatar from "../components/Avatar";
import { apiFetch, API_URL } from "../api/client";
import { useUnreadNotificationsCount } from "../hooks/useNotifications";
import AnimatedStatValue from "../components/AnimatedStatValue";
import MiniActivityChart from "../components/MiniActivityChart";
import ProfileCompletionBar from "../components/ProfileCompletionBar";

// Devuelve el saludo según la hora local del usuario
function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

function Dashboard() {
  const { user, logout } = useContext(UserContext);

  const navigate = useNavigate();

  // ---------------------------------------------------------------------
  // ESTADOS
  // ---------------------------------------------------------------------
  const [menuOpen, setMenuOpen] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  const unreadNotifications = useUnreadNotificationsCount(user?.id);

  // ---------------------------------------------------------------------
  // CARGAR TRABAJOS (solo los del usuario, no todos los de la plataforma)
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!user?.id) return;

    const fetchJobs = async () => {
      try {
        const response = await apiFetch(`${API_URL}/jobs/user/${user.id}`);

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

  // ---------------------------------------------------------------------
  // ALERTAS (mensajes sin leer -- las notificaciones ahora vienen de
  // useUnreadNotificationsCount, con caché compartida vía React Query)
  // ---------------------------------------------------------------------
  const loadAlerts = async () => {
    try {
      if (!user) return;

      const conversationsResponse = await apiFetch(`${API_URL}/conversations/user/${user.id}`);

      if (conversationsResponse.ok) {
        const conversations = await conversationsResponse.json();

        const unreadMessagesCount = conversations.reduce((acc, convo) => acc + (convo.unread_count || 0), 0);

        setUnreadMessages(unreadMessagesCount);
      }
    } catch (error) {
      console.error(error);
    }
  };

  // ---------------------------------------------------------------------
  // AUTO REFRESH DE ALERTAS
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    loadAlerts();

    const interval = setInterval(() => {
      loadAlerts();
    }, 3000);

    return () => clearInterval(interval);
  }, [user]);

  // ---------------------------------------------------------------------
  // CALIFICACIÓN PROMEDIO
  // ---------------------------------------------------------------------
  const loadRating = async () => {
    try {
      if (!user) return;

      const response = await apiFetch(`${API_URL}/reviews/average/${user.id}`);

      if (!response.ok) {
        throw new Error("Error obteniendo calificación");
      }

      const data = await response.json();

      setAverageRating(data.average_rating);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!user) return;

    loadRating();
  }, [user]);

  // ---------------------------------------------------------------------
  // PORTAFOLIO (solo nos importa si tiene AL MENOS una foto, no el
  // listado completo)
  // ---------------------------------------------------------------------
  useEffect(() => {
    if (!user) return;

    const loadPortfolio = async () => {
      try {
        const response = await apiFetch(`${API_URL}/users/${user.id}/portfolio`);

        if (!response.ok) return;

        const data = await response.json();

        setHasPortfolio(data.length > 0);
      } catch (error) {
        console.error(error);
      }
    };

    loadPortfolio();
  }, [user]);

  // ---------------------------------------------------------------------
  // TRABAJOS DEL USUARIO (ya vienen filtrados por el backend)
  // ---------------------------------------------------------------------
  const userJobs = jobs;

  // ---------------------------------------------------------------------
  // ESTADÍSTICAS
  // ---------------------------------------------------------------------
  const stats = [
    {
      label: "Trabajos Publicados",
      value: userJobs.length,
      path: "/my-jobs",
    },
    {
      label: "Mensajes Nuevos",
      value: unreadMessages,
      path: "/messages",
    },
    {
      label: "Notificaciones",
      value: unreadNotifications,
      path: "/notifications",
    },
    {
      label: "Calificación",
      value: averageRating > 0 ? `⭐ ${averageRating}` : "Sin reseñas",
      path: "/profile",
    },
  ];

  const pendingApplications = userJobs.reduce((total, job) => total + (job.pendingApplicationsCount || 0), 0);

  const jobsWithPendingApplications = userJobs.filter((job) => job.pendingApplicationsCount > 0);

  // ---------------------------------------------------------------------
  // ACTIVIDAD MENSUAL (para el mini gráfico de trabajos publicados)
  // ---------------------------------------------------------------------
  const monthlyActivity = (() => {
    const months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

      months.push({
        label: date.toLocaleDateString("es-ES", { month: "short" }).replace(".", ""),
        year: date.getFullYear(),
        month: date.getMonth(),
        count: 0,
      });
    }

    userJobs.forEach((job) => {
      if (!job.created_at) return;

      const created = new Date(job.created_at);

      const bucket = months.find((m) => m.year === created.getFullYear() && m.month === created.getMonth());

      if (bucket) bucket.count += 1;
    });

    return months;
  })();

  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen">
      {/* ------------------------------------------------------------- */}
      {/* HEADER */}
      {/* ------------------------------------------------------------- */}
      <DashboardHeader showBell={true} showBackButton={false} />

      <div className="flex">
        {/* ----------------------------------------------------------- */}
        {/* SIDEBAR */}
        {/* ----------------------------------------------------------- */}
        <aside
          className={`app-sidebar left-0 w-64 bg-white rounded-lg border-r border-gray-50 dark:border-r-slate-500 p-6 shadow transform transition-transform duration-300 dark:bg-slate-800 ${menuOpen ? "translate-x-0 z-50" : "-translate-x-full"} md:translate-x-0 md:flex md:z-30 flex-col justify-between`}
        >
          {/* CERRAR */}
          <button onClick={() => setMenuOpen(false)} className="md:hidden absolute top-4 right-4 text-xl font-bold dark:text-white">
            ✕
          </button>

          {/* ------------------------------------------------------- */}
          {/* NAV */}
          {/* ------------------------------------------------------- */}
          <div className="mt-10 transition-colors duration-200 group-hover:translate-x-1">
            <nav className="flex flex-col gap-4 text-gray-600 dark:text-gray-400">
              <span onClick={() => navigate("/applications")} className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95">
                Mis Postulaciones <Briefcase className="w-5 h-5" />
              </span>

              <span onClick={() => navigate("/job-history")} className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95">
                Historial <History className="w-5 h-5" />
              </span>

              <span onClick={() => navigate("/my-jobs")} className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95">
                Mis Trabajos <HardHat className="w-5 h-5" />
              </span>

              {/* MENSAJES */}
              <div onClick={() => navigate("/messages")} className="cursor-pointer flex items-center justify-between transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Mensajes
                  <MessageCircle className="w-5 h-5" />
                </span>

                {unreadMessages > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-[1px]">{unreadMessages}</span>}
              </div>

              {/* NOTIFICACIONES */}
              <div onClick={() => navigate("/notifications")} className="cursor-pointer flex items-center justify-between transition-all duration-300 hover:scale-105 active:scale-95">
                <span className="flex items-center gap-2">
                  Notificaciones <Bell className="w-5 h-5" />
                </span>

                {unreadNotifications > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-[1px]">{unreadNotifications}</span>}
              </div>

              <span onClick={() => navigate("/profile")} className="cursor-pointer flex items-center gap-2 transition-all duration-300 hover:scale-105 active:scale-95">
                Mi Perfil <User className="w-5 h-5" />
              </span>
            </nav>
          </div>

          {/* ------------------------------------------------------- */}
          {/* LOGOUT */}
          {/* ------------------------------------------------------- */}
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

        {/* ----------------------------------------------------------- */}
        {/* CONTENIDO */}
        {/* ----------------------------------------------------------- */}
        <main className="flex-1 p-6">
          {/* MENÚ MÓVIL */}
          <button onClick={() => setMenuOpen(true)} className="md:hidden text-2xl mb-4 dark:text-white">
            ☰
          </button>

          {/* ENCABEZADO DE BIENVENIDA */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name} image={user?.profile_image} size="xl" />

              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold dark:text-gray-200">
                  {getGreeting()}, {user?.name || "Usuario"}
                  <Hand className="w-6 h-6 text-primary" />
                </h2>

                <p className="text-gray-500 dark:text-gray-400">¿Qué necesitas hacer hoy?</p>
              </div>
            </div>
          </div>

          <ProfileCompletionBar user={user} hasPortfolio={hasPortfolio} />

          {/* ----------------------------------------------------------- */}
          {/* TARJETAS DE ESTADÍSTICAS */}
          {/* ----------------------------------------------------------- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <StatCardSkeleton key={index} />)
              : stats.map((item) => (
                  <div
                    key={item.label}
                    onClick={() => navigate(item.path)}
                    className="min-w-0 bg-white dark:bg-slate-800 p-4 rounded-xl shadow cursor-pointer overflow-hidden transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 dark:hover:bg-slate-700 dark:hover:ring-2 dark:hover:ring-cyan-400/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
                  >
                    <p className="text-gray-500 dark:text-gray-300 text-sm">{item.label}</p>

                    <h2 className="text-xl font-bold mt-2 dark:text-white">
                      <AnimatedStatValue value={item.value} />
                    </h2>

                    {item.label === "Trabajos Publicados" && userJobs.length > 0 && (
                      <div className="mt-3 w-full overflow-hidden">
                        <MiniActivityChart data={monthlyActivity} />
                      </div>
                    )}
                  </div>
                ))}
          </div>

          {/* ----------------------------------------------------------- */}
          {/* BOTONES PRINCIPALES */}
          {/* ----------------------------------------------------------- */}
          <div className="flex gap-4 mb-6 flex-wrap">
            <button onClick={() => navigate("/create")} className="bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300">
              Publicar un Trabajo
            </button>

            <button onClick={() => navigate("/explore")} className="border border-primary text-primary px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300">
              Explorar Trabajos
            </button>
          </div>

          {/* ----------------------------------------------------------- */}
          {/* ACCIONES PENDIENTES */}
          {/* ----------------------------------------------------------- */}
          <div className="bg-white p-6 rounded-xl shadow dark:bg-slate-800">
            <h3 className="font-bold dark:text-gray-200 mb-4">Acciones pendientes</h3>

            {loading ? (
              <div className="h-16 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse" />
            ) : userJobs.length === 0 ? (
              <div onClick={() => navigate("/create")} className="flex items-center gap-3 border border-dashed border-primary/40 p-4 rounded-lg cursor-pointer hover:bg-primary/5 transition">
                <Rocket className="w-6 h-6 text-primary" />
                <div>
                  <p className="font-medium dark:text-gray-200">Publica tu primer trabajo</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Todavía no has publicado nada — empieza en segundos.</p>
                </div>
              </div>
            ) : pendingApplications === 0 ? (
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-500/10">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
                <p className="text-sm dark:text-gray-200">Estás al día, no tienes postulaciones pendientes por revisar.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {jobsWithPendingApplications.map((job) => (
                  <div key={job.id} onClick={() => navigate(`/job-applications/${job.id}`)} className="flex items-center justify-between border p-4 rounded-lg cursor-pointer hover:border-primary transition">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium dark:text-gray-200">{job.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {job.pendingApplicationsCount} postulante
                          {job.pendingApplicationsCount > 1 ? "s" : ""} esperando respuesta
                        </p>
                      </div>
                    </div>
                    <span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-1 rounded-full">Revisar</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;