// Loading state for the dashboard route group.
//
// The session is verified on the server before anything is rendered, so this
// covers the round trip to the backend while the shell is being prepared.
export default function DashboardLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <span className="size-8 animate-spin rounded-full border-2 border-zinc-300 border-t-indigo-600 dark:border-zinc-700 dark:border-t-indigo-400" />
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Loading your dashboard…
        </p>
      </div>
    </div>
  );
}
