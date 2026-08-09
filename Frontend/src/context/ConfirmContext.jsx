import { createContext, useCallback, useContext, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    const {
      title = "¿Estás seguro?",
      message = "",
      confirmText = "Confirmar",
      cancelText = "Cancelar",
      danger = false,
    } = options;

    setDialog({ title, message, confirmText, cancelText, danger });

    return new Promise((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  const handleClose = (result) => {
    setDialog(null);

    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <AnimatePresence>
        {dialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
            onClick={() => handleClose(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`p-2 rounded-full ${
                    dialog.danger
                      ? "bg-red-100 dark:bg-red-500/10"
                      : "bg-primary/10"
                  }`}
                >
                  <AlertTriangle
                    className={dialog.danger ? "text-red-500" : "text-primary"}
                    size={22}
                  />
                </div>
                <h3 className="text-lg font-semibold dark:text-white">
                  {dialog.title}
                </h3>
              </div>

              {dialog.message && (
                <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
                  {dialog.message}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => handleClose(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                >
                  {dialog.cancelText}
                </button>

                <button
                  onClick={() => handleClose(true)}
                  className={`px-4 py-2 rounded-lg text-sm text-white font-medium transition hover:scale-105 ${
                    dialog.danger
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary"
                  }`}
                >
                  {dialog.confirmText}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

/**
 * Hook para reemplazar window.confirm() nativo.
 * Uso: const confirm = useConfirm();
 *      const ok = await confirm({ title: "¿Eliminar?", danger: true });
 *      if (!ok) return;
 */
export function useConfirm() {
  const context = useContext(ConfirmContext);

  if (!context) {
    throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  }

  return context.confirm;
}