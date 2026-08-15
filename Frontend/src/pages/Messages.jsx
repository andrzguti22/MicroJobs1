import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import ConversationSkeleton from "../components/ConversationSkeleton";
import { MessageSquareText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiFetch } from "../api/client";

function Messages() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // ====================================
  // 🔥 CARGAR CONVERSACIONES
  // ====================================
  const loadConversations = async () => {
    try {
      const response = await apiFetch(
        `http://localhost:8000/conversations/user/${currentUser.id}`
      );

      if (!response.ok) {
        throw new Error("Error cargando conversaciones");
      }

      const data = await response.json();

      setConversations(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // 🔥 FORMATO FECHA
  // ====================================
  const formatChatDate = (dateString) => {
    const date = new Date(dateString);

    const today = new Date();

    const isToday = date.toDateString() === today.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
    });
  };

  // ====================================
  // 🔥 ABRIR CHAT
  // ====================================
  const openChat = async (chatId) => {
    try {
      await apiFetch(
        `http://localhost:8000/messages/read/${chatId}/${currentUser.id}`,
        {
          method: "PUT",
        }
      );

      navigate(`/chat/${chatId}`);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    loadConversations();

    const interval = setInterval(loadConversations, 5000);

    return () => clearInterval(interval);
  }, []);

  if (!currentUser) {
    return <h1 className="p-6">Debes iniciar sesión</h1>;
  }

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />

      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">

          {/* ============================= */}
          {/* TÍTULO */}
          {/* ============================= */}

          <motion.h1
            className="text-2xl font-bold mb-6 dark:text-gray-300 flex items-center gap-2"
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            Mensajes
            <MessageSquareText className="w-6 h-6" />
          </motion.h1>

          {/* ============================= */}
          {/* LOADING */}
          {/* ============================= */}

          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <ConversationSkeleton key={index} />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">
              No tienes conversaciones
            </p>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-3">

                {conversations.map((chat, index) => (

                  <motion.div
                    key={chat.id}
                    layout
                    initial={{
                      opacity: 0,
                      y: 20,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}
                    onClick={() => openChat(chat.id)}
                    className={`
                      bg-white
                      dark:bg-slate-800

                      p-4
                      rounded-xl
                      shadow

                      cursor-pointer

                      transition-all
                      duration-300

                      hover:-translate-y-1
                      hover:shadow-xl
                      hover:bg-gray-50

                      dark:hover:bg-slate-700

                      ${
                        chat.unread_count > 0
                          ? "border-l-4 border-primary bg-primary/10 dark:bg-slate-700"
                          : ""
                      }
                    `}
                  >
                    <div className="flex justify-between items-start">

                      {/* Avatar */}

                      <div className="flex gap-3">

                        <div
                          className="
                            w-12
                            h-12
                            rounded-full
                            bg-primary
                            text-white
                            flex
                            items-center
                            justify-center
                            font-bold
                            text-lg
                            shrink-0
                          "
                        >
                          {chat.other_user?.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <div className="flex items-center gap-2">

                            <p className="font-semibold dark:text-gray-300">
                              {chat.other_user?.name}
                            </p>

                            {chat.unread_count > 0 && (
                              <span
                                className="
                                  bg-green-500
                                  text-white
                                  text-xs
                                  w-6
                                  h-6
                                  rounded-full
                                  flex
                                  items-center
                                  justify-center
                                "
                              >
                                {chat.unread_count}
                              </span>
                            )}

                          </div>

                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {chat.other_user?.email}
                          </p>

                        </div>

                      </div>

                      <span className="text-xs text-gray-400 ">
                        {chat.updated_at
                          ? formatChatDate(chat.updated_at)
                          : ""}
                      </span>

                    </div>

                    <p className="text-sm text-gray-600 mt-3 truncate dark:text-gray-300">
                      {chat.last_message || "Sin mensajes"}
                    </p>

                  </motion.div>

                ))}

              </div>
            </AnimatePresence>
          )}

        </div>
      </PageWrapper>
    </div>
  );
}

export default Messages;