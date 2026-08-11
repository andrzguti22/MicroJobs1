import { useEffect, useRef, useState } from "react";
import JobCard from "../components/JobCard";
import DashboardHeader from "../components/DashboardHeader";
import { motion } from "framer-motion";
import PageWrapper from "../components/PageWrapper";
import { apiFetch } from "../api/client";
import { Loader2, AlertTriangle, Search, SlidersHorizontal, X } from "lucide-react";

const PAGE_SIZE = 20;

const DEFAULT_FILTERS = {
  search: "",
  location: "",
  minPrice: "",
  maxPrice: "",
  sort: "recent",
};

function buildQuery(filters, skip) {
  const params = new URLSearchParams();

  params.set("skip", skip);
  params.set("limit", PAGE_SIZE);
  params.set("sort", filters.sort);

  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.location.trim()) params.set("location", filters.location.trim());
  if (filters.minPrice) params.set("min_price", filters.minPrice);
  if (filters.maxPrice) params.set("max_price", filters.maxPrice);

  return params.toString();
}

function ExploreJobs() {
  const [jobs, setJobs] = useState([]);

  // 'loading' = SOLO la primerísima carga de la página (muestra skeleton).
  // 'searching' = recargas por búsqueda/filtro (mantiene los resultados
  // actuales visibles con un indicador sutil, en vez de reemplazarlos
  // por skeletons cada vez que el usuario escribe o cambia un filtro).
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Filtros aplicados (los que ya se usaron para buscar)
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  // Filtros en edición (lo que el usuario está tipeando, antes de aplicar)
  const [draftFilters, setDraftFilters] = useState(DEFAULT_FILTERS);

  const debounceRef = useRef(null);
  const isFirstLoadRef = useRef(true);

  const fetchPage = async (skip, activeFilters) => {
    const query = buildQuery(activeFilters, skip);
    const response = await apiFetch(`http://localhost:8000/jobs?${query}`);

    if (!response.ok) {
      throw new Error("Error al obtener trabajos");
    }

    return response.json();
  };

  const loadFirstPage = async (activeFilters) => {
    // Solo la primera carga real de la página usa el skeleton de pantalla
    // completa. Las siguientes (búsqueda, filtros) usan 'searching'.
    if (isFirstLoadRef.current) {
      setLoading(true);
    } else {
      setSearching(true);
    }

    setError("");

    try {
      const data = await fetchPage(0, activeFilters);

      setJobs(data.items);
      setHasMore(data.has_more);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
      setError("No pudimos cargar los trabajos. Intenta de nuevo.");
    } finally {
      setLoading(false);
      setSearching(false);
      isFirstLoadRef.current = false;
    }
  };

  // Carga inicial
  useEffect(() => {
    loadFirstPage(DEFAULT_FILTERS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Búsqueda por texto: con debounce, para no pegarle al backend en cada tecla
  useEffect(() => {
    // Evita disparar una búsqueda extra durante el montaje inicial
    if (isFirstLoadRef.current) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const next = { ...filters, search: draftFilters.search };
      setFilters(next);
      loadFirstPage(next);
    }, 400);

    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draftFilters.search]);

  const applyFilters = () => {
    setFilters(draftFilters);
    loadFirstPage(draftFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setFilters(DEFAULT_FILTERS);
    loadFirstPage(DEFAULT_FILTERS);
    setShowFilters(false);
  };

  const handleLoadMore = async () => {
    setLoadingMore(true);
    setError("");

    try {
      const data = await fetchPage(jobs.length, filters);

      setJobs((prev) => [...prev, ...data.items]);
      setHasMore(data.has_more);
    } catch (err) {
      console.error(err);
      setError("No pudimos cargar más trabajos. Intenta de nuevo.");
    } finally {
      setLoadingMore(false);
    }
  };

  const activeFilterCount = ["location", "minPrice", "maxPrice"].filter(
    (key) => filters[key]
  ).length + (filters.sort !== "recent" ? 1 : 0);

  return (
    <div className="bg-secondary min-h-screen dark:bg-slate-900">
      <DashboardHeader />

      <PageWrapper>
        <div className="max-w-5xl mx-auto p-6">
          <h1 className="text-2xl font-bold dark:text-white mb-6">
            Explorar Trabajos
          </h1>

          {/* BARRA DE BÚSQUEDA Y FILTROS */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por título o descripción..."
                value={draftFilters.search}
                onChange={(e) =>
                  setDraftFilters((prev) => ({ ...prev, search: e.target.value }))
                }
                className="w-full pl-10 pr-4 py-3 border rounded-lg dark:bg-slate-800 dark:text-white dark:border-slate-700"
              />
              {searching && (
                <Loader2
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin"
                />
              )}
            </div>

            <button
              onClick={() => setShowFilters((prev) => !prev)}
              className="flex items-center justify-center gap-2 px-4 py-3 border rounded-lg dark:border-slate-700 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 transition relative"
            >
              <SlidersHorizontal size={18} />
              Filtros
              {activeFilterCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>

          {/* PANEL DE FILTROS */}
          {showFilters && (
            <div className="bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-xl p-5 mb-6 grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
                  Ubicación
                </label>
                <input
                  type="text"
                  placeholder="Ej. Medellín"
                  value={draftFilters.location}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, location: e.target.value }))
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="$0"
                  value={draftFilters.minPrice}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, minPrice: e.target.value }))
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
                  Precio máximo
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="Sin límite"
                  value={draftFilters.maxPrice}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, maxPrice: e.target.value }))
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-300 mb-1">
                  Ordenar por
                </label>
                <select
                  value={draftFilters.sort}
                  onChange={(e) =>
                    setDraftFilters((prev) => ({ ...prev, sort: e.target.value }))
                  }
                  className="w-full p-2.5 border rounded-lg dark:bg-slate-700 dark:text-white dark:border-slate-600"
                >
                  <option value="recent">Más recientes</option>
                  <option value="price_asc">Precio: menor a mayor</option>
                  <option value="price_desc">Precio: mayor a menor</option>
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-4 flex gap-3 justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-300 hover:text-red-500 transition"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>

                <button
                  onClick={applyFilters}
                  className="bg-primary text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:scale-105 transition duration-300"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          )}

          {!loading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {total} {total === 1 ? "trabajo encontrado" : "trabajos encontrados"}
            </p>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          {loading ? (
            <div className="grid md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-32 rounded-xl bg-gray-200 dark:bg-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : jobs.length === 0 && !error ? (
            <p className="text-gray-500">
              No encontramos trabajos con esos filtros. Prueba ajustarlos o limpiarlos.
            </p>
          ) : (
            <>
              <div
                className={`grid md:grid-cols-2 gap-4 transition-opacity duration-200 ${
                  searching ? "opacity-50" : "opacity-100"
                }`}
              >
                {jobs.map((job, index) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.35,
                      delay: (index % PAGE_SIZE) * 0.06,
                    }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </div>

              {hasMore && (
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition duration-300 disabled:opacity-60"
                  >
                    {loadingMore && <Loader2 size={18} className="animate-spin" />}
                    {loadingMore ? "Cargando..." : "Cargar más trabajos"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}

export default ExploreJobs;
