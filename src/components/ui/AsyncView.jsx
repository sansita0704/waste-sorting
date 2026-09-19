/**
 * Renders loading / error / data states for a `useAsyncData` query.
 * Usage: <AsyncView query={query} skeletonClassName="h-40">{(data) => ...}</AsyncView>
 */
export default function AsyncView({ query, skeletonClassName = "h-40", children }) {
  const { data, error, loading, reload } = query;

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 text-sm">
        <p className="text-red-400">Couldn't load this data. Check your connection and try again.</p>
        <button
          type="button"
          onClick={reload}
          className="mt-2 rounded-lg border border-zinc-700 px-3 py-1.5 text-zinc-200 hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        >
          Retry
        </button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div
        role="status"
        aria-label="Loading"
        className={`animate-pulse rounded-xl bg-zinc-800/60 ${skeletonClassName}`}
      />
    );
  }

  return children(data);
}
