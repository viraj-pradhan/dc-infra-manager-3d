'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Database, Lock, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        window.location.href = '/';
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#F5F5F7] text-[#1D1D1F] p-6 font-sans">
      <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/80 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.03)] flex flex-col gap-6">
        
        {/* Brand */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-md">
            <Database className="w-6 h-6" />
          </div>
          <h1 className="font-semibold text-xl tracking-tight mt-2">DCIM Ops Center</h1>
          <p className="text-xs text-slate-400 font-medium tracking-wide uppercase uppercase-spacing">Secure Access Portal</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 text-xs border border-red-200/50 rounded-xl p-3 text-center font-medium">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bank.com"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl py-2.5 pl-11 pr-4 text-sm font-medium outline-none transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-slate-900 focus:bg-white rounded-xl py-2.5 pl-11 pr-11 text-sm font-medium outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-slate-950 text-white rounded-xl py-3 text-sm font-semibold hover:bg-slate-800 transition active:scale-[0.98] shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400">
          New to Ops Center?{' '}
          <Link href="/signup" className="text-slate-900 hover:underline font-semibold">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
