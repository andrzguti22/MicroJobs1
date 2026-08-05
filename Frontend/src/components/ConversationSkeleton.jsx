function ConversationSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow animate-pulse">
      <div className="flex justify-between">

        <div className="flex gap-3">

          <div className="w-12 h-12 rounded-full bg-gray-300 dark:bg-slate-700"></div>

          <div>

            <div className="h-4 w-32 rounded bg-gray-300 dark:bg-slate-700"></div>

            <div className="h-3 w-48 rounded bg-gray-300 dark:bg-slate-700 mt-2"></div>

          </div>

        </div>

        <div className="h-3 w-12 rounded bg-gray-300 dark:bg-slate-700"></div>

      </div>

      <div className="h-3 w-full rounded bg-gray-300 dark:bg-slate-700 mt-4"></div>

    </div>
  );
}

export default ConversationSkeleton;