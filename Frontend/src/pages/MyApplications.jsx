import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import StatCardSkeleton from "../components/StatSkeletonCard";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const currentUser = JSON.parse(localStorage.getItem("currentUser"));

        if (!currentUser) {
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:8000/applications/user/${currentUser.id}`);

        if (!response.ok) {
          throw new Error("Error cargando postulaciones");
        }

        const data = await response.json();

        setApplications(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const getStatusLabel = (status) => {
    if (status === "accepted") return "Aceptado";
    if (status === "rejected") return "Rechazado";
    return "Pendiente";
  };

  const getStatusColor = (status) => {
    if (status === "accepted") return "text-green-500";
    if (status === "rejected") return "text-red-500";
    return "text-yellow-500";
  };

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader />

      <PageWrapper>
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-300">Mis Postulaciones</h1>

          {/* SKELETON LOADING */}
          {loading ? (
            <div className="flex flex-col gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>
          ) : applications.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center dark:bg-slate-800">
              <p className="text-gray-500 dark:text-gray-400 text-lg">No has aplicado a ningún trabajo</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {applications.map((app) => (
                <div key={app.id} className="bg-white p-5 rounded-xl shadow dark:bg-slate-800">
                  <h2 className="font-semibold text-lg dark:text-gray-300">{app.job_title}</h2>

                  <p className="text-gray-500 text-sm mt-1 dark:text-gray-400">📍 {app.location || "Sin ubicación"}</p>

                  <p className="mt-3 text-sm dark:text-gray-300">
                    Estado:{" "}
                    <span className={`${getStatusColor(app.status)} font-semibold`}>{getStatusLabel(app.status)}</span>
                  </p>

                  {app.status === "accepted" && (
                    <p className="text-green-600 text-sm mt-2">🎉 Fuiste seleccionado para este trabajo</p>
                  )}

                  {app.status === "rejected" && <p className="text-red-500 text-sm mt-2">❌ No fuiste seleccionado</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default MyApplications;
