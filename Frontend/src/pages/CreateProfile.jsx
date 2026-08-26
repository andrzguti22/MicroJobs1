import { useContext, useEffect, useState } from "react";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "../components/DashboardHeader";
import PageWrapper from "../components/PageWrapper";
import { apiFetch, API_URL, getStoredUser } from "../api/client";
import { Pencil } from "lucide-react";
import { AVAILABLE_CITIES } from "../constants/cities";
import { useToast } from "../context/ToastContext";

// "profile_image" puede ser una URL completa (Supabase Storage,
// imágenes nuevas) o una ruta relativa vieja (uploads/..., de antes de
// la migración a Supabase Storage) -- solo anteponemos API_URL en el
// segundo caso.
function resolveImageUrl(path) {
  if (!path) return "";
  return path.startsWith("http") ? path : `${API_URL}/${path}`;
}

function CreateProfile() {
  const { saveUser } = useContext(UserContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentUser = getStoredUser();

  const [form, setForm] = useState({
    name: "",
    city: "",
    phone: "",
    experience: "",
    bio: "",
    skills: [],
  });

  const [skillInput, setSkillInput] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    setForm({
      name: currentUser.name || "",
      city: currentUser.city || "",
      phone: currentUser.phone || "",
      experience: currentUser.experience || "",
      bio: currentUser.bio || "",
      skills: currentUser.skills || [],
    });

    if (currentUser.profile_image) {
      setPreview(resolveImageUrl(currentUser.profile_image));
    }
  }, []);

  const addSkill = () => {
    const skill = skillInput.trim();

    if (!skill) return;

    if (form.skills.includes(skill)) {
      setSkillInput("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));

    setSkillInput("");
  };

  const removeSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skill),
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.city) return;

    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(form.phone)) return;

    if (!currentUser?.email) {
      navigate("/register");
      return;
    }

    setSaving(true);
    setSaved(false);

    try {
      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("city", form.city);
      formData.append("phone", form.phone);
      formData.append("experience", form.experience);
      formData.append("bio", form.bio);
      formData.append("skills", form.skills.join(","));

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      const response = await apiFetch(`${API_URL}/auth/profile/${currentUser.email}`, {
        method: "PUT",
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setSaving(false);
        showToast(data?.detail || "No se pudo guardar el perfil", "error");
        return;
      }

      localStorage.setItem("currentUser", JSON.stringify(data.user));

      saveUser(data.user);

      if (data.user.profile_image) {
        setPreview(resolveImageUrl(data.user.profile_image));
      }

      setSaving(false);
      setSaved(true);

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error(error);
      setSaving(false);
      showToast("No se pudo guardar el perfil", "error");
    }
  };

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />

      <PageWrapper>
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 mt-10 rounded-2xl shadow dark:bg-slate-800"
        >
          <div className="flex flex-col items-center mb-10">
            <label htmlFor="profileImage" className=" relative cursor-pointer group">
              <img
                src={preview || `https://ui-avatars.com/api/?name=${form.name}&background=random`}
                alt="Perfil"
                className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-xl group-hover:scale-105 transition duration-300"
              />
              <div className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-full shadow-lg transition">
                <Pencil className="w-4 h-4" />
              </div>
            </label>

            <input id="profileImage" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

            <h1 className="mt-5 text-3xl font-bold dark:text-white">{form.name || "Tu Perfil"}</h1>

            <p className="text-gray-500 dark:text-gray-300 mt-2">Personaliza cómo te verán los demás usuarios.</p>
          </div>

          {/* ==========================
              INFORMACIÓN PERSONAL
          ========================== */}

          <section className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Información personal</h2>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Nombre */}

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Nombre completo</label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* Ciudad */}

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Ciudad</label>

                <select
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                >
                  <option value="">Selecciona una ciudad</option>

                  {AVAILABLE_CITIES.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teléfono */}

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Teléfono</label>

                <input
                  type="text"
                  maxLength={10}
                  value={form.phone}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      phone: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
              </div>

              {/* Experiencia */}

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-2">Experiencia</label>

                <input
                  value={form.experience}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      experience: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
                />
              </div>
            </div>
          </section>

          {/* ==========================
              SOBRE MÍ
          ========================== */}

          <section className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Sobre mí</h2>

            <textarea
              rows={5}
              value={form.bio}
              onChange={(e) =>
                setForm({
                  ...form,
                  bio: e.target.value,
                })
              }
              placeholder="Cuéntales a los demás quién eres..."
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 resize-none focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
            />
          </section>
          {/* ==========================
              HABILIDADES
          ========================== */}

          <section className="bg-gray-50 dark:bg-slate-700 rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-semibold mb-6 dark:text-white">Habilidades</h2>

            <div className="flex flex-wrap gap-2 mb-5">
              {form.skills.length > 0 ? (
                form.skills.map((skill) => (
                  <span
                    key={skill}
                    className="flex items-center gap-2 bg-primary/10 text-primary dark:bg-primary/20 dark:text-white px-4 py-2 rounded-full text-sm font-medium transition"
                  >
                    {skill}

                    <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-500 transition">
                      ✕
                    </button>
                  </span>
                ))
              ) : (
                <p className="text-gray-400 text-sm">Aún no has agregado habilidades.</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                placeholder="Agregar habilidad..."
                className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 transition duration-300 focus:border-primary focus:ring-2 focus:ring-primary/30 dark:bg-slate-800 dark:border-slate-600 dark:text-white"
              />

              <button
                type="button"
                onClick={addSkill}
                className="bg-primary text-white px-6 rounded-xl font-medium hover:scale-105 hover:shadow-lg transition duration-300"
              >
                Agregar
              </button>
            </div>
          </section>

          {/* ==========================
              BOTÓN GUARDAR
          ========================== */}

          <div className="mt-8">
            <button
              type="submit"
              disabled={saving || saved}
              className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                saved
                  ? "bg-green-500"
                  : saving
                    ? "bg-primary cursor-not-allowed"
                    : "bg-primary hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              {saved ? (
                "✔ Perfil actualizado"
              ) : saving ? (
                <div className="flex justify-center items-center gap-3">
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Guardando...
                </div>
              ) : (
                "Guardar Perfil"
              )}
            </button>
          </div>
        </form>
      </PageWrapper>
    </div>
  );
}

export default CreateProfile;
