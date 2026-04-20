import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithRedirect,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { ArrowLeft, Google, Mail, Lock, LogIn } from 'lucide-react';

export const AuthPage = () => {
  const [mode, setMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const authWithGoogle = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithRedirect(auth, provider);
    } catch (err) {
      console.error('Google auth redirect failed:', err);
      setError('Google sign-in redirect failed. Please try again in a standard browser tab.');
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }

        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      navigate('/');
    } catch (err) {
      console.error('Email auth failed:', err);
      const authError = err as { code?: string };
      switch (authError.code) {
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-not-found':
          setError('No account found with that email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/email-already-in-use':
          setError('An account already exists with that email.');
          break;
        case 'auth/weak-password':
          setError('Password should be at least 6 characters.');
          break;
        default:
          setError('Authentication failed. Please try again.');
          break;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      if (!email) {
        setError('Please enter your email address first.');
        return;
      }

      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent. Please check your inbox.');
    } catch (err) {
      console.error('Password reset failed:', err);
      const authError = err as { code?: string };
      if (authError.code === 'auth/user-not-found') {
        setError('No account found with that email.');
      } else {
        setError('Unable to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#0B0B0F] shadow-xl overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col gap-4 p-8 sm:p-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-2xl font-bold text-white">
              <LogIn className="w-7 h-7 text-accent" />
              <span>{mode === 'signup' ? 'Create an account' : mode === 'reset' ? 'Reset password' : 'Sign in'}</span>
            </div>
            <p className="text-sm text-text-secondary max-w-2xl">
              {mode === 'signup'
                ? 'Create a new developer account to publish blogs, save bookmarks, and manage content.'
                : mode === 'reset'
                ? 'Enter your email address and we will send a password reset link.'
                : 'Sign in with Google or your email and password to access your dashboard and saved articles.'}
            </p>
          </div>

          <div className="space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            )}
            {message && (
              <div className="rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-100">
                {message}
              </div>
            )}

            <button
              type="button"
              onClick={authWithGoogle}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Google className="w-5 h-5" />
              Continue with Google
            </button>

            <div className="relative text-center text-xs uppercase tracking-[0.3em] text-text-secondary before:absolute before:left-0 before:right-0 before:top-1/2 before:block before:h-px before:bg-white/10 before:-z-10">
              <span className="relative px-3 bg-[#0B0B0F]">Or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block w-full">
                <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                  <Mail className="w-4 h-4" /> Email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111215] px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-accent focus:ring-accent/30"
                />
              </label>

              {(mode === 'signin' || mode === 'signup') && (
                <label className="block w-full">
                  <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <Lock className="w-4 h-4" /> Password
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111215] px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-accent focus:ring-accent/30"
                  />
                </label>
              )}

              {mode === 'signup' && (
                <label className="block w-full">
                  <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                    <Lock className="w-4 h-4" /> Confirm password
                  </span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#111215] px-4 py-3 text-sm text-white outline-none ring-1 ring-transparent transition focus:border-accent focus:ring-accent/30"
                  />
                </label>
              )}

              {mode === 'reset' ? (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={loading}
                  className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Send reset email
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {mode === 'signup' ? 'Create account' : 'Sign in'}
                </button>
              )}
            </form>

            <div className="flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMessage(null);
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                }}
                className="underline-offset-4 hover:underline"
              >
                {mode === 'signup' ? 'Already have an account? Sign in' : 'Create an account'}
              </button>
              {mode !== 'reset' && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMessage(null);
                    setMode('reset');
                  }}
                  className="underline-offset-4 hover:underline"
                >
                  Forgot password?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
