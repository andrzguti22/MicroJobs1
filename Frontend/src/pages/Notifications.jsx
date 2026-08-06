import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { Bell} from "lucide-react";
import { apiFetch } from "../api/client";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const loadNotifications = async () => {
    try {
      const response = await apiFetch(`http://localhost:8000/notifications/${currentUser.id}`);

      const data = await response.json();

      setNotifications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiFetch(`http://localhost:8000/notifications/read/${id}`, {
        method: "PUT",
      });

      loadNotifications();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadNotifications();

    const interval = setInterval(() => {
      loadNotifications();
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-200 flex items-center gap-2">Notificaciones <Bell className="w-5 h-5"/></h1>

          {notifications.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No tienes notificaciones</p>
          ) : (
            <div className="flex flex-col gap-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
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
