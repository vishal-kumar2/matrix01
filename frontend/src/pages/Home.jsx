// src/pages/Home.jsx
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getWallet, getUserPickups } from '../lib/api';

export default function Home() {
  const { user, logout } = useUser();
  const [balance, setBalance] = useState(0);
  const [pickups, setPickups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchHomeData = async () => {
      try {
        const walletData = await getWallet(user.id);
        const pickupsData = await getUserPickups(user.id);
        setBalance(walletData.balance);
        setPickups(pickupsData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'AGENT') return <Navigate to="/agent" replace />;

  if (loading) return (
    <div className="p-4 text-center mt-20 animate-pulse text-teal-600 font-bold">
      🌊 Riding the waves to your dashboard...
    </div>
  );

  // Gamification logic mock
  const userXP = pickups.length * 150; 
  const userLevel = Math.floor(userXP / 500) + 1;
  const progressToNext = (userXP % 500) / 500 * 100;

  return (
    <div className="p-6 pb-24">
      {/* Gamified Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-teal-900 drop-shadow-sm">
            Aloha, {user.name.split(' ')[0]} 🌴
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 text-orange-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Level {userLevel} Recycler
            </span>
            <span className="text-xs font-bold text-teal-600">{userXP} XP</span>
          </div>
        </div>
        <button onClick={logout} className="text-xs text-emerald-600 hover:text-emerald-800 font-bold bg-white/50 px-3 py-1.5 rounded-full shadow-sm transition-all hover:scale-105">
          Logout
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-teal-100/50 h-3 rounded-full overflow-hidden shadow-inner">
          <div 
            className="bg-gradient-to-r from-teal-400 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out relative"
            style={{ width: `${progressToNext}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          </div>
        </div>
        <p className="text-[10px] text-teal-600 font-semibold mt-1 text-right">
          {500 - (userXP % 500)} XP to Level {userLevel + 1}
        </p>
      </div>

      {/* Wallet Card - Glassy Ocean Design */}
      <div className="relative bg-gradient-to-br from-emerald-500 to-teal-700 text-white rounded-[2rem] p-6 mb-8 shadow-[0_10px_30px_rgba(4,120,87,0.3)] overflow-hidden hover:scale-[1.02] transition-transform duration-300">
        {/* Decorative background circles */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-cyan-300/20 rounded-full blur-lg"></div>
        
        <p className="text-emerald-100 text-sm font-bold tracking-wide mb-1 opacity-90">EcoBalance</p>
        <h2 className="text-5xl font-black mb-1 drop-shadow-md">₹{(balance / 100).toFixed(2)}</h2>
        
        <Link to="/wallet" className="inline-flex items-center gap-2 mt-4 text-xs font-bold bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-full transition-all">
          View Ledger →
        </Link>
      </div>

      {/* Primary Action Button (Gamified & Bouncing) */}
      <Link 
        to="/new" 
        className="group relative flex items-center justify-center gap-3 w-full bg-gradient-to-r from-teal-500 to-emerald-500 text-white py-4 rounded-2xl font-black text-lg mb-8 shadow-[0_8px_25px_rgba(20,184,166,0.4)] hover:shadow-[0_12px_35px_rgba(20,184,166,0.6)] hover:-translate-y-1 transition-all duration-300"
      >
        <span className="text-2xl group-hover:rotate-12 transition-transform duration-300">♻️</span>
        Recycle New Item
        <div className="absolute inset-0 rounded-2xl border-2 border-white/20 group-hover:scale-105 transition-transform duration-300"></div>
      </Link>

      {/* Pickups List */}
      <div>
        <h3 className="text-lg font-extrabold text-teal-900 mb-4 flex items-center gap-2">
          <span>🌊</span> Recent Activity
        </h3>
        {pickups.length === 0 ? (
          <div className="text-center p-8 bg-white/50 backdrop-blur-sm rounded-2xl border border-teal-100 shadow-sm">
            <span className="text-4xl block mb-2">🏖️</span>
            <p className="text-teal-700 text-sm font-bold">Your beach is totally clean!</p>
            <p className="text-teal-500 text-xs mt-1">Start recycling to earn XP.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pickups.map((pickup) => (
              <Link 
                to={`/pickups/${pickup.id}`} 
                key={pickup.id}
                className="flex items-center justify-between p-4 bg-white/80 backdrop-blur-sm border border-teal-50 rounded-2xl shadow-sm hover:shadow-md hover:border-teal-200 transition-all hover:-translate-y-0.5 group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                    {{ phone: '📱', laptop: '💻', tablet: '📲', battery: '🔋', charger: '🔌' }[pickup.category] || '♻️'}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 capitalize">{pickup.item?.label || pickup.category}</p>
                    <p className="text-xs text-teal-600 font-medium">{new Date(pickup.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  {pickup.estimatedValue && (
                    <p className="font-black text-emerald-600 mb-1">₹{pickup.estimatedValue / 100}</p>
                  )}
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                    pickup.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-cyan-100 text-cyan-700'
                  }`}>
                    {pickup.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}