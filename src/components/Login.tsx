import { useState, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { Loader2, Mail, Lock, ShieldAlert, BadgeInfo } from 'lucide-react';
import { ToastMessage } from '../types';

interface LoginProps {
  onLoginSuccess: () => void;
  addToast: (msg: string, type: 'success' | 'error') => void;
}

export default function Login({ onLoginSuccess, addToast }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorText('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorText(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user && data.session) {
          addToast('Account created and logged in successfully!', 'success');
          onLoginSuccess();
        } else if (data.user) {
          addToast('Verification email sent or account registered! Please try logging in.', 'success');
          setIsSignUp(false);
        } else {
          throw new Error('Something went wrong during sign up.');
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.session) {
          addToast('Welcome back, Admin!', 'success');
          onLoginSuccess();
        } else {
          throw new Error('Could not start user session.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || 'An authentication error occurred.');
      addToast(err.message || 'Authentication failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-container" className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl border border-gray-100 shadow-xl"
        id="login-card"
      >
        <div className="text-center">
          {/* Accent-colored elegant logo badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-[#E60028] mb-4">
            <span className="font-serif font-black text-2xl tracking-widest italic select-none">Coke</span>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 font-sans">
            Catalog Studio
          </h2>
          <p className="mt-2 text-sm text-gray-500 font-sans">
            {isSignUp ? 'Create a secure new administrator account' : 'Sign in to access your administrative tools'}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} id="login-form">
          {errorText && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700 flex items-start gap-2"
              id="login-error-message"
            >
              <ShieldAlert className="w-5 h-5 text-[#E60028] shrink-0 mt-0.5" />
              <span>{errorText}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 h-5" />
                </span>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-gray-900 placeholder-gray-400 text-sm transition-all"
                  placeholder="admin@cocacola.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 h-5" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#E60028]/20 focus:border-[#E60028] text-gray-900 placeholder-gray-400 text-sm transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <div>
            <button
              id="login-submit-button"
              type="submit"
              disabled={isLoading}
              className="relative w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-medium text-white bg-[#E60028] hover:bg-[#c50022] active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E60028] cursor-pointer transition-all duration-150 shadow-md shadow-red-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin w-4 h-4" />
                  Processing...
                </span>
              ) : isSignUp ? (
                'Create Admin Account'
              ) : (
                'Access Dashboard'
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <button
              type="button"
              id="login-toggle-signup"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrorText(null);
              }}
              className="text-[#E60028] hover:underline font-medium hover:text-[#c50022]"
            >
              {isSignUp ? 'Already have an admin account? Sign in' : 'Create new admin account'}
            </button>
          </div>
        </form>

        <div className="border-t border-gray-100 pt-6 mt-4">
          <div className="flex gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <BadgeInfo className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500 leading-relaxed font-sans">
              <strong className="text-gray-700 block mb-1">Development Help:</strong>
              If you have initialized Supabase but haven't created a user yet, click <strong className="text-gray-700">"Create new admin account"</strong> above to register. For production, register administrators via the Supabase Auth panel.
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
