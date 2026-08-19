import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch, API_URL } from "../api/client";

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

    refetchInterval: 20 * 1000,
  });
}


export function useUnreadNotificationsCount(userId) {
  const { data } = useNotifications(userId);

  if (!data) return 0;

  return data.filter((n) => !n.is_read).length;
}

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