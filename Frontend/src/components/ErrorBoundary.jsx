import { Component } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

/**
 * Error Boundary global: atrapa errores de renderizado en cualquier
 * componente hijo (ej. un .map() sobre undefined, una prop inesperada,
 * etc.) y muestra una pantalla de recuperación en vez de dejar la app
 * en blanco por completo.
 *
 * Debe ser un componente de clase: React todavía no soporta Error
 * Boundaries con hooks (no existe un "useErrorBoundary").
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Punto único donde conectar un servicio de monitoreo real en el
    // futuro (ej. Sentry, que ya está en requirements.txt del backend
    // pero no se usa en ningún lado -- este sería el lugar natural para
    // su equivalente en frontend, @sentry/react).
    console.error("Error atrapado por ErrorBoundary:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-secondary dark:bg-slate-900 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mb-4">
              <AlertTriangle className="text-red-500" size={28} />
            </div>

            <h1 className="text-xl font-bold dark:text-white mb-2">
              Algo salió mal
            </h1>

            <p className="text-gray-500 dark:text-gray-300 text-sm mb-6">
              Encontramos un error inesperado. Puedes intentar recargar la
              página o volver al inicio.
            </p>

            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-gray-100 dark:bg-slate-900 text-red-600 dark:text-red-400 rounded-lg p-3 mb-6 overflow-auto max-h-32">
                {this.state.error.toString()}
              </pre>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:scale-105 transition duration-300"
              >
                <RotateCcw size={16} />
                Recargar
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <Home size={16} />
                Ir al inicio
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;