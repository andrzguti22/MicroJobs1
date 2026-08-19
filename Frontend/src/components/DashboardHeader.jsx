import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon, Bell, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import EmailVerificationBanner from "./EmailVerificationBanner";
import { useNotifications, useMarkAllNotificationsRead } from "../hooks/useNotifications";

function DashboardHeader({ showBell = false, showBackButton = true, backTo = null }) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);

  const [showNotifications, setShowNotifications] = useState(false);

  const { darkMode, toggleTheme } = useTheme();

  // =====================================
  // 🔥 MEDIR EL BLOQUE FIJO (header + aviso de verificación si aparece)
  // =====================================
  // En vez de que cada página adivine un pt-20/pt-24 fijo, este componente
  // mide su propia altura real (que cambia si el banner de verificación
  // aparece o desaparece, o si su texto se parte en 2 líneas en mobile) y
  // empuja el contenido de la página exactamente esa cantidad. Así nunca
  // queda desincronizado.
  const fixedRef = useRef(null);

  const [fixedHeight, setFixedHeight] = useState(80);

  useLayoutEffect(() => {
    const node = fixedRef.current;

    if (!node) return;

    const updateHeight = () => {
      const height = node.offsetHeight;

      setFixedHeight(height);

      // La exponemos como variable CSS global para que cualquier otro
      // elemento fijo/posicionado de la app (ej. un sidebar propio de una
      // página) pueda anclarse a "justo debajo del header" sin tener que
      // adivinar un número — mismo problema, misma solución en un solo lugar.
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${height}px`
      );
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);

    return () => observer.disconnect();
  }, [currentUser]);

  // =====================================
  // 🔥 USER
  // =====================================
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));

    setCurrentUser(user);
  }, []);

  // =====================================
  // 🔥 NOTIFICACIONES (React Query: caché compartida con Notifications.jsx,
  // sin importar cuántos componentes usen este hook a la vez, se hace
  // una sola request de polling, no una por componente)
  // =====================================
  const { data: notifications = [] } = useNotifications(
    showBell ? currentUser?.id : undefined
  );

  const markAllAsRead = useMarkAllNotificationsRead(currentUser?.id);

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
    <>
      <div ref={fixedRef} className="fixed top-0 left-0 w-full z-50">
      <div className="bg-white shadow px-4 md:px-6 py-4 flex items-center justify-between border-b border-gray-200 dark:border-slate-700 dark:bg-slate-900 ">
      {/* IZQUIERDA */}
      <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg  ">
        <img src="/logo.png" alt="logo" className="w-10 h-10 rounded-lg" />

        <h1 className="font-bold text-lg md:text-xl">
          <span className="text-dark dark:text-white">Micro</span>

          <span className="text-primary">Jobs</span>
        </h1>
      </Link>

      {/* DERECHA */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* 🛡️ ACCESO ADMIN */}
        {currentUser?.role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 transition"
          >
            <ShieldAlert size={14} />
            Admin
          </Link>
        )}

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

                markAllAsRead.mutate();
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
              <div
                className="fixed left-1/2 -translate-x-1/2 w-[95vw] max-w-sm md:absolute md:top-auto md:left-auto md:translate-x-0 md:right-0 md:w-80 bg-white shadow-xl rounded-xl p-3 border max-h-[70vh] overflow-y-auto z-[999] dark:bg-slate-700 dark:text-white dark:"
                style={{ top: fixedHeight }}
              >
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

      {/* Aviso de correo sin verificar: DENTRO del mismo bloque medido,
          para que su altura (si aparece, o si su texto ocupa 2 líneas
          en mobile) también se sume automáticamente al espacio reservado */}
      <EmailVerificationBanner />
      </div>

      {/* Spacer: empuja el contenido real de la página exactamente lo que
          ocupe el bloque fijo de arriba (header + aviso, si está visible).
          Reemplaza los pt-20/pt-24 adivinados a mano que tenía cada página. */}
      <div style={{ height: fixedHeight }} aria-hidden="true" />
    </>
  );
}

export default DashboardHeader;