// src/components/ClusterProgress.jsx
export default function ClusterProgress({ cluster }) {
  if (!cluster) return null;

  const count = cluster.requestCount || 0;
  const threshold = cluster.densityThreshold || 5;
  const percentage = Math.min(Math.round((count / threshold) * 100), 100);

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs font-bold text-blue-900">Neighborhood Density Pool</span>
        <span className="text-xs font-semibold text-blue-700">{count} of {threshold} items</span>
      </div>
      <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
        <div
          className="bg-blue-600 h-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[11px] text-blue-700 mt-2">
        {count >= threshold
          ? '🎉 Threshold reached! Pickup is being scheduled.'
          : `Pooling e-waste in your zone to optimize agent collection route.`}
      </p>
    </div>
  );
}