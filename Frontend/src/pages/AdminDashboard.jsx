import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL } from "../api/client";
import {
  Users,
  Briefcase,
  Star,
  ShieldCheck,
  Trash2,
  Loader2,
  ShieldAlert,
} from "lucide-react";

function AdminDashboard() {
  const { user, logout } = useContext(UserContext);

  const navigate = useNavigate();

  const [tab, setTab] = useState("stats");

  const [stats, setStats] = useState(null);

  const [users, setUsers] = useState([]);

  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [actionError, setActionError] = useState("");

  const [pendingAction, setPendingAction] = useState(null);

  // =====================================
  // 🔥 CARGAR DATOS
  // =====================================
  const loadStats = async () => {
    const response = await apiFetch(`${API_URL}/admin/stats`);
    if (response.ok) setStats(await response.json());
  };

  const loadUsers = async () => {
    const response = await apiFetch(`${API_URL}/admin/users`);
    if (response.ok) setUsers(await response.json());
  };

  const loadJobs = async () => {
    const response = await apiFetch(`${API_URL}/admin/jobs`);
    if (response.ok) setJobs(await response.json());
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        await Promise.all([loadStats(), loadUsers(), loadJobs()]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // =====================================
  // 🔥 CAMBIAR ROL
  // =====================================
  const handleRoleChange = async (userId, newRole) => {
    setActionError("");
    setPendingAction(`role-${userId}`);

    try {
      const response = await apiFetch(
        `${API_URL}/admin/users/${userId}/role?role=${newRole}`,
        { method: "PUT" }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "No se pudo actualizar el rol");
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPendingAction(null);
    }
  };

  // =====================================
  // 🔥 ELIMINAR USUARIO
  // =====================================
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) {
      return;
    }

    setActionError("");
    setPendingAction(`del-user-${userId}`);

    try {
      const response = await apiFetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "No se pudo eliminar el usuario");
      }

      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPendingAction(null);
    }
  };

  // =====================================
  // 🔥 ELIMINAR TRABAJO
  // =====================================
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm("¿Eliminar este trabajo?")) return;

    setActionError("");
    setPendingAction(`del-job-${jobId}`);

    try {
      const response = await apiFetch(`${API_URL}/admin/jobs/${jobId}`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "No se pudo eliminar el trabajo");
      }

      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (error) {
      setActionError(error.message);
    } finally {
      setPendingAction(null);
    }
  };

  const statCards = stats
    ? [
        { label: "Usuarios", value: stats.total_users, icon: Users },
        { label: "Administradores", value: stats.total_admins, icon: ShieldCheck },
        { label: "Trabajos totales", value: stats.total_jobs, icon: Briefcase },
        { label: "Trabajos activos", value: stats.active_jobs, icon: Briefcase },
        { label: "En progreso", value: stats.in_progress_jobs, icon: Briefcase },
        { label: "Finalizados", value: stats.finished_jobs, icon: Briefcase },
        { label: "Postulaciones", value: stats.total_applications, icon: Users },
        {
          label: "Calificación promedio",
          value: stats.average_rating > 0 ? `⭐ ${stats.average_rating}` : "Sin reseñas",
          icon: Star,
        },
      ]
    : [];

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader showBell={false} showBackButton={false} />

      <PageWrapper>
        <div className="max-w-6xl mx-auto p-6 pt-24">
          {/* HEADER */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <ShieldAlert className="text-primary" size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-bold dark:text-white">
                  Panel de administración
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Hola {user?.name}, gestiona usuarios y trabajos de MicroJobs.
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-red-500 hover:underline text-sm self-start sm:self-auto"
            >
              Cerrar sesión
            </button>
          </div>

          {/* TABS */}
          <div className="flex gap-2 mb-6 border-b border-gray-200 dark:border-slate-700">
            {[
              { key: "stats", label: "Estadísticas" },
              { key: "users", label: "Usuarios" },
              { key: "jobs", label: "Trabajos" },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition ${
                  tab === t.key
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-primary"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {actionError && (
            <p className="text-red-500 text-sm mb-4">{actionError}</p>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gray-200 dark:bg-slate-700 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* ===================== STATS ===================== */}
              {tab === "stats" && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {statCards.map((item) => (
                    <div
                      key={item.label}
                      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow flex items-start justify-between"
                    >
                      <div>
                        <p className="text-gray-500 dark:text-gray-300 text-sm">
                          {item.label}
                        </p>
                        <h2 className="text-xl font-bold mt-2 dark:text-white">
                          {item.value}
                        </h2>
                      </div>
                      <item.icon className="text-primary/60" size={22} />
                    </div>
                  ))}
                </div>
              )}

              {/* ===================== USUARIOS ===================== */}
              {tab === "users" && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                        <th className="p-4">Nombre</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Rol</th>
                        <th className="p-4">Trabajos</th>
                        <th className="p-4">Postulaciones</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr
                          key={u.id}
                          className="border-b border-gray-50 dark:border-slate-700"
                        >
                          <td className="p-4 font-medium dark:text-white">{u.name}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{u.email}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                u.role === "admin"
                                  ? "bg-primary/10 text-primary"
                                  : "bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300"
                              }`}
                            >
                              {u.role}
                            </span>
                          </td>
                          <td className="p-4 dark:text-gray-300">{u.jobs_created}</td>
                          <td className="p-4 dark:text-gray-300">{u.applications}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {u.role === "admin" ? (
                                <button
                                  disabled={pendingAction === `role-${u.id}` || u.id === user?.id}
                                  onClick={() => handleRoleChange(u.id, "user")}
                                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-50"
                                  title={u.id === user?.id ? "No puedes quitarte el rol a ti mismo" : ""}
                                >
                                  {pendingAction === `role-${u.id}` ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    "Quitar admin"
                                  )}
                                </button>
                              ) : (
                                <button
                                  disabled={pendingAction === `role-${u.id}`}
                                  onClick={() => handleRoleChange(u.id, "admin")}
                                  className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 disabled:opacity-50"
                                >
                                  {pendingAction === `role-${u.id}` ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    "Hacer admin"
                                  )}
                                </button>
                              )}

                              <button
                                disabled={pendingAction === `del-user-${u.id}` || u.id === user?.id}
                                onClick={() => handleDeleteUser(u.id)}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg disabled:opacity-40"
                                title={u.id === user?.id ? "No puedes eliminar tu propia cuenta" : "Eliminar usuario"}
                              >
                                {pendingAction === `del-user-${u.id}` ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <Trash2 size={16} />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                      {users.length === 0 && (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-gray-400">
                            No hay usuarios registrados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* ===================== TRABAJOS ===================== */}
              {tab === "jobs" && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left border-b border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400">
                        <th className="p-4">Título</th>
                        <th className="p-4">Publicado por</th>
                        <th className="p-4">Ubicación</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4">Estado</th>
                        <th className="p-4">Postulaciones</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((j) => (
                        <tr
                          key={j.id}
                          className="border-b border-gray-50 dark:border-slate-700"
                        >
                          <td className="p-4 font-medium dark:text-white">{j.title}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{j.owner_name}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{j.location}</td>
                          <td className="p-4 dark:text-gray-300">${j.price}</td>
                          <td className="p-4">
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-300">
                              {j.status}
                            </span>
                          </td>
                          <td className="p-4 dark:text-gray-300">{j.applications_count}</td>
                          <td className="p-4 text-right">
                            <button
                              disabled={pendingAction === `del-job-${j.id}`}
                              onClick={() => handleDeleteJob(j.id)}
                              className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 p-1.5 rounded-lg disabled:opacity-40"
                            >
                              {pendingAction === `del-job-${j.id}` ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </button>
                          </td>
                        </tr>
                      ))}

                      {jobs.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-gray-400">
                            No hay trabajos publicados.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default AdminDashboard;
