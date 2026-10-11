import { useCallback, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getAgentClusters, getCluster, collectPickup, errorMessage } from '../lib/api';
import RouteMap from '../components/RouteMap';
import QRScanner from '../components/QRScanner';

const rupees = (paise) => `₹${((paise || 0) / 100).toFixed(2)}`;

export default function AgentDashboard() {
  const { user, logout } = useUser();
  const [clusters, setClusters] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [manualToken, setManualToken] = useState('');
  const [result, setResult] = useState(null); // { ok, text }
  const [busy, setBusy] = useState(false);

  const loadClusters = useCallback(async () => {
    if (!user) return;
    try {
      setClusters(await getAgentClusters(user.id));
      setError(null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const openCluster = useCallback(async (id) => {
    try {
      setSelected(await getCluster(id));
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadClusters();
    const t = setInterval(loadClusters, 10000); // new clusters appear when a pool fills up
    return () => clearInterval(t);
  }, [loadClusters]);

  const handleToken = useCallback(async (token) => {
    if (!token || busy) return;
    setScanning(false);
    setBusy(true);
    setResult(null);
    try {
      const r = await collectPickup(token, user.id);
      setResult({
        ok: true,
        text: `Collected from ${r.userName}. ${rupees(r.amount)} credited to their wallet.${r.clusterCompleted ? ' Route complete!' : ''}`,
      });
      setManualToken('');
      if (selected) await openCluster(selected.id);
      await loadClusters();
    } catch (err) {
      setResult({ ok: false, text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  }, [busy, user, selected, openCluster, loadClusters]);

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'AGENT') return <Navigate to="/" replace />;

  return (
    <div className="p-4 space-y-5">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-teal-900">Agent: {user.name}</h1>
          <p className="text-xs text-teal-600">Pooled pickup routes assigned to you</p>
        </div>
        <button onClick={logout} className="text-xs font-bold text-emerald-700 bg-white/60 px-3 py-1.5 rounded-full">
          Logout
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      {result && (
        <div className={`p-4 rounded-xl text-sm font-semibold border ${result.ok ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'}`}>
          {result.ok ? '✅ ' : '❌ '}{result.text}
        </div>
      )}

      {/* Scan / manual entry */}
      <div className="p-4 bg-white border border-teal-100 rounded-2xl shadow-sm space-y-3">
        <h2 className="font-extrabold text-teal-900">Doorstep handover</h2>
        {scanning ? (
          <QRScanner onScan={handleToken} onClose={() => setScanning(false)} />
        ) : (
          <button
            type="button"
            onClick={() => { setResult(null); setScanning(true); }}
            disabled={busy}
            className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-black disabled:opacity-50"
          >
            {busy ? 'Crediting wallet...' : '📷 Scan user QR'}
          </button>
        )}
        <form
          onSubmit={(e) => { e.preventDefault(); handleToken(manualToken.trim()); }}
          className="flex gap-2"
        >
          <input
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
            placeholder="or paste QR token"
            className="flex-1 border border-teal-100 rounded-xl px-3 py-2 text-sm"
          />
          <button type="submit" disabled={busy || !manualToken.trim()} className="px-4 py-2 bg-teal-700 text-white rounded-xl text-sm font-bold disabled:opacity-50">
            Collect
          </button>
        </form>
      </div>

      {/* Cluster list */}
      <div className="space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-teal-700">Your routes</h2>
        {loading && <p className="text-sm text-teal-600 animate-pulse">Loading routes...</p>}
        {!loading && clusters.length === 0 && (
          <div className="p-6 text-center bg-white/60 rounded-2xl text-sm text-teal-700">
            No route scheduled yet. A route appears when a zone reaches its pickup threshold.
          </div>
        )}
        {clusters.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => openCluster(c.id)}
            className={`w-full text-left p-4 rounded-2xl border transition-all ${selected?.id === c.id ? 'border-teal-500 bg-teal-50' : 'border-teal-100 bg-white hover:border-teal-300'}`}
          >
            <div className="flex justify-between">
              <p className="font-bold text-teal-900">
                {c.zoneType === 'CAMPUS_HOSTEL' || c.zoneType === 'HOSTEL' ? `Hostel ${c.zoneKey}` : `PIN ${c.zoneKey}`}
              </p>
              <span className="text-[10px] font-black uppercase px-2 py-1 rounded-full bg-cyan-100 text-cyan-800">{c.status}</span>
            </div>
            <p className="text-xs text-teal-600 mt-1">
              {c.collectedCount}/{c.requestCount} collected · {rupees(c.totalValue)} total
              {c.scheduledFor ? ` · ${new Date(c.scheduledFor).toLocaleString()}` : ''}
            </p>
          </button>
        ))}
      </div>

      {/* Selected route */}
      {selected && (
        <div className="space-y-3">
          <RouteMap stops={selected.stops} />
          <ol className="space-y-2">
            {selected.stops.map((s, i) => (
              <li key={s.pickupId} className="p-3 bg-white border border-teal-100 rounded-xl flex justify-between items-center">
                <div>
                  <p className="font-bold text-sm text-teal-900">{s.routeOrder ?? i + 1}. {s.userName}</p>
                  <p className="text-xs text-teal-600">{s.address}</p>
                  <p className="text-xs text-gray-500">{s.item?.label || s.item?.category} · {rupees(s.item?.estimatedValue)}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${s.status === 'COLLECTED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {s.status === 'COLLECTED' ? 'Collected' : 'Pending'}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
