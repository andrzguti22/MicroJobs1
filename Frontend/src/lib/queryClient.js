import { QueryClient } from "@tanstack/react-query";

/**
 * Cliente único de React Query para toda la app.
 *
 * staleTime: 15s -> si dos componentes piden los mismos datos (ej.
 * notificaciones) dentro de esta ventana, comparten la misma respuesta
 * en vez de disparar requests duplicados. Esto es justo lo que
 * resuelve el problema real: antes, DashboardHeader y Notifications.jsx
 * hacían polling cada uno por su cuenta, sin saber que el otro existía.
 *
 * refetchOnWindowFocus: false -> evita refetch sorpresa cada vez que el
 * usuario vuelve a la pestaña (puede sentirse "parpadeante" en una app
 * con varios paneles). Cada hook que lo necesite puede pedir polling
 * explícito con refetchInterval en su propio useQuery.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});