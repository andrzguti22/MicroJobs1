function JobApplicationSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow animate-pulse">
      <div className="flex justify-between">
        <div className="flex gap-3">

          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-slate-700"></div>

          <div>
            <div className="h-5 w-40 rounded bg-gray-300 dark:bg-slate-700"></div>

            <div className="h-4 w-56 mt-2 rounded bg-gray-300 dark:bg-slate-700"></div>

            <div className="h-4 w-24 mt-3 rounded bg-gray-300 dark:bg-slate-700"></div>

            <div className="h-8 w-24 mt-4 rounded bg-gray-300 dark:bg-slate-700"></div>
          </div>

        </div>

        <div className="flex flex-col gap-2">
          <div className="h-9 w-24 rounded bg-gray-300 dark:bg-slate-700"></div>

          <div className="h-9 w-24 rounded bg-gray-300 dark:bg-slate-700"></div>
        </div>

      </div>
    </div>
  );
}

export default JobApplicationSkeleton;