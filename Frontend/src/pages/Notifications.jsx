import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { Bell } from "lucide-react";
import { useNotifications, useMarkNotificationRead } from "../hooks/useNotifications";

function Notifications() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Misma queryKey que usa DashboardHeader -> comparten caché real.
  // Si ambos están montados (el dropdown de la campana + esta página),
  // React Query solo hace una request, no dos.
  const { data: notifications = [], isLoading } = useNotifications(currentUser?.id);

  const markAsRead = useMarkNotificationRead(currentUser?.id);

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-200 flex items-center gap-2">
            Notificaciones <Bell className="w-5 h-5" />
          </h1>

          {isLoading ? (
            <div className="flex flex-col gap-3">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No tienes notificaciones</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead.mutate(notification.id)}
                  className={`p-4 rounded-xl shadow cursor-pointer transition ${
                    notification.is_read ? "bg-white dark:bg-slate-800" : "bg-yellow-100 dark:bg-slate-600"
                  }`}
                >
                  <div className="flex justify-between">
                    <p className="font-medium dark:text-gray-300">{notification.text}</p>

                    {!notification.is_read && <span className="text-xs text-red-500 font-bold">NUEVO</span>}
                  </div>

                  <p className="text-xs text-gray-400 mt-2">{new Date(notification.created_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default Notifications;