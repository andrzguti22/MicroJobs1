import { useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";

function JobDetail() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 usuario actual
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 🔥 cargar trabajo
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await fetch(`http://localhost:8000/jobs/${id}`);

        if (!response.ok) {
          throw new Error("Trabajo no encontrado");
        }

        const data = await response.json();

        setJob(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  // 🔥 aplicar al trabajo
  const handleApply = async () => {
    // validar login
    if (!currentUser) {
      alert("Debes iniciar sesión");
      return;
    }

    // 🚫 evitar aplicar a su propio trabajo
    if (Number(job.owner_id) === Number(currentUser.id)) {
      alert("No puedes aplicar a tu propio trabajo");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.id,
          job_id: job.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Error aplicando");
      }

      alert("Postulación enviada 🚀");
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // 🔥 loading
  if (loading) {
    return <p className="p-6">Cargando trabajo...</p>;
  }

  // 🔥 no existe
  if (!job) {
    return <h1 className="p-6">Trabajo no encontrado</h1>;
  }

  return (
    <div className="bg-secondary min-h-screen pt-24 dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold dark:text-white">{job.title}</h1>

          <p className="text-gray-600 mt-4 dark:text-gray-300">{job.description}</p>

          <div className="flex justify-between mt-6">
            <span className="text-primary font-bold text-xl">${job.price}</span>

            <span className="text-gray-500 dark:text-gray-400">📍 {job.location}</span>
          </div>

          <button onClick={handleApply} className="mt-6 bg-primary text-white px-6 py-3 rounded-lg">
            Aplicar al trabajo
          </button>
        </div>
      </PageWrapper>
    </div>
  );
}

export default JobDetail;
