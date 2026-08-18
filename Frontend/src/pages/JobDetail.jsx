import { useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL } from "../api/client";
import { useToast } from "../context/ToastContext";
import { MapPin } from 'lucide-react';
import JobDetailSkeleton from "../components/JobDetailSkeleton";

function JobDetail() {
  const { id } = useParams();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // 🔥 usuario actual
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 🔥 cargar trabajo
  useEffect(() => {
    let cancelled = false;

    const fetchJob = async (attempt = 1) => {
      setLoading(true);
      setNotFound(false);

      // Si programamos un reintento, no queremos que el "finally" apague
      // el estado de carga antes de que termine ese reintento (eso es lo
      // que causaba el parpadeo de "Trabajo no encontrado").
      let retryScheduled = false;

      try {
        const response = await apiFetch(`${API_URL}/jobs/${id}`);

        if (cancelled) return;

        if (response.status === 404) {
          // Reintenta una vez antes de dar por perdido el trabajo: con el
          // connection pooler de Supabase, la primera consulta de una
          // conexión reciclada a veces devuelve un 404 "falso" pasajero.
          if (attempt < 2) {
            retryScheduled = true;
            setTimeout(() => {
              if (!cancelled) fetchJob(attempt + 1);
            }, 700);
            return;
          }

          setJob(null);
          setNotFound(true);
          return;
        }

        if (!response.ok) {
          throw new Error(`Error del servidor (${response.status})`);
        }

        const data = await response.json();

        if (cancelled) return;

        setJob(data);
      } catch (error) {
        if (cancelled) return;

        // Reintenta una vez ante errores de red/servidor pasajeros
        // (por ejemplo, cuando el backend recién está "despertando"),
        // en vez de mostrar directo "trabajo no encontrado".
        if (attempt < 2) {
          retryScheduled = true;
          setTimeout(() => {
            if (!cancelled) fetchJob(attempt + 1);
          }, 1000);
          return;
        }

        console.error(error);
        setJob(null);
        setNotFound(true);
      } finally {
        // Solo apagamos "cargando" si de verdad terminamos (éxito o
        // fallo final) — nunca en medio de un reintento programado.
        if (!cancelled && !retryScheduled) setLoading(false);
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // 🔥 aplicar al trabajo
  const handleApply = async () => {
    // validar login
    if (!currentUser) {
      showToast("Debes iniciar sesión", "error");
      return;
    }

    // 🚫 evitar aplicar a su propio trabajo
    if (Number(job.owner_id) === Number(currentUser.id)) {
      showToast("No puedes aplicar a tu propio trabajo", "error");
      return;
    }

    try {
      const response = await apiFetch(`${API_URL}/applications`, {
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

      showToast("Postulación enviada 🚀", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    }
  };

  // 🔥 loading
  if (loading) {
    return (
      <div className="bg-secondary min-h-screen dark:bg-slate-900">
        <DashboardHeader />
        <PageWrapper>
          <div className="mt-6">
            <JobDetailSkeleton />
          </div>
        </PageWrapper>
      </div>
    );
  }

  // 🔥 no existe
  if (notFound || !job) {
    return (
      <div className="bg-secondary min-h-screen dark:bg-slate-900">
        <DashboardHeader />
        <PageWrapper>
          <div className="max-w-3xl mx-auto p-6 mt-6 bg-white dark:bg-slate-800 rounded-xl shadow">
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
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold dark:text-white">{job.title}</h1>

          <p className="text-gray-600 mt-4 dark:text-gray-300">{job.description}</p>

          <div className="flex justify-between mt-6">
            <span className="text-primary font-bold text-xl">${job.price}</span>

            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-2"><MapPin className="w-5 h-5" /> {job.location}</span>
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