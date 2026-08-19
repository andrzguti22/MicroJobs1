import { useEffect, useRef, useState, useCallback } from "react";

import { API_URL, getToken } from "../api/client";

const WS_BASE_URL = API_URL.replace(/^http/, "ws");

/**
 * Hook de WebSocket para un chat en tiempo real.
 *
 * Reemplaza el setInterval de 1 segundo que tenía Chat.jsx antes
 * (pedía el historial completo cada 1s sin importar si había algo
 * nuevo -- era, con diferencia, el polling más agresivo de toda la
 * app). Ahora el servidor empuja cada mensaje nuevo al instante.
 *
 * Incluye reconexión automática con backoff simple: si la conexión se
 * corta (el usuario cambia de red, el backend se reinicia, etc.), se
 * reintenta cada 3s hasta reconectar.
 */
export function useChatSocket(conversationId, { onMessage } = {}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  // Mantenemos la última versión del callback sin forzar que el efecto
  // de conexión se vuelva a ejecutar cada vez que el componente
  // padre re-renderiza y pasa una nueva función inline.
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!conversationId) return;

    let isUnmounted = false;

    const connect = () => {
      const token = getToken();

      if (!token) return;

      const socket = new WebSocket(
        `${WS_BASE_URL}/ws/chat/${conversationId}?token=${token}`
      );

      socketRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessageRef.current?.(data);
        } catch (error) {
          console.error("Mensaje de WebSocket inválido:", error);
        }
      };

      socket.onclose = () => {
        setConnected(false);

        if (!isUnmounted) {
          // Reintenta la conexión en 3s (ej. el backend se reinició,
          // se cayó el wifi un momento, etc.)
          reconnectTimerRef.current = setTimeout(connect, 3000);
        }
      };

      socket.onerror = () => {
        socket.close();
      };
    };

    connect();

    return () => {
      isUnmounted = true;

      clearTimeout(reconnectTimerRef.current);

      socketRef.current?.close();
    };
  }, [conversationId]);

  const sendMessage = useCallback((text) => {
    const socket = socketRef.current;

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      return false;
    }

    socket.send(JSON.stringify({ text }));

    return true;
  }, []);

  return { connected, sendMessage };
}