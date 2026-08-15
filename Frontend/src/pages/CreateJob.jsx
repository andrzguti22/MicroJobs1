import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL } from "../api/client";
import { useToast } from "../context/ToastContext";

function CreateJob() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    price: "",
  });

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

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const response = await apiFetch(`${API_URL}/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          owner_id: currentUser.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.detail || "No se pudo publicar el trabajo", "error");
        return;
      }

      showToast("Trabajo publicado 🚀", "success");

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      showToast("Debes iniciar sesión", "error");
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6 dark:text-gray-200">Publicar Trabajo</h1>

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

            <input
              type="text"
              name="location"
              placeholder="Ubicación"
              value={form.location}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            />

            <input
              type="number"
              name="price"
              placeholder="Precio"
              value={form.price}
              onChange={handleChange}
              className="p-3 border rounded-lg dark:bg-slate-800 dark:text-gray-300"
            />

            <button className="bg-primary text-white py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300">
              Publicar
            </button>
          </form>
        </div>
      </PageWrapper>
    </div>
  );
}

export default CreateJob;
