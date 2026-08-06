import { useEffect, useState } from "react";
import JobCard from "../components/JobCard";
import DashboardHeader from "../components/DashboardHeader";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { apiFetch } from "../api/client";

function ExploreJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await apiFetch("http://localhost:8000/jobs");

        if (!response.ok) {
          throw new Error("Error al obtener trabajos");
        }

        const data = await response.json();

        const filteredJobs = data
          .filter((job) => job.status !== "finished")
          .sort((a, b) => b.id - a.id);

        setJobs(filteredJobs);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Loading rápido
  if (loading) {
    return (
      <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
        <DashboardHeader />
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader />

      <PageWrapper>
        <div className="max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-bold dark:text-white mb-6">
            Explorar Trabajos
          </h1>

          {jobs.length === 0 ? (
            <p className="text-gray-500">
              No hay trabajos disponibles.
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {jobs.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 30, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    duration: 0.35,
                    delay: index * 0.06,
                  }}
                >
                  <JobCard job={job} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default ExploreJobs;