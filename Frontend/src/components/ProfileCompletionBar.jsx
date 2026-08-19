import { useNavigate } from "react-router-dom";

function getMissingFields(user, hasPortfolio) {
  const fields = [
    { key: "bio", label: "una biografía", done: !!user?.bio },
    { key: "skills", label: "tus habilidades", done: !!user?.skills?.length },
    { key: "city", label: "tu ciudad", done: !!user?.city },
    { key: "phone", label: "tu teléfono", done: !!user?.phone },
    { key: "profile_image", label: "una foto de perfil", done: !!user?.profile_image },
    { key: "portfolio", label: "fotos de tus trabajos", done: hasPortfolio },
  ];

  return fields;
}

function ProfileCompletionBar({ user, hasPortfolio }) {
  const navigate = useNavigate();

  const fields = getMissingFields(user, hasPortfolio);
  const completed = fields.filter((f) => f.done).length;
  const percentage = Math.round((completed / fields.length) * 100);

  // Perfil ya completo: no molestamos con la barra
  if (percentage === 100) return null;

  const nextMissing = fields.find((f) => !f.done);

  return (
    <div
      onClick={() => navigate("/profile")}
      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow mb-6 cursor-pointer hover:shadow-md transition"
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium dark:text-gray-200">
          Tu perfil está al {percentage}%
        </p>
        <p className="text-xs text-primary font-medium">Completar →</p>
      </div>

      <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {nextMissing && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Agrega {nextMissing.label} para mejorar tu perfil
        </p>
      )}
    </div>
  );
}

export default ProfileCompletionBar;