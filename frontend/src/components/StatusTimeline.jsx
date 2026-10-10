// src/components/StatusTimeline.jsx
export default function StatusTimeline({ status }) {
  const steps = [
    { key: 'AWAITING_VERIFICATION', label: 'Verifying' },
    { key: 'VERIFIED', label: 'Verified' },
    { key: 'POOLED', label: 'Pooled' },
    { key: 'SCHEDULED', label: 'Scheduled' },
    { key: 'COLLECTED', label: 'Collected' },
  ];

  const getStepIndex = (current) => {
    switch (current) {
      case 'AWAITING_VERIFICATION': return 0;
      case 'VERIFIED': return 1;
      case 'POOLED': return 2;
      case 'SCHEDULED': return 3;
      case 'COLLECTED': return 4;
      default: return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="py-4">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -z-0 transform -translate-y-1/2" />
        {steps.map((step, idx) => {
          const isDone = idx <= currentIndex;
          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 bg-white px-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  isDone ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}
              >
                {idx + 1}
              </div>
              <span className="text-[10px] font-semibold text-gray-600 mt-1">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}