import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { ApplicationContext } from "../context/ApplicationContext";

function JobCard({ job }) {
  const { applyToJob } = useContext(ApplicationContext);
  const navigate = useNavigate();

  const timeAgo = (dateString) => {
    const now = new Date();
    const created = new Date(dateString);

    const diffMinutes = Math.floor((now - created) / (1000 * 60));

    if (diffMinutes < 60) return `Hace ${diffMinutes} min`;

    const diffHours = Math.floor(diffMinutes / 60);

    if (diffHours < 24) return `Hace ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);

    return `Hace ${diffDays} días`;
  };
  return (
    <div
      onClick={() => navigate(`/job/${job.id}`)}
      className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 dark:hover:bg-slate-700 dark:hover:ring-2 dark:hover:ring-cyan-400/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]"
    >
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <h2 className="font-semibold text-lg text-dark dark:text-white">{job.title}</h2>

        <span className="text-primary font-bold text-lg">${job.price}</span>
      </div>

      {/* DESCRIPCIÓN */}
      <p className="text-gray-500 dark:text-gray-300 text-sm mt-3 line-clamp-2">{job.description}</p>

      {/* INFO */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-400">
        <span>📍 {job.location}</span>
        <span className="bg-gray-100 px-2 py-1 rounded-md text-xs dark:bg-slate-700 ">
          🕒 {timeAgo(job.created_at)}
        </span>
      </div>
    </div>
  );
}

export default JobCard;
