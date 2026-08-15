import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import StatCardSkeleton from "../components/StatSkeletonCard";
import { apiFetch, API_URL } from "../api/client";
import { MapPin , Clock } from "lucide-react"

function JobHistory() {
  const [history, setHistory] = useState([]);

  const [loading, setLoading] = useState(true);

  // =====================================
  // 🔥 CARGAR HISTORIAL
  // =====================================
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      if (!currentUser) return;

      const response = await apiFetch(`${API_URL}/job-history/${currentUser.id}`);

      if (!response.ok) {
        throw new Error("Error cargando historial");
      }

      const data = await response.json();

      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-300">Historial </h1>

          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-300">No tienes trabajos finalizados</p>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map((job) => (
                <div key={job.id} className="bg-white p-5 rounded-xl shadow dark:bg-slate-800">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="font-semibold text-lg dark:text-gray-300 pb-2">{job.title}</h2>

                      <p className="text-gray-500 text-sm dark:text-gray-400 flex items-center gap-2"> <MapPin className="w-5 h-5" /> {job.location}</p>
                    </div>

                    <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-semibold">
                      Finalizado
                    </span>
                  </div>

                  <p className="text-sm text-gray-400 mt-4 flex items-center gap-2"><Clock className="w-5 h-5"/> {new Date(job.finished_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default JobHistory;
