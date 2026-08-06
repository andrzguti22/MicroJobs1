import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import UserProfileSkeleton from "../components/UserProfileSkeleton";
import Avatar from "../components/Avatar";
import PortfolioGallery from "../components/PortfolioGallery";
import { apiFetch } from "../api/client";

function Profile() {
  const { user } = useContext(UserContext);

  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!user?.id) return;

        const response = await apiFetch(`http://localhost:8000/users/${user.id}`);

        if (!response.ok) {
          throw new Error("Error cargando perfil");
        }

        const data = await response.json();

        setProfile(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
        <DashboardHeader />

        <PageWrapper>
          <div className="max-w-4xl mx-auto mt-10">
            <UserProfileSkeleton />
          </div>
        </PageWrapper>
      </div>
    );
  }

  if (!profile) {
    return <h1 className="p-6">Perfil no encontrado</h1>;
  }

  return (
    <div className="bg-secondary min-h-screen pt-20 dark:bg-slate-900">
      <DashboardHeader />
      <PageWrapper>
        <div className="max-w-4xl mx-auto bg-white p-8 mt-10 rounded-xl shadow dark:bg-slate-800">
          {/* HEADER PERFIL */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              <Avatar name={profile.name} image={profile.profile_image} size="xl" className="ring-4 ring-primary/20" />

              <div>
                <h2 className="text-3xl font-bold dark:text-white">{profile.name}</h2>

                <p className="text-gray-500 dark:text-gray-400 mt-1">📍 {profile.city || "Sin ciudad"}</p>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span>📞 {profile.phone || "Sin teléfono"}</span>

                  <span>💼 {profile.experience || "Sin experiencia"}</span>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-8 border-gray-200 dark:border-slate-700" />

          {/* ACERCA DE MÍ */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-600 mt-2">
            <h3 className="text-lg font-semibold mb-3 dark:text-white">📝 Acerca de mí</h3>

            <p className="leading-7 text-gray-600 dark:text-gray-300">
              {profile.bio || "Este usuario aún no ha agregado una biografía."}
            </p>
          </div>

          {/* HABILIDADES */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-600 mt-6">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">🛠️ Habilidades</h3>

            {profile.skills?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="bg-primary/10 text-primary dark:bg-slate-400 border border-primary/20 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:bg-primary hover:text-white hover:scale-105"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 dark:text-gray-300">Este usuario aún no ha agregado habilidades.</p>
            )}
          </div>

          {/* PORTAFOLIO */}
          <PortfolioGallery userId={profile.id} editable={true} />

          {/* EDITAR */}
          <button
            onClick={() => navigate("/create-profile")}
            className="mt-6 bg-primary text-white px-4 py-2 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
          >
            Editar Perfil
          </button>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Profile;
