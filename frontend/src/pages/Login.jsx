import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore.js';
import { useNavigate } from 'react-router-dom';
import { Crown, Mail, Lock, ShieldCheck, HelpCircle } from 'lucide-react';

const Login = () => {
  const { login, loginWithGoogle, loading, error } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    const result = await loginWithGoogle({
      email: 'owner.google@jeweller.com',
      name: 'Google Jeweller (Demo)',
      googleId: 'google-oauth-100293',
    });
    if (result.success) {
      navigate('/dashboard');
    }
  };

  const fillCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@jeweller.com');
      setPassword('admin123');
    } else {
      setEmail('staff@jeweller.com');
      setPassword('staff123');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background visual graphics */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/[0.01] rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/[0.005] rounded-full filter blur-3xl"></div>

      <div className="w-full max-w-md glass-panel p-8 rounded-3xl relative z-10 border border-white/[0.06] shadow-2xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-neutral-800 to-black flex items-center justify-center border border-white/10 shadow-xl shadow-black/50 mb-4">
            <Crown className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white uppercase">SWARNA ERP</h1>
          <p className="text-xs text-[#0071e3] font-bold mt-1">Lite Jewellery ERP Portal</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Office Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
              <input
                type="email"
                placeholder="e.g. admin@jeweller.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Security Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3 text-slate-500 w-4 h-4" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 glass-input text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white hover:bg-neutral-100 text-black rounded-xl font-bold text-sm transition-all duration-200 shadow-md hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Authenticating Desk...' : 'Log In to Workspace'}
          </button>
        </form>

        {/* Google OAuth trigger */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 w-full border-t border-royal-800"></div>
          <span className="relative px-3 bg-royal-900 text-slate-500 text-[10px] font-bold tracking-wider uppercase">Or connect via</span>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full py-2.5 bg-royal-800/35 border border-royal-800 hover:bg-royal-800/60 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          Google Single Sign-On
        </button>

        {/* Demo Accounts Panel */}
        <div className="mt-8 border-t border-white/[0.06] pt-6">
          <p className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-3 justify-center">
            <ShieldCheck className="w-3.5 h-3.5 text-[#0071e3]" />
            Quick Access Demo Credentials
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => fillCredentials('admin')}
              className="px-4 py-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Shop Owner (Admin)
            </button>
            <button
              onClick={() => fillCredentials('staff')}
              className="px-4 py-2 border border-white/5 bg-white/[0.02] hover:bg-white/5 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              Sales Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
