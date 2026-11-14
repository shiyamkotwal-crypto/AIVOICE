import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Lock, Mail, User, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import RainbowWaveBackground from '../components/RainbowWaveBackground';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);

  const { signup, error: authError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setLocalError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await signup({
      full_name: fullName,
      email,
      password,
      role,
    });
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setLocalError(res.error || 'Failed to create account');
    }
  };

  const displayError = localError || authError;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
      {/* Living Multi-Color Spectrum Waves */}
      <div className="absolute inset-0 pointer-events-none opacity-60 dark:opacity-75 -z-0">
        <RainbowWaveBackground height="100%" opacity={0.5} density={5} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 via-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-brand-500/20 mb-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Mic className="w-7 h-7 text-brand-400 animate-pulse-subtle" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Create Your VoiceBridge Account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access intelligent voice support for campus & administrative services
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 shadow-xl space-y-6">
          {displayError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-start space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{displayError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@campus.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password (min 6 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Role
              </label>
              <div className="relative">
                <Shield className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty / Professor</option>
                  <option value="staff">Campus Staff</option>
                  <option value="admin">Campus Administrator</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-emerald-500 hover:from-brand-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-md shadow-brand-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering Profile...</span>
                </>
              ) : (
                <>
                  <span>Create Account & Start</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
