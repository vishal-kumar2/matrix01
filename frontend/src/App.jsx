// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

import Login from './pages/Login';
import Home from './pages/Home';
import NewRequest from './pages/NewRequest';
import PickupStatus from './pages/PickupStatus';
import Wallet from './pages/Wallet';
import AgentDashboard from './pages/AgentDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        {/* Beach & Green Global Background: Fullscreen on Desktop, Native on Mobile */}
        <div className="min-h-screen bg-gradient-to-br from-cyan-100 via-teal-50 to-emerald-200 text-teal-950 font-sans transition-all duration-300">
          
          {/* Main App Container */}
          {/* On Mobile: Full width/height. On Desktop: Centered card with expanded max-width */}
          <div className="mx-auto min-h-screen md:min-h-[85vh] md:my-8 md:max-w-2xl lg:max-w-4xl bg-white/80 backdrop-blur-2xl md:rounded-[2.5rem] shadow-[0_20px_50px_rgba(13,148,136,0.25)] overflow-hidden flex flex-col border-0 md:border-4 border-white/70 transition-all duration-300">
            
            {/* Top Navigation Bar (Shown across Desktop & Mobile) */}
            <header className="px-6 py-4 bg-white/40 border-b border-teal-100/60 flex justify-between items-center backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🏖️</span>
                <span className="font-black text-lg text-teal-900 tracking-tight">EcoScrap</span>
              </div>
              <span className="text-[11px] font-extrabold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase tracking-wider">
                Hackathon Demo
              </span>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-2 sm:p-4 md:p-6">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Home />} />
                <Route path="/new" element={<NewRequest />} />
                <Route path="/pickups/:id" element={<PickupStatus />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/agent" element={<AgentDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>

          </div>
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}