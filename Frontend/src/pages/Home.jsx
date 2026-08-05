import Navbar from "../components/Navbar";
import JobCard from "../components/JobCard";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

function Home() {
  const navigate = useNavigate();
  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen pt-20 transition-colors duration-300">
      <Navbar />
      <PageWrapper>
        {/* HERO */}
        <section className="flex flex-col md:flex-row items-center justify-between px-10 py-16">
          <div className="max-w-lg">
            <h1 className="text-4xl font-bold text-dark dark:text-white">
              Pequeños trabajos, <br />
              <span className="text-primary">grandes soluciones</span>
            </h1>

            <p className="mt-4 text-gray-600 dark:text-gray-300">
              Conecta con personas de tu zona que necesitan ayuda con tareas rápidas. Gana dinero o encuentra quien te
              ayude, de forma fácil, segura y local.{" "}
            </p>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => navigate("/create")}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
              >
                Publicar un Trabajo
              </button>

              <button
                onClick={() => navigate("/explore")}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
              >
                Explorar Trabajos
              </button>
            </div>
          </div>

          <div className="mt-10 md:mt-0">
            <img src="/hero.png" alt="hero" className="w-[400px] rounded-xl" />
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid md:grid-cols-3 gap-6 px-10 pb-16">
          <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 dark:hover:bg-slate-700 dark:hover:ring-2 dark:hover:ring-cyan-400/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
              <span className="text-primary text-xl">⚡</span>
            </div>
            <h3 className="font-bold dark:text-white">Rápido y Fácil</h3>
            <p className="text-gray-500 mt-2 dark:text-gray-300">Publica o encuentra trabajos en minutos.</p>
          </div>

          <div className=" bg-white dark:bg-slate-700 p-4 rounded-xl shadow cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 dark:hover:bg-slate-700 dark:hover:ring-2 dark:hover:ring-cyan-400/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4 ">
              <span className="text-primary text-xl">📍</span>
            </div>
            <h3 className="font-bold dark:text-white">Cerca de Ti</h3>
            <p className="text-gray-500 mt-2 dark:text-gray-300">Conecta con personas de tu ciudad.</p>
          </div>

          <div className="bg-white dark:bg-slate-700 p-4 rounded-xl shadow cursor-pointer transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-105 dark:hover:bg-slate-700 dark:hover:ring-2 dark:hover:ring-cyan-400/40 dark:hover:shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-full mb-4">
              <span className="text-primary text-xl">🛡️</span>
            </div>
            <h3 className="font-bold dark:text-white">Seguro</h3>
            <p className="text-gray-500 mt-2 dark:text-gray-300">Sistema de calificaciones y confianza.</p>
          </div>
        </section>
        {/* FOOTER */}
        <footer className="mt-16 border-t border-gray-200 dark:border-slate-700 py-6 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © {new Date().getFullYear()} MicroJobs. Todos los derechos reservados.
          </p>
        </footer>
      </PageWrapper>
    </div>
  );
}

export default Home;
