import { Loader2 } from "lucide-react";

/**
 * Fallback de <Suspense> mientras React descarga el chunk JS de una
 * página cargada con lazy(). Solo se ve brevemente (la primera vez que
 * se visita cada ruta); las siguientes veces el chunk ya está cacheado
 * por el navegador y no vuelve a mostrarse.
 */
function PageLoader() {
  return (
    <div className="min-h-screen bg-secondary dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}

export default PageLoader;