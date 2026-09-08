import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import { CinematicBackground } from '../components/landing/CinematicBackground';
import {
  Clapperboard,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Eye,
  EyeOff,
  Film,
  CheckCircle2,
  Cpu,
  CloudSun
} from 'lucide-react';

export const LoginPage = () => {
  const { login, switchDemoRole, getRolePath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fromPath = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await login(email, password);
      navigate(fromPath || getRolePath(user.role));
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 font-['Inter'] relative overflow-hidden selection:bg-amber-500 selection:text-black">
      {/* 1. Cinematic Background AI Production Canvas Animation */}
      <CinematicBackground />

      {/* Brand Header */}
      <div className="flex items-center gap-3 mb-8 relative z-10 text-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-cyan-400 flex items-center justify-center text-slate-950 font-black shadow-xl shadow-amber-500/20 text-2xl group-hover:scale-105 transition-transform">
            <Clapperboard className="w-6 h-6 fill-slate-950 text-slate-950" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-black tracking-widest text-slate-100 font-['Cinzel'] leading-none">
              MOVIE<span className="text-amber-400">OS</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-tight mt-0.5 font-mono">
              AI Film Production OS
            </p>
          </div>
        </Link>
      </div>

      {/* Form Container with Cinematic Projector Aura Animation */}
      <div className="relative w-full max-w-md z-10">
        <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/30 via-cyan-500/20 to-purple-500/30 rounded-3xl blur-xl opacity-75 animate-pulse pointer-events-none" />
        <div className="relative cinema-glass rounded-3xl p-6 sm:p-10 border border-amber-500/30 shadow-2xl space-y-6">
        <div className="text-center pb-2">
          <h2 className="text-xl sm:text-2xl font-black font-['Outfit'] text-slate-100">
            Sign In to Production Studio
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your role workspace with real-time database syncing
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. director@movieos.cinema"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">Password</label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs focus:border-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Authenticating..." : "Sign In to Workspace"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber-400 font-bold hover:underline">
              Create Filmmaker Profile
            </Link>
          </p>
        </div>

        </div>
      </div>
    </div>
  );
};
