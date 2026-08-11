import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import JobSkeleton from "../components/JobSkeleton";
import { apiFetch } from "../api/client";
import { useToast } from "../context/ToastContext";
import { useConfirm } from "../context/ConfirmContext";

function MyJobs() {
  const [activeJobs, setActiveJobs] = useState([]);
  const [inProgressJobs, setInProgressJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();
  const confirm = useConfirm();

  const navigate = useNavigate();

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) return;

      const response = await apiFetch(`http://localhost:8000/jobs/user/${currentUser.id}`);

      if (!response.ok) {
        throw new Error("Error obteniendo trabajos");
      }

      const data = await response.json();

      const active = data.filter((job) => job.status !== "in-progress" && job.status !== "finished");

      const inProgress = data.filter((job) => job.status === "in-progress");

      setActiveJobs(active);
      setInProgressJobs(inProgress);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 ELIMINAR TRABAJO
  const handleDelete = async (jobId) => {
    try {
      const response = await apiFetch(`http://localhost:8000/jobs/${jobId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error eliminando trabajo");
      }

      setActiveJobs((prev) => prev.filter((job) => job.id !== jobId));

      setInProgressJobs((prev) => prev.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error(error);
    }
  };

  // 🔥 FINALIZAR TRABAJO
  const handleFinish = async (job) => {
    try {
      const confirmFinish = await confirm({
        title: "¿Deseas finalizar este trabajo?",
        message: "Podrás calificar al trabajador justo después.",
        confirmText: "Finalizar",
      });

      if (!confirmFinish) return;

      const response = await apiFetch(`http://localhost:8000/jobs/${job.id}/finish`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Error finalizando trabajo");
      }

      navigate(`/review/${job.id}`, {
        state: {
          reviewedUserId: job.assigned_to_id,
          jobTitle: job.title,
        },
      });
    } catch (error) {
      console.error(error);

      showToast("No fue posible finalizar el trabajo", "error");
    }
  };

  // 🔥 CREAR / ABRIR CHAT
  const handleOpenChat = async (job) => {
    //PRUEBA
    console.log(job);

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      console.log({
        job_id: job.id,
        user_one_id: currentUser.id,
        user_two_id: job.assigned_to_id,
      });

      const response = await apiFetch("http://localhost:8000/conversations", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          job_id: job.id,
          user_one_id: currentUser.id,
          user_two_id: job.assigned_to_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Error creando conversación");
      }

      const data = await response.json();

      navigate(`/chat/${data.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-200">Mis Trabajos</h1>

          {/* 🟢 ACTIVOS */}
          <h2 className="font-semibold mb-2 dark:text-gray-300">🟢 Activos</h2>

          {loading ? (
            <>
              <JobSkeleton />
              <JobSkeleton />
            </>
          ) : activeJobs.length === 0 ? (
            <p className="text-gray-500 mb-6 dark:text-gray-300">No tienes trabajos activos</p>
          ) : (
            activeJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className="flex justify-between items-start p-5">
                  <div>
                    <span
                      className="
        inline-flex
        items-center
        bg-green-100
        text-green-700
        dark:bg-green-900/40
        dark:text-green-300
        text-xs
        font-semibold
        px-3
        py-1
        rounded-full
        "
                    >
                      🟢 Activo
                    </span>

                    <h2 className="text-xl font-bold mt-3 dark:text-white">{job.title}</h2>
                  </div>

                  <span className="text-xl font-bold text-primary">${job.price}</span>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  <div className="flex items-center gap-2 text-gray-500">📍 {job.location}</div>

                  <div className="flex items-center gap-2 text-gray-500">
                    👥 {job.applicationsCount || 0} postulantes
                  </div>

                  <div className="flex items-center gap-2 text-gray-500">📅 Publicado recientemente</div>
                </div>

                <hr className="dark:border-slate-700" />

                <div className="grid grid-cols-2 gap-3 p-5">
                  <button
                    onClick={() => navigate(`/job-applications/${job.id}`)}
                    className="bg-primary text-white rounded-xl py-3 font-semibold hover:scale-105 transition"
                  >
                    Ver postulantes
                  </button>

                  <button
                    onClick={() => handleDelete(job.id)}
                    className="bg-red-500 text-white rounded-xl py-3 font-semibold hover:bg-red-600 transition "
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}

          {/* 🟡 EN PROGRESO */}
          <div
            className="mt-12 mb-4 inline-flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full
            font-semibold
            "
          >
            🟡 En progreso
          </div>

          {loading ? (
            <>
              <JobSkeleton />
              <JobSkeleton />
            </>
          ) : inProgressJobs.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No tienes trabajos en progreso</p>
          ) : (
            inProgressJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                <h2 className="font-semibold dark:text-gray-300">{job.title}</h2>

                <p className="text-gray-500 text-sm dark:text-gray-400">📍 {job.location}</p>

                <p className="text-yellow-500 mt-2 font-semibold dark:text-gray-300">En progreso</p>

                <button
                  onClick={() => handleFinish(job)}
                  className="mt-3 w-full bg-green-500 text-white py-2 rounded-lg"
                >
                  Finalizar trabajo
                </button>

                <button
                  onClick={() => handleOpenChat(job)}
                  className="mt-2 w-full bg-blue-500 text-white py-2 rounded-lg"
                >
                  Ir al chat
                </button>
              </div>
            ))
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default MyJobs;
