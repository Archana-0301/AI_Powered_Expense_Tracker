import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // For demo: simulate login since backend isn't running yet
      if (email && password) {
        const mockToken = 'demo-jwt-token-' + Date.now();
        login(mockToken, email);
        navigate('/dashboard');
      } else {
        setError('Please enter email and password');
      }
    } catch (err) {
      setError('Login failed. Backend not running - using demo mode.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
          <p className="text-gray-600 mt-2">AI-Powered Personal Finance</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
          💡 <strong>Demo Mode:</strong> Backend not running. Using demo login.
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 font-semibold disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In (Demo)'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6 text-sm">
          Demo credentials pre-filled. Just click Sign In!
        </p>
      </div>
    </div>
  );
}
