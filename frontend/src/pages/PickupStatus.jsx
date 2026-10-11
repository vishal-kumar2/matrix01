// src/pages/PickupStatus.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import StatusTimeline from '../components/StatusTimeline';
import VerificationResult from '../components/VerificationResult';
import ClusterProgress from '../components/ClusterProgress';
import PickupQR from '../components/PickupQR';
import { API_BASE } from '../lib/api';

export default function PickupStatus() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pickup, setPickup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;

    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_BASE}/pickups/${id}`);
        setPickup(res.data);
      } catch (err) {
        console.error('Could not load pickup', err);
        setPickup(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();

    // Polling logic: 2s while verifying, 10s otherwise
    const intervalMs = pickup?.status === 'AWAITING_VERIFICATION' ? 2000 : 10000;
    timer = setInterval(fetchStatus, intervalMs);

    return () => clearInterval(timer);
  }, [id, pickup?.status]);

  if (loading) return <div className="p-4 text-center mt-10">Fetching pickup details...</div>;
  if (!pickup) return <div className="p-4 text-center text-red-500">Pickup request not found.</div>;

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => navigate('/')} className="text-sm font-semibold text-gray-500">
          ← Back to Home
        </button>
        <span className="text-xs font-bold bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full uppercase">
          {pickup.status}
        </span>
      </div>

      {/* 1. Status Timeline[cite: 2] */}
      {pickup.status !== 'REJECTED' && <StatusTimeline status={pickup.status} />}

      {/* 2. REJECTED State[cite: 2] */}
      {pickup.status === 'REJECTED' ? (
        <div className="space-y-4">
          <VerificationResult item={pickup.item} />
          <button
            onClick={() => navigate('/new')}
            className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* 3. VERIFIED or POOLED State[cite: 2] */}
          {pickup.status === 'AWAITING_VERIFICATION' && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold text-center animate-pulse">
              🔎 AI is checking your photo...
            </div>
          )}

          {(pickup.status === 'VERIFIED' || pickup.status === 'POOLED') && (
            <div className="space-y-4">
              <VerificationResult item={pickup.item} />
              <ClusterProgress cluster={pickup.cluster} />
            </div>
          )}

          {/* 4. SCHEDULED State[cite: 2] */}
          {pickup.status === 'SCHEDULED' && (
            <div className="space-y-4">
              {pickup.cluster?.scheduledFor && (
                <div className="p-3 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-sm font-semibold text-center">
                  📅 Scheduled for: {new Date(pickup.cluster.scheduledFor).toLocaleDateString()}
                </div>
              )}
              <PickupQR token={pickup.qrToken} />
            </div>
          )}

          {/* 5. COLLECTED State[cite: 2] */}
          {pickup.status === 'COLLECTED' && (
            <div className="p-6 bg-green-100 text-green-900 border border-green-300 rounded-2xl text-center space-y-2">
              <span className="text-4xl">🎉</span>
              <h3 className="text-xl font-bold">Pickup Collected!</h3>
              <p className="text-sm font-medium">
                credited ₹{((pickup.payoutAmount || pickup.item?.estimatedValue || 0) / 100).toFixed(2)} to your wallet.
              </p>
              <button
                onClick={() => navigate('/wallet')}
                className="mt-4 px-6 py-2 bg-green-700 text-white rounded-xl font-bold text-sm"
              >
                Go to Wallet
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}