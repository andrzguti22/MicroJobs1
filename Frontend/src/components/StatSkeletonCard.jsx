function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow animate-pulse">
      <div className="h-4 w-24 bg-gray-300 dark:bg-slate-700 rounded"></div>

      <div className="h-8 w-16 bg-gray-300 dark:bg-slate-700 rounded mt-3"></div>
    </div>
  );
}

export default StatCardSkeleton;