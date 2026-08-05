import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import UserProfileSkeleton from "../components/UserProfileSkeleton";
import Avatar from "../components/Avatar";
import PortfolioGallery from "../components/PortfolioGallery";

function UserProfile() {
  const { id } = useParams();

  const [user, setUser] = useState(null);

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const location = useLocation();

  const backTo = location.state?.backTo || "/dashboard";

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`http://localhost:8000/users/${id}`);

        if (!response.ok) {
          throw new Error("Usuario no encontrado");
        }

        const data = await response.json();

        const reviewsResponse = await fetch(`http://localhost:8000/reviews/user/${id}`);

        if (reviewsResponse.ok) {
          const reviewsData = await reviewsResponse.json();

          setReviews(reviewsData);
        }

        setUser(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
        <DashboardHeader backTo={backTo} />

        <PageWrapper>
          <div className="max-w-4xl mx-auto mt-10">
            <UserProfileSkeleton />
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
        <DashboardHeader backTo={backTo} />

        <PageWrapper>
          <div className="max-w-4xl mx-auto mt-10 bg-white dark:bg-slate-800 rounded-xl shadow p-8">
            <h2 className="text-2xl font-bold dark:text-white">Usuario no encontrado</h2>
          </div>
        </PageWrapper>
      </div>
    );
  }

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader backTo={backTo} />
      <PageWrapper>
        <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-xl shadow dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <Avatar name={user.name} image={user.profile_image} size="lg" />
            <div>
              <h2 className="font-bold text-xl dark:text-gray-200">{user.name}</h2>

              <p className="text-gray-500 dark:text-gray-300">📍 {user.city || "Sin ciudad"}</p>
            </div>
          </div>

          <p className="mt-6 text-gray-600 dark:text-gray-300">
            {user.bio || "Este usuario aún no ha agregado descripción"}
          </p>

          <div className="mt-4 text-sm text-gray-500 dark:text-gray-300">
            <p>📞 {user.phone || "Sin teléfono"}</p>

            <p>💼 {user.experience || "Sin experiencia registrada"}</p>
          </div>
          <h3 className="text-lg font-semibold mt-6 mb-2 dark:text-gray-200">🛠️ Habilidades</h3>
          <div className="mt-6 flex gap-2 flex-wrap">
            {user.skills?.length > 0 ? (
              user.skills.map((skill, i) => (
                <span key={i} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-400 text-sm dark:text-gray-300">Sin habilidades registradas</p>
            )}
          </div>

          {/* PORTAFOLIO */}
          <PortfolioGallery userId={user.id} editable={false} />

          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4 dark:text-gray-200">⭐ Reseñas recibidas</h3>

            {reviews.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-xl dark:bg-slate-700">
                <p className="text-gray-500 dark:text-gray-300">Este usuario aún no tiene reseñas.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold dark:text-gray-300">{review.reviewer_name}</span>

                      <span className="text-sm text-gray-400">
                        {new Date(review.created_at).toLocaleDateString("es-CO")}
                      </span>
                    </div>

                    <div className="text-yellow-500 text-lg">{"⭐".repeat(review.rating)}</div>

                    <p className="text-gray-700 mt-2 dark:text-gray-400">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default UserProfile;
