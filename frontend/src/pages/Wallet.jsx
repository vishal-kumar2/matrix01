// src/pages/Wallet.jsx
import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import axios from 'axios';
import { API_BASE } from '../lib/api';

export default function Wallet() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await axios.get(`${API_BASE}/users/${user.id}/wallet`);
        setBalance(res.data.balance);
        setTransactions(res.data.transactions || []);
      } catch (err) {
        console.error('Could not load wallet', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchWallet();
  }, [user]);

  if (!user) return <Navigate to="/login" replace />;
  if (loading) return <div className="p-4 text-center mt-10">Loading wallet...</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-3">
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-gray-500">
          ← Back to Home
        </button>
        <h2 className="text-lg font-bold text-gray-800">EcoWallet</h2>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-2xl p-6 shadow-xl text-center">
        <p className="text-green-100 text-xs font-semibold uppercase tracking-wider mb-1">
          Total Earnings
        </p>
        {/* All amounts arrive in paise; divide by 100 for display[cite: 2] */}
        <h1 className="text-4xl font-black">₹{(balance / 100).toFixed(2)}</h1>
        <div className="mt-4 flex justify-center space-x-2">
          <button 
            onClick={() => alert('Simulated UPI cash-out requested!')} 
            className="bg-white text-green-800 px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-green-50"
          >
            Withdraw to UPI 💸
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-3">Transaction History</h3>
        {transactions.length === 0 ? (
          <div className="text-center p-6 bg-gray-50 rounded-xl text-gray-400 text-sm">
            No transactions recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-bold text-sm text-gray-800">
                    {tx.reason === 'PICKUP_PAYOUT' ? '♻️ Pickup Reward' : tx.reason}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{tx.reference || 'Eco-friendly recycling'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      tx.type === 'CREDIT' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{(tx.amount / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}