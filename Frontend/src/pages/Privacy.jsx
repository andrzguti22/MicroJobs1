import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function Privacy() {
  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen pt-20">
      <Navbar />
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-white">
            Política de Privacidad
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-10 text-sm">
            Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-8 space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-primary mb-2">1. Introducción</h2>
              <p>
                En MicroJobs nos tomamos en serio la protección de tus datos personales. Esta política
                explica qué información recolectamos, para qué la usamos, y qué derechos tienes sobre ella,
                en cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013 de Colombia (régimen de
                protección de datos personales / Habeas Data).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">2. Qué información recolectamos</h2>
              <p>Al usar MicroJobs, podemos recolectar:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Datos de registro: nombre, correo electrónico y contraseña (almacenada de forma cifrada, nunca en texto plano).</li>
                <li>Datos de perfil: ciudad, teléfono, experiencia, biografía, habilidades y foto de perfil.</li>
                <li>Contenido que publicas: descripciones de trabajos, postulaciones, imágenes de portafolio, mensajes de chat y reseñas.</li>
                <li>Datos técnicos básicos necesarios para el funcionamiento del servicio (ej. dirección IP al hacer solicitudes al servidor, con fines de seguridad).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">3. Para qué usamos tu información</h2>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Crear y administrar tu cuenta.</li>
                <li>Mostrar tu perfil público a otros usuarios (nombre, ciudad, habilidades, reseñas, foto).</li>
                <li>Permitir la comunicación entre Empleadores y Freelancers mediante el chat.</li>
                <li>Enviarte correos transaccionales: verificación de cuenta, recuperación de contraseña, notificaciones relacionadas con tus trabajos o postulaciones.</li>
                <li>Prevenir fraude, spam o uso indebido de la Plataforma.</li>
              </ul>
              <p className="mt-2">No vendemos tu información personal a terceros.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">4. Con quién compartimos tu información</h2>
              <p>
                Parte de tu perfil (nombre, ciudad, habilidades, foto, reseñas) es visible públicamente
                dentro de la Plataforma para otros usuarios, ya que es necesario para el funcionamiento del
                servicio. Además, usamos proveedores externos que procesan datos en nuestro nombre bajo sus
                propias políticas de seguridad:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Alojamiento de la base de datos (Supabase) y del servidor backend (Render).</li>
                <li>Envío de correos electrónicos transaccionales (Resend).</li>
                <li>Alojamiento del sitio web (Vercel).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">5. Cómo protegemos tu información</h2>
              <p>
                Tu contraseña se almacena cifrada (nunca en texto plano). Las comunicaciones entre tu
                navegador y nuestros servidores viajan cifradas mediante HTTPS. El acceso a la base de datos
                está restringido y protegido con credenciales.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">6. Tus derechos (Habeas Data)</h2>
              <p>Como titular de tus datos personales, en cualquier momento puedes:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Conocer, actualizar y rectificar tus datos personales (editando tu perfil directamente).</li>
                <li>Solicitar la eliminación de tu cuenta y tus datos.</li>
                <li>Solicitar prueba de la autorización otorgada para el tratamiento de tus datos.</li>
                <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC) por infracciones a la ley.</li>
                <li>Revocar tu autorización y/o solicitar la supresión de tus datos cuando no exista un deber legal de conservarlos.</li>
              </ul>
              <p className="mt-2">
                Para ejercer cualquiera de estos derechos, escríbenos a{" "}
                <a href="mailto:microjobslocal@gmail.com" className="text-primary hover:underline">
                  microjobslocal@gmail.com
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">7. Retención de datos</h2>
              <p>
                Conservamos tus datos mientras tu cuenta esté activa. Si solicitas la eliminación de tu
                cuenta, eliminaremos o anonimizaremos tus datos personales, salvo que debamos conservar
                cierta información por obligación legal.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">8. Cambios a esta política</h2>
              <p>
                Podemos actualizar esta Política de Privacidad ocasionalmente. Si los cambios son
                significativos, te lo notificaremos a través de la Plataforma o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">9. Contacto</h2>
              <p>
                Si tienes preguntas sobre esta política o sobre el tratamiento de tus datos, escríbenos a{" "}
                <a href="mailto:microjobslocal@gmail.com" className="text-primary hover:underline">
                  microjobslocal@gmail.com
                </a>.
              </p>
            </section>
          </div>
        </div>
      </PageWrapper>
    </div>
  );
}

export default Privacy;
