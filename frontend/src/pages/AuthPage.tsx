import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!email.toLowerCase().endsWith('@iimbg.ac.in')) {
      setError('Please use your official @iimbg.ac.in email address.');
      setIsLoading(false);
      return;
    }

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        navigate(from, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
            emailRedirectTo: `${window.location.origin}/auth`,
          },
        });
        if (error) throw error;
        setMessage('Success! Check your email for the confirmation link to complete signup.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex flex-col gap-8 items-center justify-center min-h-[60vh] py-8">
      <div className="glass-panel p-8 max-w-[450px] w-full rounded-[24px]">
        <h1 className="text-[2rem] font-extrabold mb-2 text-center text-primary">
          {isLogin ? 'Welcome Back' : 'Create an Account'}
        </h1>
        <p className="text-text-light mb-8 text-center text-[0.95rem]">
          {isLogin 
            ? 'Sign in to report or claim lost items.' 
            : 'Join the community to start reporting items.'}
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] mb-6 text-[0.9rem]">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-[#e6f4ea] border border-[#137333]/20 text-[#137333] px-4 py-3 rounded-[12px] mb-6 text-[0.9rem]">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="flex flex-col gap-5">
          {!isLogin && (
            <div className="flex flex-col gap-2">
              <label className="text-[0.85rem] font-bold text-text-dark ml-2">Full Name</label>
              <div className="flex items-center bg-white/70 rounded-[12px] p-3 border border-white/80 transition-all focus-within:bg-white focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                <User size={18} className="text-text-light mr-3" />
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                  required={!isLogin}
                  maxLength={100}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-text-dark ml-2">Email Address</label>
            <div className="flex items-center bg-white/70 rounded-[12px] p-3 border border-white/80 transition-all focus-within:bg-white focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <Mail size={18} className="text-text-light mr-3" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@iimbg.ac.in"
                className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                required
                maxLength={150}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.85rem] font-bold text-text-dark ml-2">Password</label>
            <div className="flex items-center bg-white/70 rounded-[12px] p-3 border border-white/80 transition-all focus-within:bg-white focus-within:shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
              <Lock size={18} className="text-text-light mr-3" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-transparent border-none outline-none w-full text-text-dark font-sans placeholder:text-text-light/60"
                required
                maxLength={100}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="mt-4 bg-primary text-white border-none py-[0.9rem] px-[1.5rem] rounded-[12px] font-semibold cursor-pointer flex justify-center items-center gap-2 transition-all duration-300 hover:bg-[#001122] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-black/5 pt-6">
          <p className="text-text-light text-[0.9rem]">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              type="button" 
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
              }}
              className="bg-transparent border-none text-secondary font-bold cursor-pointer hover:underline p-0 ml-1 transition-all"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </main>
  );
};

export default AuthPage;
