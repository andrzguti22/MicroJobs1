import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch } from "../api/client";

function Chat() {
  const { chatId } = useParams();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 🔥 cargar mensajes
  const loadMessages = async () => {
    try {
      const response = await apiFetch(`http://localhost:8000/messages/${chatId}`);

      const data = await response.json();

      setMessages(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadMessages();

    const interval = setInterval(() => {
      loadMessages();
    }, 1000);

    return () => clearInterval(interval);
  }, [chatId]);

  // 🔥 enviar
  const sendMessage = async () => {
    if (!input.trim()) return;

    try {
      const response = await apiFetch("http://localhost:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: Number(chatId),
          sender_id: currentUser.id,
          text: input,
        }),
      });

      if (!response.ok) {
        throw new Error("Error enviando mensaje");
      }

      setInput("");

      loadMessages();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-xl font-bold mb-4 dark:text-gray-200">Chat</h1>

          <div className="bg-white h-[400px] overflow-y-auto p-4 rounded-xl shadow flex flex-col gap-2 dark:bg-slate-800">
            {messages.length === 0 ? (
              <p className="text-gray-400 dark:text-gray-300 text-center">No hay mensajes aún</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-lg max-w-[70%] ${
                    msg.sender_id === currentUser.id ? "bg-primary text-white self-end" : "bg-gray-200"
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2 mt-4 ">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
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
