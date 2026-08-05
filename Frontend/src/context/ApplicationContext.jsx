import { createContext, useState, useEffect } from "react";

export const ApplicationContext = createContext();

export function ApplicationProvider({ children }) {
  // 🔥 STATE APLICACIONES
  const [applications, setApplications] = useState([]);

  // 🔥 STATE CONVERSACIONES (nuevo, bien hecho)
  const [conversations, setConversations] = useState([]);

  // 🔥 CARGA INICIAL
  useEffect(() => {
    const storedApps = JSON.parse(localStorage.getItem("applications")) || [];
    const storedConvs = JSON.parse(localStorage.getItem("conversations")) || [];

    setApplications(storedApps);
    setConversations(storedConvs);
  }, []);

  // =========================
  // 🚀 APLICAR A TRABAJO
  // =========================
  const applyToJob = (job) => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (!currentUser || !currentUser.email) {
      alert("Debes iniciar sesión");
      return false;
    }

    if (job.userEmail === currentUser.email) {
      alert("No puedes aplicar a tu propio trabajo 😅");
      return false;
    }

    const applicationsLS =
      JSON.parse(localStorage.getItem("applications")) || [];

    const alreadyApplied = applicationsLS.some(
      (app) =>
        app.userEmail === currentUser.email &&
        String(app.jobId) === String(job.id)
    );

    if (alreadyApplied) {
      alert("Ya aplicaste a este trabajo");
      return false;
    }

    const newApplication = {
      id: Date.now(),
      userEmail: currentUser.email,
      userName: currentUser.name,
      jobId: job.id,
      title: job.title,
      price: job.price,
      location: job.location,
      status: "pending",
    };

    const updatedApplications = [...applicationsLS, newApplication];

    localStorage.setItem(
      "applications",
      JSON.stringify(updatedApplications)
    );

    setApplications(updatedApplications);

    return true;
  };

  // =========================
  // 🗑 ELIMINAR APLICACIÓN
  // =========================
  const deleteApplication = (id) => {
    const applicationsLS =
      JSON.parse(localStorage.getItem("applications")) || [];

    const updated = applicationsLS.filter((app) => app.id !== id);

    localStorage.setItem("applications", JSON.stringify(updated));

    setApplications(updated);
  };

  // =========================
  // 💬 CREAR CONVERSACIÓN
  // =========================
  const createConversation = (jobId, employerEmail, workerEmail) => {
    let conversationsLS =
      JSON.parse(localStorage.getItem("conversations")) || [];

    const conversationId = `${jobId}_${employerEmail}_${workerEmail}`;

    const exists = conversationsLS.some((c) => c.id === conversationId);

    if (!exists) {
      const newConversation = {
        id: conversationId,
        jobId,
        participants: [employerEmail, workerEmail],
        lastMessage: "",
        updatedAt: new Date().toISOString(),
      };

      const updated = [...conversationsLS, newConversation];

      localStorage.setItem("conversations", JSON.stringify(updated));
      setConversations(updated);
    }
  };

  return (
    <ApplicationContext.Provider
      value={{
        applications,
        applyToJob,
        deleteApplication,
        conversations,
        createConversation, // 🔥 ahora sí usable en toda la app
      }}
    >
      {children}
    </ApplicationContext.Provider>
  );
}

