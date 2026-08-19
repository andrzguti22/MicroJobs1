import { useEffect, useRef, useState, useCallback } from "react";

import { API_URL, getToken } from "../api/client";

const WS_BASE_URL = API_URL.replace(/^http/, "ws");


export function useChatSocket(conversationId, { onMessage } = {}) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);


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