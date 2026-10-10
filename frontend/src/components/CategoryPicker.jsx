// src/components/CategoryPicker.jsx
const CATEGORIES = [
  { id: 'MOBILE_PHONE', label: 'Mobile', icon: '📱' },
  { id: 'LAPTOP', label: 'Laptop', icon: '💻' },
  { id: 'TABLET', label: 'Tablet', icon: '📲' },
  { id: 'BATTERY', label: 'Battery', icon: '🔋' },
  { id: 'CHARGER_CABLE', label: 'Cable', icon: '🔌' },
  { id: 'SMALL_APPLIANCE', label: 'Small', icon: '📺' },
  { id: 'LARGE_APPLIANCE', label: 'Large', icon: '🧺' },
  { id: 'PERIPHERAL', label: 'Gear', icon: '🖱️' },
  { id: 'OTHER', label: 'Other', icon: '📦' },
];

export default function CategoryPicker({ selected, onSelect }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h3 className="text-xl font-extrabold text-teal-900 mb-4">What did you find on the shore?</h3>
      <div className="grid grid-cols-3 gap-4">
        {CATEGORIES.map((cat) => {
          const isSelected = selected === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelect(cat.id)}
              className={`relative p-4 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-b from-teal-400 to-emerald-500 text-white shadow-[0_8px_20px_rgba(20,184,166,0.4)] scale-105 -translate-y-1'
                  : 'bg-white border border-teal-100 text-teal-800 shadow-sm hover:shadow-md hover:border-teal-300 hover:-translate-y-1'
              }`}
            >
              {isSelected && (
                <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-black shadow-sm animate-bounce">
                  ✓
                </div>
              )}
              <span className={`text-3xl mb-2 transition-transform duration-300 ${isSelected ? 'scale-110' : ''}`}>
                {cat.icon}
              </span>
              <span className="text-xs font-black tracking-wide">{cat.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}