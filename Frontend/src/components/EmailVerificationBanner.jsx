import { useContext, useState } from "react";
import { UserContext } from "../context/UserContext";
import { apiFetch, API_URL } from "../api/client";
import { useToast } from "../context/ToastContext";
import { MailWarning, Loader2 } from "lucide-react";

function EmailVerificationBanner() {
  const { user } = useContext(UserContext);
  const { showToast } = useToast();

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.email_verified) {
    return null;
  }

  const handleResend = async () => {
    setSending(true);

    try {
      const response = await apiFetch(`${API_URL}/auth/resend-verification`, {
        method: "POST",
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.detail || "No se pudo reenviar el correo");
      }

      setSent(true);
      showToast(data.message || "Correo reenviado", "success");
    } catch (error) {
      console.error(error);
      showToast(error.message || "No se pudo reenviar el correo", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center sm:justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
          <MailWarning size={16} className="shrink-0" />
          <span>Confirma tu correo electrónico para poder publicar trabajos y postularte a ellos.</span>
        </div>

        <button
          onClick={handleResend}
          disabled={sending || sent}
          className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300 underline hover:no-underline disabled:opacity-60 disabled:no-underline"
        >
          {sending && <Loader2 size={14} className="animate-spin" />}
          {sent ? "Correo reenviado ✓" : sending ? "Enviando..." : "Reenviar correo"}
        </button>
      </div>
    </div>
  );
}

export default EmailVerificationBanner;