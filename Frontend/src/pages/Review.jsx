import { useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch } from "../api/client";
import { useToast } from "../context/ToastContext";

function Review() {
  const { jobId } = useParams();
  const { showToast } = useToast();

  const location = useLocation();

  const navigate = useNavigate();

  const reviewedUserId = location.state?.reviewedUserId;

  const jobTitle = location.state?.jobTitle;

  const [rating, setRating] = useState(5);

  const [comment, setComment] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!reviewedUserId) {
        showToast("No se encontró el usuario a calificar", "error");
        return;
      }

      if (comment.trim().length < 5) {
        showToast("Escribe un comentario de al menos 5 caracteres", "error");
        return;
      }

      setLoading(true);

      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      const response = await apiFetch("http://localhost:8000/reviews", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          job_id: Number(jobId),

          reviewer_id: currentUser.id,

          reviewed_user_id: reviewedUserId,

          rating,

          comment,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "Error creando reseña");
      }

      showToast("⭐ Reseña enviada correctamente", "success");

      navigate("/job-history");
    } catch (error) {
      console.error(error);

      showToast(error.message || "Error enviando la reseña", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 dark:bg-slate-800">
            <h1 className="text-2xl md:text-3xl font-bold text-center mb-2 dark:text-gray-300">Calificar trabajo</h1>

            <p className="text-center text-gray-500 dark:text-gray-400 mb-6">{jobTitle || "Trabajo finalizado"}</p>

            {/* ESTRELLAS */}
            <div className="mb-6">
              <label className="block font-semibold dark:text-gray-300 mb-3">¿Cómo calificas el trabajo?</label>

              <div className="flex justify-center gap-2 text-4xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-125"
                  >
                    {star <= rating ? "⭐" : "☆"}
                  </button>
                ))}
              </div>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">{rating} de 5 estrellas</p>
            </div>

            {/* COMENTARIO */}
            <div>
              <label className="block font-semibold dark:text-gray-300 mb-2">Comentario</label>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="5"
                placeholder="Describe tu experiencia trabajando con esta persona..."
                className="w-full border rounded-xl p-4 resize-none focus:outline-none focus:ring-2  focus:ring-primary dark:text-gray-300 dark:bg-slate-700 
              "
              />
            </div>

            {/* BOTONES */}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={() => navigate("/job-history")}
                className="w-full border border-gray-300 py-3 rounded-xl  hover:scale-105 hover:shadow-lg transition duration-300 dark:text-gray-300"
              >
                Cancelar
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="
                w-full
                bg-primary
                text-white
                py-3
                rounded-xl
                hover:opacity-90
                disabled:opacity-50
                hover:scale-105 hover:shadow-lg transition duration-300
              "
              >
                {loading ? "Enviando..." : "Enviar reseña"}
              </button>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Review;
