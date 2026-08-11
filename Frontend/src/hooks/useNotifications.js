import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, API_URL } from "../api/client";

/**
 * Hook único para notificaciones, para reemplazar las 3 implementaciones
 * independientes que existían (Dashboard.jsx, Notifications.jsx y
 * DashboardHeader.jsx cada uno con su propio useState + useEffect +
 * setInterval, pidiendo exactamente lo mismo sin saber unos de otros).
 *
 * Como todos usan la misma queryKey (["notifications", userId]), React
 * Query comparte la caché entre ellos automáticamente: si dos de estos
 * componentes están montados a la vez, solo se hace UNA request cada
 * vez que toca refrescar, no una por componente.
 */
export function useNotifications(userId) {
  return useQuery({
    queryKey: ["notifications", userId],

    queryFn: async () => {
      const response = await apiFetch(`${API_URL}/notifications/${userId}`);

      if (!response.ok) {
        throw new Error("Error cargando notificaciones");
      }

      return response.json();
    },

    enabled: !!userId,

    // Antes cada componente pedía cada 15-20s "a su manera". Con la
    // caché compartida, este único intervalo cubre a todos los
    // componentes que usen el hook al mismo tiempo.
    refetchInterval: 20 * 1000,
  });
}

/**
 * Cantidad de notificaciones sin leer, derivada de la misma query
 * (no dispara una request aparte).
 */
export function useUnreadNotificationsCount(userId) {
  const { data } = useNotifications(userId);

  if (!data) return 0;

  return data.filter((n) => !n.is_read).length;
}

/**
 * Marcar una notificación como leída. Al completarse, invalida la
 * query de notificaciones para que TODOS los componentes que la usan
 * se actualicen solos, sin tener que pasarse callbacks entre sí.
 */
export function useMarkNotificationRead(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (notificationId) => {
      const response = await apiFetch(
        `${API_URL}/notifications/read/${notificationId}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Error actualizando notificación");
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
}

/**
 * Marcar todas las notificaciones como leídas.
 */
export function useMarkAllNotificationsRead(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await apiFetch(
        `${API_URL}/notifications/read-all/${userId}`,
        { method: "PUT" }
      );

      if (!response.ok) {
        throw new Error("Error actualizando notificaciones");
      }

      return response.json();
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
    },
  });
}