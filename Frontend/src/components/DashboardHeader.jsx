import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Bell } from "lucide-react";
import { Link } from "react-router-dom";

function DashboardHeader({ showBell = false, showBackButton = true, backTo = null }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  const [notifications, setNotifications] = useState([]);

  const [showNotifications, setShowNotifications] = useState(false);

  const { darkMode, toggleTheme } = useTheme();

  // =====================================
  // 🔥 USER
  // =====================================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    setCurrentUser(user);
  }, []);

  // =====================================
  // 🔥 NOTIFICACIONES
  // =====================================
  const loadNotifications = async () => {
    try {
      if (!currentUser || !showBell) return;

      const response = await fetch(`http://localhost:8000/notifications/${currentUser.id}`);

      if (!response.ok) {
        throw new Error("Error cargando notificaciones");
      }

      const data = await response.json();

      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // 🔥 AUTO REFRESH
  // =====================================
  useEffect(() => {
    if (!currentUser || !showBell) return;

    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser, showBell]);

  // =====================================
  // 🔥 MARCAR LEÍDAS
  // =====================================
  const markNotificationsAsRead = async () => {
    try {
      if (!currentUser) return;

      await fetch(`http://localhost:8000/notifications/read-all/${currentUser.id}`, {
        method: "PUT",
      });

      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  // =====================================
  // 🔥 BOTÓN VOLVER
  // =====================================
  const handleBack = () => {
    if (backTo) {
      navigate(backTo, { replace: true });
    } else {
      navigate(-1);
    }
  };

  // =====================================
  // 🔥 CONTADOR
  // =====================================
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow z-50 px-4 md:px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900 ">
      {/* IZQUIERDA */}
      <Link to= "/dashboard" className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg  ">
        <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-lg" />

        <h1 className="font-bold text-lg md:text-xl">
          <span className="text-dark dark:text-white">Micro</span>

          <span className="text-primary">Jobs</span>
        </h1>
      </Link>

      {/* DERECHA */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:scale-110 transition"
        >
          {darkMode ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
        </button>
        {/* 🔔 SOLO EN DASHBOARD */}
        {showBell && currentUser && (
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);

                markNotificationsAsRead();
              }}
              className="relative text-2xl"
            >
              <Bell className="w-6 h-6 text-gray-700 dark:text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2 py-[1px] ">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* DROPDOWN */}
            {showNotifications && (
              <div className="fixed top-16 left-1/2 -translate-x-1/2 w-[95vw] max-w-sm md:absolute md:top-auto md:left-auto md:translate-x-0 md:right-0 md:w-80 bg-white shadow-xl rounded-xl p-3 border max-h-[70vh] overflow-y-auto z-[999] dark:bg-slate-700 dark:text-white dark:">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-bold ">Notificaciones</h2>

                  <button onClick={() => navigate("/notifications")} className="text-primary text-sm">
                    Ver todas
                  </button>
                </div>

                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-300 text-sm">No tienes notificaciones</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 rounded-lg border text-sm ${
                          notification.is_read ? "bg-gray-50 dark:bg-slate-600" : "bg-blue-50  border-blue-200 "
                        }`}
                      >
                        <p className="break-words">{notification.text}</p>

                        <span className="text-xs text-gray-400">
                          {notification.created_at
                            ? new Date(notification.created_at).toLocaleString("es-CO", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* BOTÓN */}
        {showBackButton && (
          <button onClick={handleBack} className="text-sm font-medium hover:scale-110 transition dark:text-white">
            ← Volver
          </button>
        )}
      </div>
    </div>
  );
}

export default DashboardHeader;
