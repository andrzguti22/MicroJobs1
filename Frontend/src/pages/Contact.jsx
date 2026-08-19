import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";
import { Mail, MessageCircle, HelpCircle } from "lucide-react";

function Contact() {
  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen pt-20">
      <Navbar />
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-white">
            Contáctanos
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-4 mb-12">
            ¿Tienes una duda, un problema técnico, o quieres reportar algo? Estamos para ayudarte.
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-10">
            <div className="w-16 h-16 mx-auto flex items-center justify-center bg-primary/10 rounded-full mb-6">
              <Mail className="text-primary" size={28} />
            </div>

            <h2 className="text-xl font-bold text-dark dark:text-white mb-2">
              Escríbenos por correo
            </h2>

            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Respondemos lo antes posible.
            </p>

            <a
              href="mailto:microjobslocal@gmail.com"
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:scale-105 hover:shadow-lg transition duration-300"
            >
              microjobslocal@gmail.com
            </a>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 mt-8 text-left">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
              <MessageCircle className="text-primary mb-3" size={24} />
              <h3 className="font-bold text-dark dark:text-white mb-1">
                Problemas con un trabajo o usuario
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Cuéntanos qué pasó, con quién, y el nombre o correo del trabajo o usuario involucrado, para
                poder ayudarte más rápido.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6">
              <HelpCircle className="text-primary mb-3" size={24} />
              <h3 className="font-bold text-dark dark:text-white mb-1">
                Dudas sobre cómo funciona MicroJobs
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Revisa nuestra página de{" "}
                <a href="/how-it-works" className="text-primary hover:underline">
                  Cómo Funciona
                </a>{" "}
                o escríbenos directamente si algo no quedó claro.
              </p>
            </div>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Contact;
