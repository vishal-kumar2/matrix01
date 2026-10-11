// src/pages/Login.jsx
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();

  const handleDemoLogin = () => {
    // Hackathon demo mock user
    login({ 
      id: 'usr_123', 
      name: 'Vishal Kumar', 
      role: 'USER' 
    });
    navigate('/');
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-center p-6 text-center">
      {/* App Logo/Icon */}
      <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-3xl shadow-[0_10px_30px_rgba(20,184,166,0.4)] flex items-center justify-center mb-8 transform hover:rotate-12 transition-all duration-300">
        <span className="text-5xl drop-shadow-md">🏖️</span>
      </div>

      <h1 className="text-4xl font-black text-teal-950 mb-2 tracking-tight">EcoScrap</h1>
      <p className="text-teal-700 font-medium mb-12">Turn e-waste into clean water.</p>

      {/* Demo Login Button */}
      <div className="w-full max-w-sm space-y-4">
        <button
          onClick={handleDemoLogin}
          className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-black text-lg shadow-[0_8px_20px_rgba(20,184,166,0.3)] hover:shadow-[0_12px_25px_rgba(20,184,166,0.5)] hover:-translate-y-1 transition-all"
        >
          <span>👤</span> Login as Household User
        </button>

        <button
          onClick={() => alert("Agent flow coming soon!")}
          className="w-full flex items-center justify-center gap-3 bg-white text-teal-700 border-2 border-teal-100 py-4 rounded-2xl font-black text-lg shadow-sm hover:bg-teal-50 hover:border-teal-300 transition-all"
        >
          <span>🚚</span> Login as Collection Agent
        </button>
      </div>

      <p className="mt-8 text-xs text-teal-500 font-semibold uppercase tracking-wider">
        Hackathon Demo Mode
      </p>
    </div>
  );
}