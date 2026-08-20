import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import JobApplicationSkeleton from "../components/JobApplicationSkeleton";
import { motion, AnimatePresence } from "framer-motion";
import Avatar from "../components/Avatar";
import { apiFetch, API_URL } from "../api/client";
import { useToast } from "../context/ToastContext";


function JobApplications() {
  const { jobId } = useParams();
  const { showToast } = useToast();

  const navigate = useNavigate();

  const [job, setJob] = useState(null);

  const [jobApplications, setJobApplications] = useState([]);

  const [loading, setLoading] = useState(true);

  // ====================================
  // 🔥 CARGAR DATA
  // ====================================
  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      // 🔥 TRABAJO
      const jobResponse = await apiFetch(`${API_URL}/jobs/${jobId}`);

      if (!jobResponse.ok) {
        throw new Error("Error cargando trabajo");
      }

      const jobData = await jobResponse.json();

      setJob(jobData);

      // 🔥 POSTULACIONES
      const applicationsResponse = await apiFetch(`${API_URL}/applications/job/${jobId}`);

      if (!applicationsResponse.ok) {
        throw new Error("Error cargando postulaciones");
      }

      const applicationsData = await applicationsResponse.json();

      setJobApplications(applicationsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // 🔥 LABEL STATUS
  // ====================================
  const getStatusLabel = (status) => {
    if (status === "accepted") {
      return "Aceptado";
    }

    if (status === "rejected") {
      return "Rechazado";
    }

    return "Pendiente";
  };

  // ====================================
  // 🔥 COLOR STATUS
  // ====================================
  const getStatusColor = (status) => {
    if (status === "accepted") {
      return "text-green-500";
    }

    if (status === "rejected") {
      return "text-red-500";
    }

    return "text-yellow-500";
  };

  // ====================================
  // 🔥 ACEPTAR / RECHAZAR
  // ====================================
  const handleStatus = async (appId, newStatus) => {
    try {
      const response = await apiFetch(`${API_URL}/applications/${appId}?status=${newStatus}`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error actualizando estado");
      }

      fetchData();
    } catch (error) {
      console.error(error);

      showToast("Error actualizando postulación", "error");
    }
  };

  // ====================================
  // 🔥 CREAR / ABRIR CHAT
  // ====================================
  const handleCreateChat = async (app) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const response = await apiFetch(`${API_URL}/conversations`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          job_id: Number(jobId),
          user_one_id: currentUser.id,
          user_two_id: app.user_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error creando conversación");
      }

      const data = await response.json();

      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error(error);

      showToast("Error abriendo chat", "error");
    }
  };

  // ====================================
  // 🔥 JOB NO ENCONTRADO
  // ====================================
  if (!loading && !job) {
    return (
      <div className="bg-secondary min-h-screen dark:bg-slate-900">
        <DashboardHeader />

        <PageWrapper>
          <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold dark:text-white">Trabajo no encontrado</h1>
          </div>
        </PageWrapper>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          {/* 🔥 TITLE */}
          <h1 className="text-2xl font-bold mb-2 dark:text-gray-300">Postulantes</h1>

          <p className="text-gray-500 mb-6 dark:text-gray-300">Trabajo: {job?.title}</p>

          {/* 🔥 EMPTY */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <JobApplicationSkeleton key={index} />
              ))}
            </div>
          ) : jobApplications.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center dark:bg-slate-800">
              <p className="text-gray-500 dark:text-gray-300 text-lg">Aún no tienes postulantes </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              <div className="flex flex-col gap-4">
                {jobApplications.map((app, index) => {
                  const isDisabled = app.status === "accepted" || app.status === "rejected";

                  return (
                    <motion.div
                      key={app.id}
                      layout
                      initial={{ opacity: 0, y: 25 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25, delay: index * 0.05 }}
                      className={`bg-white dark:bg-slate-800 rounded-2xl border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-4 sm:p-6 ${
                        app.status === "accepted"
                          ? "border-l-4 border-l-green-500 border-gray-200 dark:border-slate-700"
                          : app.status === "rejected"
                            ? "border-l-4 border-l-red-500 border-gray-200 dark:border-slate-700"
                            : "border-l-4 border-l-yellow-400 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                        {/* IZQUIERDA */}

                        <div className="flex gap-4 min-w-0">
                          <Avatar name={app.user_name} image={app.profile_image} />
                          <div className="min-w-0">
                            <div className="flex items-center gap-3 flex-wrap">
                              <h2 className="text-lg font-bold dark:text-white break-words">{app.user_name}</h2>

                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                                  app.status === "accepted"
                                    ? "bg-green-100 text-green-700"
                                    : app.status === "rejected"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {getStatusLabel(app.status)}
                              </span>
                            </div>

                            <p className="text-gray-500 dark:text-gray-400 mt-1 break-words">{app.user_email}</p>

                            <div className="flex gap-3 mt-4">
                              <button
                                onClick={() =>
                                  navigate(`/user/${app.user_id}`, {
                                    state: {
                                      backTo: `/job-applications/${jobId}`,
                                    },
                                  })
                                }
                                className="text-primary text-sm font-semibold hover:underline transition-colors"
                              >
                                Ver perfil
                              </button>

                              <button
                                onClick={() => handleCreateChat(app)}
                                className="text-blue-500 text-sm font-semibold hover:underline transition-colors"
                              >
                                Chatear
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* DERECHA */}

                        <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                          <button
                            disabled={isDisabled}
                            onClick={() => handleStatus(app.id, "accepted")}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                              isDisabled ? "bg-gray-300" : "bg-green-500 hover:bg-green-600 hover:scale-105"
                            }`}
                          >
                            Aceptar
                          </button>

                          <button
                            disabled={isDisabled}
                            onClick={() => handleStatus(app.id, "rejected")}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-white font-medium transition-all duration-300 ${
                              isDisabled ? "bg-gray-300" : "bg-red-500 hover:bg-red-600 hover:scale-105"
                            }`}
                          >
                            Rechazar
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </AnimatePresence>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default JobApplications;
