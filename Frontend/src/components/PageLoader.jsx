import { Loader2 } from "lucide-react";

function PageLoader() {
  return (
    <div className="min-h-screen bg-secondary dark:bg-slate-900 flex items-center justify-center">
      <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );
}

export default PageLoader;