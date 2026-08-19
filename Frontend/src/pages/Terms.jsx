import Navbar from "../components/Navbar";
import PageWrapper from "../components/PageWrapper";

function Terms() {
  return (
    <div className="bg-secondary dark:bg-slate-900 min-h-screen pt-20">
      <Navbar />
      <PageWrapper>
        <div className="max-w-3xl mx-auto px-6 py-16">
          <h1 className="text-3xl md:text-4xl font-bold text-dark dark:text-white">
            Términos y Condiciones
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-2 mb-10 text-sm">
            Última actualización: {new Date().toLocaleDateString("es-CO", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow p-8 space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-primary mb-2">1. Sobre MicroJobs</h2>
              <p>
                MicroJobs ("la Plataforma", "nosotros") es un servicio en línea que conecta a personas que
                necesitan ayuda con pequeños trabajos o tareas ("Empleadores") con personas dispuestas a
                realizarlos ("Freelancers"). Al crear una cuenta o usar la Plataforma, aceptas estos
                Términos y Condiciones en su totalidad.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">2. Quién puede usar la Plataforma</h2>
              <p>
                Debes ser mayor de edad (18 años o más) para crear una cuenta. Al registrarte, declaras que
                la información que proporcionas (nombre, correo, ciudad, habilidades, etc.) es veraz y está
                actualizada.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">3. Naturaleza del servicio</h2>
              <p>
                MicroJobs es un espacio de intermediación: publicamos ofertas de trabajo y facilitamos el
                contacto entre Empleadores y Freelancers a través de nuestro sistema de postulaciones y
                chat. <strong>No somos empleadores de ninguna de las partes</strong>, no supervisamos la
                ejecución del trabajo, y no somos parte del acuerdo económico que las partes establezcan
                entre sí. La relación que surge de un trabajo publicado es exclusivamente entre el
                Empleador y el Freelancer.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">4. Responsabilidades del usuario</h2>
              <p>Al usar la Plataforma, te comprometes a:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>No publicar contenido falso, engañoso, discriminatorio, ilegal o que incite a la violencia.</li>
                <li>No usar la Plataforma para actividades ilegales o fraudulentas.</li>
                <li>Tratar con respeto a otros usuarios en el chat y en las publicaciones.</li>
                <li>Cumplir con los acuerdos (precio, alcance, plazos) que pactes directamente con la otra parte.</li>
                <li>No compartir credenciales de tu cuenta con terceros.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">5. Pagos</h2>
              <p>
                Actualmente, los pagos por los trabajos realizados se coordinan directamente entre el
                Empleador y el Freelancer, fuera de la Plataforma. MicroJobs no procesa, custodia ni
                garantiza ningún pago. Recomendamos acordar claramente el precio y la forma de pago antes de
                iniciar cualquier trabajo.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">6. Calificaciones y reseñas</h2>
              <p>
                Después de completar un trabajo, ambas partes pueden dejar una reseña. Las reseñas deben
                reflejar experiencias reales y no deben contener contenido ofensivo, difamatorio o falso.
                Nos reservamos el derecho de eliminar reseñas que incumplan esta norma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">7. Suspensión de cuentas</h2>
              <p>
                Podemos suspender o eliminar cuentas que incumplan estos Términos, que reciban múltiples
                reportes fundamentados, o que representen un riesgo para otros usuarios de la Plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">8. Limitación de responsabilidad</h2>
              <p>
                MicroJobs no garantiza la calidad, seguridad o legalidad de los trabajos publicados, ni la
                veracidad de los perfiles de los usuarios. En la máxima medida permitida por la ley, no
                somos responsables por daños, pérdidas o disputas que surjan de la relación entre Empleadores
                y Freelancers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">9. Cambios a estos Términos</h2>
              <p>
                Podemos actualizar estos Términos ocasionalmente. Si los cambios son significativos, te lo
                notificaremos a través de la Plataforma o por correo electrónico.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-primary mb-2">10. Contacto</h2>
              <p>
                Si tienes preguntas sobre estos Términos, escríbenos a{" "}
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

export default Terms;
