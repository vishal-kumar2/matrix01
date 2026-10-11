import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getUsers, errorMessage } from '../lib/api';

export default function Login() {
  const { login } = useUser();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const choose = (u) => {
    login(u);
    navigate(u.role === 'AGENT' ? '/agent' : '/', { replace: true });
  };

  const agents = users.filter((u) => u.role === 'AGENT');
  const people = users.filter((u) => u.role !== 'AGENT');

  const UserButton = ({ u }) => (
    <button
      type="button"
      onClick={() => choose(u)}
      className="w-full text-left p-4 bg-white border border-teal-100 rounded-2xl shadow-sm hover:border-teal-400 hover:shadow-md transition-all"
    >
      <p className="font-bold text-teal-900">{u.name}</p>
      <p className="text-xs text-teal-600">{u.address || u.pinCode}</p>
    </button>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-teal-900">Choose a demo account</h1>
        <p className="text-sm text-teal-600 mt-1">Login is simulated for the hackathon.</p>
      </div>

      {loading && <p className="text-teal-600 animate-pulse">Loading accounts...</p>}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          Could not reach the backend: {error}
        </div>
      )}

      {people.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-teal-700">Students and households</h2>
          {people.map((u) => <UserButton key={u.id} u={u} />)}
        </div>
      )}

      {agents.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-black uppercase tracking-wider text-teal-700">Collection agent</h2>
          {agents.map((u) => <UserButton key={u.id} u={u} />)}
        </div>
      )}
    </div>
  );
}
