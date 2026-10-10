"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      
      login(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left side: Image/Hero */}
      <div className="hidden lg:flex w-1/2 bg-blue-900 relative flex-col justify-center items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="City Infrastructure" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/80 to-transparent"></div>
        </div>
        
        <div className="relative z-10 p-12 text-center max-w-xl">
          <h1 className="text-5xl font-black text-white mb-6 leading-tight">
            Building Smarter<br/>Cities Together.
          </h1>
          <p className="text-blue-100 text-lg leading-relaxed mb-8">
            The centralized platform for inter-agency coordination, conflict detection, and public infrastructure intelligence.
          </p>
          <div className="flex gap-4 justify-center text-sm font-bold text-blue-200">
            <div className="bg-blue-800/50 backdrop-blur px-4 py-2 rounded-full border border-blue-700/50">📍 Map Intelligence</div>
            <div className="bg-blue-800/50 backdrop-blur px-4 py-2 rounded-full border border-blue-700/50">⚠️ Conflict Engine</div>
          </div>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 lg:p-24 bg-white relative">
        <div className="w-full max-w-md">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Civic Portal Login</h2>
            <p className="text-gray-500 font-medium">Access your agency or citizen dashboard</p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 mb-6 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Username</label>
              <input 
                type="text" 
                required
                placeholder="e.g., engineer or citizen"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 bg-gray-50 focus:bg-white"
                value={username}
                onChange={e => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium text-gray-900 bg-gray-50 focus:bg-white"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white font-black py-4 px-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all mt-4 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              {loading ? 'Authenticating...' : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-xs text-gray-400 font-medium">Authorized Personnel & Verified Citizens Only<br/>© 2026 Civic Infrastructure Board</p>
          </div>
        </div>
      </div>
    </div>
  );
}
