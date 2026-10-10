// src/components/ConditionForm.jsx
export default function ConditionForm({ value, onChange, formAnswers, setFormAnswers }) {
  const CONDITIONS = [
    { id: 'WORKING', label: 'Fully Working', desc: 'Turns on and works properly' },
    { id: 'PARTIALLY_WORKING', label: 'Partially Working', desc: 'Faults or missing accessories' },
    { id: 'DEAD', label: 'Dead / Won\'t Turn On', desc: 'Completely unresponsive' },
    { id: 'PHYSICALLY_DAMAGED', label: 'Physically Damaged', desc: 'Cracked body or broken display' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold mb-3">Item Condition</h3>
        <div className="space-y-2">
          {CONDITIONS.map((cond) => (
            <label
              key={cond.id}
              className={`block p-3 border rounded-xl cursor-pointer transition-all ${
                value === cond.id ? 'border-green-600 bg-green-50 ring-1 ring-green-600' : 'border-gray-200 bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="condition"
                  value={cond.id}
                  checked={value === cond.id}
                  onChange={(e) => onChange(e.target.value)}
                  className="text-green-600 focus:ring-green-500"
                />
                <div>
                  <p className="text-sm font-bold text-gray-800">{cond.label}</p>
                  <p className="text-xs text-gray-500">{cond.desc}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Quick Yes/No Diagnostic */}
      <div className="border-t pt-4 space-y-3">
        <h4 className="text-sm font-bold text-gray-700">Quick Assessment</h4>
        <div className="flex justify-between items-center text-sm">
          <span>Is original charger available?</span>
          <input
            type="checkbox"
            checked={formAnswers.hasCharger || false}
            onChange={(e) => setFormAnswers({ ...formAnswers, hasCharger: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded"
          />
        </div>
        <div className="flex justify-between items-center text-sm">
          <span>Major physical cracks/dents?</span>
          <input
            type="checkbox"
            checked={formAnswers.hasDents || false}
            onChange={(e) => setFormAnswers({ ...formAnswers, hasDents: e.target.checked })}
            className="w-4 h-4 text-green-600 rounded"
          />
        </div>
      </div>
    </div>
  );
}