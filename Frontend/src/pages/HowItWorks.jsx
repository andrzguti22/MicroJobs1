import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import PageWrapper from "../components/PageWrapper";

const steps = [
  {
    title: "1. Crea tu cuenta",
    description:
      "Regístrate gratis y completa tu perfil con información, experiencia y habilidades para destacar dentro de la comunidad.",
    image: "/step1.png",
  },

  {
    title: "2. Publica o encuentra trabajos",
    description:
      "Si necesitas ayuda, publica un trabajo en minutos. Si buscas oportunidades, explora los trabajos disponibles cerca de ti.",
    image: "/step2.png",
  },

  {
    title: "3. Envía postulaciones",
    description:
      "Postúlate a los trabajos que te interesen y realiza seguimiento al estado de cada solicitud desde tu panel personal.",
    image: "/step3.png",
  },

  {
    title: "4. Revisa perfiles y selecciona candidatos",
    description: "Los empleadores pueden revisar perfiles, habilidades y reseñas antes de aceptar al candidato ideal.",
    image: "/step4.png",
  },

  {
    title: "5. Chatea y coordina el trabajo",
    description:
      "Una vez aceptada la postulación, ambas partes pueden comunicarse mediante el chat integrado para organizar los detalles.",
    image: "/step5.png",
  },

  {
    title: "6. Completa el trabajo",
    description:
      "Realiza el trabajo acordado y marca la tarea como finalizada cuando ambas partes hayan completado el proceso.",
    image: "/step6.png",
  },

  {
    title: "7. Deja una reseña",
    description:
      "Después de finalizar un trabajo, puedes calificar tu experiencia. Las reseñas ayudan a construir confianza dentro de la comunidad.",
    image: "/step7.png",
  },
];

function HowItWorks() {
  const navigate = useNavigate();
  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen pt-20">
      <Navbar />
      <PageWrapper>
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* HEADER */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-dark dark:text-white">
            ¿Cómo funciona MicroJobs?
          </h1>

          <p className="text-center text-gray-500 mt-4 mb-12 dark:text-gray-400">
            Publica trabajos, encuentra oportunidades y conecta con personas de confianza en tu comunidad.
          </p>

          {/* STEPS */}
          <div className="flex flex-col gap-16">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col md:flex-row items-center gap-10 ${
                  index % 2 !== 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* IMAGEN */}
                <img src={step.image} alt={step.title} className="w-[300px] md:w-[400px] rounded-lg" />

                {/* TEXTO */}
                <div className="max-w-md">
                  <h2 className="text-2xl font-bold text-primary">{step.title}</h2>

                  <p className="text-gray-600 dark:text-gray-400 mt-4">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-20 bg-white rounded-2xl shadow p-8 text-center dark:bg-slate-800 ">
            <h2 className="text-2xl font-bold text-primary mb-4">¿Listo para comenzar?</h2>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Únete a MicroJobs y conecta con personas que necesitan tus habilidades o encuentra ayuda para tus
              proyectos.
            </p>

            <button onClick={() => navigate("/register")} className="bg-primary text-white px-6 py-3 rounded-xl">
              Crear cuenta gratis
            </button>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default HowItWorks;
