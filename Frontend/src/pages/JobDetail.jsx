import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import { useEffect, useState } from "react";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL, getErrorMessage } from "../api/client";
import { useToast } from "../context/ToastContext";
import { MapPin, Clock, Users, Send, ArrowLeft, ShieldCheck } from "lucide-react";
import JobDetailSkeleton from "../components/JobDetailSkeleton";

// $2000000 -> "$2.000.000"
function formatPrice(value) {
  return `$${new Intl.NumberFormat("es-CO").format(value)}`;
}

// created_at -> "Hace 2 días" / "Hoy" / "Hace 1 mes"
function formatRelativeDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Hoy";
  if (diffDays === 1) return "Hace 1 día";
  if (diffDays < 30) return `Hace ${diffDays} días`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths === 1) return "Hace 1 mes";
  if (diffMonths < 12) return `Hace ${diffMonths} meses`;

  const diffYears = Math.floor(diffMonths / 12);
  return diffYears === 1 ? "Hace 1 año" : `Hace ${diffYears} años`;
}

// job.status -> etiqueta + estilos (ajusta las llaves si tu backend usa otros valores)
function getStatusBadge(status) {
  const map = {
    available: { label: "Disponible", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    disponible: { label: "Disponible", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
    assigned: { label: "Asignado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    asignado: { label: "Asignado", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    completed: { label: "Completado", className: "bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300" },
    completado: { label: "Completado", className: "bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300" },
  };

  const key = (status || "").toLowerCase();
  return (
    map[key] || {
      label: status || "Sin estado",
      className: "bg-gray-200 text-gray-700 dark:bg-gray-700/40 dark:text-gray-300",
    }
  );
}

function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applying, setApplying] = useState(false);

  // 🔥 usuario actual
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // 🔥 cargar trabajo
  useEffect(() => {
    let cancelled = false;

    const fetchJob = async (attempt = 1) => {
      setLoading(true);
      setNotFound(false);

      let retryScheduled = false;

      try {
        const response = await apiFetch(`${API_URL}/jobs/${id}`);

        if (cancelled) return;

        if (response.status === 404) {
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

    setApplying(true);

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
        throw new Error(getErrorMessage(data, "Error aplicando"));
      }

      showToast("Postulación enviada 🚀", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message, "error");
    } finally {
      setApplying(false);
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

  const isOwner = currentUser && Number(job.owner_id) === Number(currentUser.id);
  const statusBadge = getStatusBadge(job.status);

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          {/* volver */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:opacity-80 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a trabajos
          </button>

          {/* encabezado */}
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${statusBadge.className}`}
          >
            {statusBadge.label}
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold dark:text-white">{job.title}</h1>

          <p className="text-gray-600 dark:text-gray-300 mt-3 text-[15px] leading-relaxed">
            {job.description}
          </p>

          <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-3 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5" />
            {job.location}
          </span>

          {/* barra de datos: precio, publicado, solicitudes */}
          <div className="grid grid-cols-3 mt-6 rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <div className="p-3 sm:p-4 border-r border-gray-200 dark:border-slate-700">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 block">Pago ofrecido</span>
              <span className="text-lg sm:text-xl font-bold text-primary">{formatPrice(job.price)}</span>
            </div>

            <div className="p-3 sm:p-4 border-r border-gray-200 dark:border-slate-700">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Publicado
              </span>
              <span className="text-sm sm:text-base font-medium dark:text-white">
                {formatRelativeDate(job.created_at)}
              </span>
            </div>

            <div className="p-3 sm:p-4">
              <span className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> Solicitudes
              </span>
              <span className="text-sm sm:text-base font-medium dark:text-white">
                {job.applicationsCount} {job.applicationsCount === 1 ? "persona" : "personas"}
              </span>
            </div>
          </div>

          {/* asignado a (solo si aplica, dato que ya devuelve el backend) */}
          {job.assignedTo && (
            <div className="flex items-center gap-2 mt-4 text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-slate-800 rounded-lg p-3 border border-gray-200 dark:border-slate-700">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              Asignado a <span className="font-medium dark:text-white">{job.assignedTo.name}</span>
            </div>
          )}

          {/* CTA */}
          {isOwner ? (
            <div className="mt-6 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
              Este es tu trabajo publicado.
            </div>
          ) : (
            <button
              onClick={handleApply}
              disabled={applying}
              className="mt-6 w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium disabled:opacity-60 transition hover:opacity-90"
            >
              <Send className="w-4 h-4" />
              {applying ? "Enviando..." : "Aplicar al trabajo"}
            </button>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default JobDetail;