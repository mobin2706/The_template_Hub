'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { login, googleLogin } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-mesh flex">
      {/* Left - Decorative */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div className="absolute inset-0 gradient-primary opacity-90" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 rounded-full border border-white/20" />
          <div className="absolute bottom-20 right-20 w-48 h-48 rounded-full border border-white/15" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border border-white/10" />
        </div>
        <div className="relative z-10 text-center px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-8">
              <FileText className="w-10 h-10" />
            </div>
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk' }}>
              Welcome Back
            </h2>
            <p className="text-lg text-white/80 max-w-sm mx-auto">
              Access your templates, manage uploads, and connect with the community.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk' }}>
              <span className="gradient-text">Template</span><span className="text-[var(--text-primary)]">Hub</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Space Grotesk' }}>
            Log In
          </h1>
          <p className="text-[var(--text-secondary)] mb-8">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-[var(--color-primary)] font-medium hover:underline">Sign up</Link>
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-4 mb-6 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field !pl-10"
                  required
                  id="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="input-field !pl-10 !pr-10"
                  required
                  id="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-4 text-base disabled:opacity-50 flex items-center justify-center gap-2"
              id="login-submit"
            >
              <span className="flex items-center gap-2">
                {loading ? 'Signing in...' : 'Sign In'}
                {!loading && <ArrowRight className="w-4 h-4" />}
              </span>
            </motion.button>
          </form>

          <div className="mt-6 flex items-center justify-between">
            <span className="w-1/5 border-b border-[var(--border-color)] lg:w-1/4"></span>
            <span className="text-xs text-center text-[var(--text-muted)] uppercase">or continue with</span>
            <span className="w-1/5 border-b border-[var(--border-color)] lg:w-1/4"></span>
          </div>
          
          <div className="mt-6 flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  setLoading(true);
                  setError('');
                  await googleLogin(credentialResponse.credential);
                  router.push('/');
                } catch (err) {
                  setError(err.response?.data?.message || 'Google Login failed.');
                  setLoading(false);
                }
              }}
              onError={() => {
                setError('Google Login failed.');
              }}
              theme="outline"
              size="large"
              shape="rectangular"
              text="continue_with"
            />
          </div>

          {/* Demo credentials hint */}
          <div className="mt-6 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border-color)]">
            <p className="text-xs text-[var(--text-muted)] mb-1.5 font-medium">Demo Credentials</p>
            <p className="text-xs text-[var(--text-muted)]">
              Admin: <span className="text-[var(--text-secondary)]">admin@templatehub.com / admin123</span>
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              User: <span className="text-[var(--text-secondary)]">sarah@example.com / password123</span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
