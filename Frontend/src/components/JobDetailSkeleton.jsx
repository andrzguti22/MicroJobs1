function JobDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-slate-800 rounded-xl shadow animate-pulse">
      <div className="h-9 w-3/4 rounded bg-gray-300 dark:bg-slate-700"></div>

      <div className="mt-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-300 dark:bg-slate-700"></div>
        <div className="h-4 w-full rounded bg-gray-300 dark:bg-slate-700"></div>
        <div className="h-4 w-2/3 rounded bg-gray-300 dark:bg-slate-700"></div>
      </div>

      <div className="flex justify-between mt-6">
        <div className="h-6 w-16 rounded bg-gray-300 dark:bg-slate-700"></div>
        <div className="h-6 w-32 rounded bg-gray-300 dark:bg-slate-700"></div>
      </div>

      <div className="h-12 w-48 mt-6 rounded-lg bg-gray-300 dark:bg-slate-700"></div>
    </div>
  );
}

export default JobDetailSkeleton;