function UserProfileSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-8 animate-pulse">

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-slate-700"></div>

        <div className="flex-1">
          <div className="h-6 w-48 bg-gray-300 dark:bg-slate-700 rounded"></div>

          <div className="h-4 w-32 mt-3 bg-gray-300 dark:bg-slate-700 rounded"></div>
        </div>
      </div>

      <div className="h-4 w-full mt-8 bg-gray-300 dark:bg-slate-700 rounded"></div>
      <div className="h-4 w-4/5 mt-3 bg-gray-300 dark:bg-slate-700 rounded"></div>

      <div className="mt-8">
        <div className="h-5 w-32 bg-gray-300 dark:bg-slate-700 rounded"></div>

        <div className="flex gap-2 mt-4">
          <div className="h-8 w-20 rounded-full bg-gray-300 dark:bg-slate-700"></div>
          <div className="h-8 w-20 rounded-full bg-gray-300 dark:bg-slate-700"></div>
          <div className="h-8 w-20 rounded-full bg-gray-300 dark:bg-slate-700"></div>
        </div>
      </div>

      <div className="mt-10">
        <div className="h-6 w-40 bg-gray-300 dark:bg-slate-700 rounded"></div>

        {[1, 2].map((item) => (
          <div key={item} className="border rounded-xl p-4 mt-4">
            <div className="h-5 w-36 bg-gray-300 dark:bg-slate-700 rounded"></div>

            <div className="h-4 w-24 mt-3 bg-gray-300 dark:bg-slate-700 rounded"></div>

            <div className="h-4 w-full mt-4 bg-gray-300 dark:bg-slate-700 rounded"></div>

            <div className="h-4 w-3/4 mt-2 bg-gray-300 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default UserProfileSkeleton;