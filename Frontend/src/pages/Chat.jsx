import { useParams } from "react-router-dom";
import { useState, useEffect, useRef, useCallback } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch } from "../api/client";
import { useChatSocket } from "../hooks/useChatSocket";
import { useToast } from "../context/ToastContext";
import { Circle } from "lucide-react";

function Chat() {
  const { chatId } = useParams();
  const { showToast } = useToast();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const scrollRef = useRef(null);

  // 🔥 historial: se pide UNA vez al entrar al chat (por REST, como antes).
  // Los mensajes que lleguen DESPUÉS de esto ya no se piden por polling,
  // llegan solos por el WebSocket de abajo.
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await apiFetch(`http://localhost:8000/messages/${chatId}`);

        const data = await response.json();

        setMessages(data);
      } catch (error) {
        console.error(error);
        showToast("No se pudo cargar el historial del chat", "error");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // 🔥 mensajes en tiempo real
  const handleIncomingMessage = useCallback((message) => {
    setMessages((prev) => {
      // evita duplicar si por algún motivo llegara dos veces
      if (prev.some((m) => m.id === message.id)) return prev;
      return [...prev, message];
    });
  }, []);

  const { connected, sendMessage: sendViaSocket } = useChatSocket(chatId, {
    onMessage: handleIncomingMessage,
  });

  // 🔥 autoscroll al último mensaje
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🔥 enviar
  const sendMessage = async () => {
    const text = input.trim();

    if (!text) return;

    setInput("");

    // Camino principal: WebSocket (instantáneo, sin round-trip de polling)
    const sentViaSocket = sendViaSocket(text);

    if (sentViaSocket) return;

    // Respaldo si el socket no está conectado en este momento (ej. se
    // está reconectando): usamos el endpoint REST para no perder el
    // mensaje, y recargamos el historial para verlo reflejado.
    try {
      const response = await apiFetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: Number(chatId),
          sender_id: currentUser.id,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error("Error enviando mensaje");
      }

      const reloadResponse = await apiFetch(`http://localhost:8000/messages/${chatId}`);
      const data = await reloadResponse.json();
      setMessages(data);
    } catch (error) {
      console.error(error);
      showToast("No se pudo enviar el mensaje", "error");
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-xl font-bold dark:text-gray-200">Chat</h1>

            <span
              className="flex items-center gap-1 text-xs text-gray-400"
              title={connected ? "Conectado en tiempo real" : "Reconectando..."}
            >
              <Circle
                size={8}
                className={connected ? "fill-green-500 text-green-500" : "fill-amber-400 text-amber-400 animate-pulse"}
              />
              {connected ? "En vivo" : "Conectando..."}
            </span>
          </div>

          <div className="bg-white h-[400px] overflow-y-auto p-4 rounded-xl shadow flex flex-col gap-2 dark:bg-slate-800">
            {loading ? (
              <div className="flex flex-col gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-10 rounded-lg bg-gray-200 dark:bg-slate-700 animate-pulse ${
                      i % 2 === 0 ? "w-2/3 self-start" : "w-1/2 self-end"
                    }`}
                  />
                ))}
              </div>
            ) : messages.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-300 text-center">No hay mensajes aún</p>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-2 rounded-lg max-w-[70%] ${
                      msg.sender_id === currentUser.id ? "bg-primary text-white self-end" : "bg-gray-200"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                ))}
                <div ref={scrollRef} />
              </>
            )}
          </div>

          <div className="flex gap-2 mt-4 ">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              className="flex-1 p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
              placeholder="Escribe un mensaje..."
            />

            <button
              onClick={sendMessage}
              className="bg-primary text-white px-4 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
            >
              Enviar
            </button>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Chat;