import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL, getStoredUser } from "../api/client";
import { useToast } from "../context/ToastContext";
import { AVAILABLE_CITIES } from "../constants/cities";

function CreateJob() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditMode = Boolean(jobId);
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
  });

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);

  // 🔥 En modo edición, cargar los datos actuales del trabajo
  useEffect(() => {
    if (!isEditMode) return;

    let cancelled = false;

    const loadJob = async () => {
      try {
        const response = await apiFetch(`${API_URL}/jobs/${jobId}`);

        if (!response.ok) {
          throw new Error("No se pudo cargar el trabajo");
        }

        const data = await response.json();

        if (cancelled) return;

        const currentUser = getStoredUser();

        if (currentUser?.id !== data.owner_id && currentUser?.role !== "admin") {
          showToast("No puedes editar un trabajo que no es tuyo", "error");
          navigate("/my-jobs");
          return;
        }

        setForm({
          title: data.title || "",
          description: data.description || "",
          location: data.location || "",
          price: data.price ?? "",
        });
      } catch (error) {
        console.error(error);
        showToast("No se pudo cargar el trabajo", "error");
        navigate("/my-jobs");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title || !form.description || !form.location || !form.price) {
      showToast("Completa todos los campos", "error");
      return;
    }

    setSaving(true);

    try {
      const currentUser = getStoredUser();

      const response = await apiFetch(
        isEditMode ? `${API_URL}/jobs/${jobId}` : `${API_URL}/jobs`,
        {
          method: isEditMode ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            isEditMode
              ? { ...form, price: Number(form.price) }
              : { ...form, price: Number(form.price), owner_id: currentUser.id }
          ),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        showToast(data.detail || "No se pudo guardar el trabajo", "error");
        setSaving(false);
        return;
      }

      showToast(isEditMode ? "Trabajo actualizado ✅" : "Trabajo publicado 🎉", "success");

      navigate(isEditMode ? "/my-jobs" : "/dashboard");
    } catch (error) {
      console.error(error);

      showToast("Debes iniciar sesión", "error");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-secondary min-h-screen dark:bg-slate-900">
        <DashboardHeader />
        <PageWrapper>
          <div className="max-w-xl mx-auto p-6 animate-pulse space-y-4">
            <div className="h-8 w-1/2 bg-gray-300 dark:bg-slate-700 rounded" />
            <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-24 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded-lg" />
            <div className="h-12 bg-gray-300 dark:bg-slate-700 rounded-lg" />
          </div>
        </PageWrapper>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-200">
            {isEditMode ? "Editar Trabajo" : "Publicar Trabajo"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="title"
              placeholder="Título"
              value={form.title}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            />

            <textarea
              name="description"
              placeholder="Descripción"
              value={form.description}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            />

            <select
              name="location"
              value={form.location}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            >
              <option value="">Selecciona una ciudad</option>

              {AVAILABLE_CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>

            <input
              type="number"
              name="price"
              placeholder="Precio"
              value={form.price}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            />

            <button
              disabled={saving}
              className="bg-primary text-white py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300 disabled:opacity-60 disabled:hover:scale-100"
            >
              {saving
                ? "Guardando..."
                : isEditMode
                  ? "Guardar Cambios"
                  : "Publicar"}
            </button>
          </form>
        </div>
      </PageWrapper>
    </div>
  );
}

export default CreateJob;
