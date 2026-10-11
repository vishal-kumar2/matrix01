// src/components/VerificationResult.jsx
export default function VerificationResult({ item }) {
  if (!item) return null;

  if (item.rejectionReason) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
        <p className="font-bold">❌ Pickup Rejected</p>
        <p className="mt-1">{item.rejectionReason}</p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
      <p className="font-bold text-green-900">✅ AI Verification Passed</p>
      <div className="mt-2 space-y-1 text-xs">
        <p><span className="font-semibold">Detected Label:</span> {item.label || item.category}</p>
        {item.confidence > 0 && (
          <p><span className="font-semibold">Confidence:</span> {item.confidence.toFixed(1)}%</p>
        )}
        <p><span className="font-semibold">Est. Payout:</span> ₹{(item.estimatedValue / 100).toFixed(2)}</p>
      </div>
    </div>
  );
}