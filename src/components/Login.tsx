import React, { useState } from 'react';
import { auth, googleProvider } from '../lib/firebase';
import { signInWithPopup } from 'firebase/auth';
import { ArrowLeft, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

interface LoginProps {
  onClose?: () => void;
}

export default function Login({ onClose }: LoginProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
      if (onClose) onClose();
    } catch (error: any) {
      if (
        error?.code === 'auth/popup-closed-by-user' ||
        error?.code === 'auth/cancelled-popup-request' ||
        error?.code === 'auth/user-cancelled'
      ) {
        return;
      }
      console.warn("Google Sign-in error:", error);
      if (error?.code === 'auth/popup-blocked') {
        setErrorMsg('Sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else if (error?.code === 'auth/network-request-failed') {
        setErrorMsg('Network error. Please check your internet connection.');
      } else if (error?.code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not authorized in Firebase Auth. Please add it to Authorized Domains in Firebase Console.');
      } else if (error?.code === 'auth/operation-not-allowed') {
        setErrorMsg('Google Sign-In is not enabled in Firebase Authentication console.');
      } else {
        setErrorMsg(error?.message || 'Unable to sign in with Google. Please try again.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-sm relative my-auto"
      >
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl shadow-blue-950/20 border border-slate-100 relative overflow-hidden">
          {onClose && (
            <button 
              onClick={onClose}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-700 flex items-center gap-1 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          )}

          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center mb-6 pt-3">
            <div className="flex items-center justify-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-2xl mb-4 shadow-xs">
              <img 
                src="https://res.cloudinary.com/lbbij0gf/image/upload/v1787569136/Untitled-1_copy.png" 
                alt="Euro Express" 
                className="h-8 w-auto object-contain"
              />
              <img 
                src="https://res.cloudinary.com/lbbij0gf/image/upload/v1787572599/ChatGPT_Image_Aug_24_2026_05_55_44_PM.png" 
                alt="Euro Express" 
                className="h-9 w-auto object-contain"
              />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">
              Sign In
            </h2>
            <p className="text-slate-500 text-xs font-medium max-w-xs">
              Sign in with your Google account to continue
            </p>
          </div>

          {/* Google Sign In Call-To-Action */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={isLoggingIn}
              className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] disabled:opacity-60 text-white py-3.5 px-5 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-lg shadow-blue-600/25 cursor-pointer"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-xs shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <span>Sign In with Google</span>
                </>
              )}
            </button>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Minimalist Footer */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[11px] font-medium">Secured by Google Firebase</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
