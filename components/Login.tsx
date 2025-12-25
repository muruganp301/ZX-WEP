
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  RecaptchaVerifier, 
  signInWithPhoneNumber
} from 'firebase/auth';

interface LoginProps {
  onLogin: (user: User) => void;
}

type LoginStep = 'choice' | 'phone' | 'otp' | 'loading';
type LoginMethod = 'gmail' | 'phone' | 'guest';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<LoginStep>('choice');
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase is available
    if (!auth) {
      console.warn("Firebase is not configured. Google and Phone login will run in simulation mode.");
    }
  }, []);

  const handleGmailLogin = async () => {
    if (!auth) {
      simulateLogin('gmail');
      return;
    }

    try {
      setStep('loading');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const mockUser: User = {
        id: user.uid.substring(0, 8),
        name: user.displayName || 'Google User',
        avatar: user.photoURL || 'https://picsum.photos/seed/google/200',
        status: 'online',
        about: 'Available on ZX Web',
        email: user.email || undefined
      };
      onLogin(mockUser);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStep('choice');
    }
  };

  const handleGuestLogin = () => {
    setMethod('guest');
    setStep('loading');
    setTimeout(() => {
      // Generate an easy 6-character Guest ID
      const easyId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const guestUser: User = {
        id: `guest-${easyId}`,
        name: 'Guest User',
        avatar: `https://picsum.photos/seed/${easyId}/200`,
        status: 'online',
        about: 'I am visiting ZX Web as a guest.',
      };
      onLogin(guestUser);
    }, 800);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 10) return;

    if (!auth) {
      setMethod('phone');
      setStep('otp');
      return;
    }

    try {
      setStep('loading');
      const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
      
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
      setConfirmationResult(confirmation);
      setMethod('phone');
      setStep('otp');
    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setStep('phone');
    }
  };

  const simulateLogin = (m: LoginMethod) => {
    setStep('loading');
    setTimeout(() => {
      const easyId = Math.random().toString(36).substring(2, 8).toUpperCase();
      const mockUser: User = {
        id: easyId,
        name: m === 'gmail' ? 'Demo User' : phoneNumber,
        avatar: `https://picsum.photos/seed/${easyId}/200`,
        status: 'online',
        about: 'Hey there! I am using ZX Web.',
      };
      onLogin(mockUser);
    }, 1000);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }

    if (newOtp.every(v => v !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) {
      simulateLogin('phone');
      return;
    }

    try {
      setStep('loading');
      const result = await confirmationResult.confirm(code);
      const user = result.user;
      const mockUser: User = {
        id: user.uid.substring(0, 8),
        name: user.phoneNumber || 'Phone User',
        avatar: `https://picsum.photos/seed/${user.uid}/200`,
        status: 'online',
        about: 'Hey there! I am using ZX Web.',
        phone: user.phoneNumber || undefined
      };
      onLogin(mockUser);
    } catch (err: any) {
      console.error(err);
      setError("Invalid verification code. Please try again.");
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#0b141a] flex flex-col items-center transition-colors duration-300">
      <div className="w-full bg-[#00a884] dark:bg-[#202c33] h-[220px] fixed top-0 left-0 z-0 shadow-md"></div>

      <div className="z-10 mt-20 w-full max-w-[1000px] flex flex-col items-center px-4">
        <div className="flex items-center space-x-3 mb-10">
          <svg viewBox="0 0 24 24" width="40" height="40" className="text-white">
             <path fill="currentColor" d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.767.458 3.427 1.258 4.873l-1.258 4.61 4.721-1.238c1.404.722 2.992 1.137 4.679 1.137 5.523 0 10-4.477 10-10s-4.477-10-10-10zm.004 18.25c-1.576 0-3.051-.412-4.329-1.133l-.31-.175-2.822.74.753-2.763-.192-.306c-.787-1.255-1.204-2.711-1.204-4.229 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"></path>
          </svg>
          <h1 className="text-white text-lg font-semibold uppercase tracking-widest">ZX Web</h1>
        </div>

        <div className="bg-white dark:bg-[#111b21] w-full max-w-[450px] rounded shadow-lg p-10 flex flex-col items-center text-center border dark:border-[#2f3b44] transition-colors">
          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs rounded border border-red-100 dark:border-red-900/30 w-full">
              {error}
            </div>
          )}

          {step === 'choice' && (
            <>
              <h2 className="text-2xl font-light text-gray-700 dark:text-[#e9edef] mb-8">Welcome to ZX Web</h2>
              <p className="text-gray-500 dark:text-[#8696a0] text-sm mb-10">To use ZX Web on your computer, please log in with your account.</p>
              
              <button 
                onClick={handleGmailLogin}
                className="w-full mb-4 flex items-center justify-center space-x-3 border border-gray-300 dark:border-[#2f3b44] py-3 rounded hover:bg-gray-50 dark:hover:bg-[#202c33] transition shadow-sm"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                <span className="text-gray-700 dark:text-[#e9edef] font-semibold">Continue with Google</span>
              </button>

              <button 
                onClick={() => setStep('phone')}
                className="w-full flex items-center justify-center space-x-3 bg-[#00a884] py-3 rounded hover:bg-[#008f6f] transition shadow-sm text-white mb-6"
              >
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path fill="currentColor" d="M17 1h-10c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-18c0-1.1-.9-2-2-2zm-5 19c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5-4h-10v-11h10v11z"></path>
                </svg>
                <span className="font-semibold">Continue with Phone</span>
              </button>

              <div className="flex items-center w-full mb-6">
                <div className="flex-1 h-px bg-gray-200 dark:bg-[#2f3b44]"></div>
                <span className="px-4 text-xs text-gray-400 dark:text-[#8696a0] uppercase tracking-wider">or</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-[#2f3b44]"></div>
              </div>

              <button 
                onClick={handleGuestLogin}
                className="text-[#00a884] hover:text-[#008f6f] font-semibold text-sm transition py-2 px-4 rounded hover:bg-[#00a884]/5 dark:hover:bg-[#00a884]/10"
              >
                Login as Guest
              </button>
            </>
          )}

          {step === 'phone' && (
            <div className="w-full text-left">
              <button onClick={() => setStep('choice')} className="text-[#00a884] mb-6 flex items-center space-x-1 hover:underline">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
                <span>Back</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-[#e9edef] mb-2">Enter phone number</h2>
              <p className="text-gray-500 dark:text-[#8696a0] text-sm mb-6 font-light leading-relaxed">Include your country code (e.g. +1 for USA).</p>
              
              <form onSubmit={handlePhoneSubmit}>
                <div className="flex space-x-2 border-b-2 border-[#00a884] mb-8">
                  <span className="py-2 text-gray-600 dark:text-[#aebac1]">+</span>
                  <input 
                    type="tel" 
                    placeholder="1 234 567 8910"
                    className="w-full bg-transparent outline-none py-2 text-lg text-gray-800 dark:text-[#e9edef]"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9+]/g, ''))}
                    autoFocus
                  />
                </div>
                <button 
                  type="submit"
                  disabled={phoneNumber.length < 8}
                  className={`w-full py-3 rounded transition shadow-sm text-white font-semibold ${phoneNumber.length >= 8 ? 'bg-[#00a884] hover:bg-[#008f6f]' : 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500'}`}
                >
                  SEND CODE
                </button>
              </form>
            </div>
          )}

          {step === 'otp' && (
            <div className="w-full text-center">
               <button onClick={() => setStep(method === 'gmail' ? 'choice' : 'phone')} className="text-[#00a884] mb-6 flex items-center space-x-1 hover:underline text-left">
                <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
                <span>Back</span>
              </button>
              <h2 className="text-xl font-semibold text-gray-700 dark:text-[#e9edef] mb-2">
                Verify Identity
              </h2>
              <p className="text-gray-500 dark:text-[#8696a0] text-sm mb-6">
                Enter the 6-digit verification code sent to your {method === 'gmail' ? 'Google account' : 'phone'}.
              </p>
              
              <div className="flex justify-between space-x-2 mb-8">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    className="w-10 h-12 border-b-2 border-gray-300 dark:border-[#2f3b44] focus:border-[#00a884] outline-none text-center text-xl font-bold transition-colors bg-transparent text-gray-800 dark:text-[#e9edef]"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400 dark:text-[#8696a0]">Didn't receive code? <span className="text-[#00a884] cursor-pointer hover:underline font-semibold">Resend</span></p>
            </div>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center py-10">
              <div className="w-12 h-12 border-4 border-[#f3f3f3] dark:border-[#202c33] border-t-[#00a884] rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 dark:text-[#8696a0] animate-pulse font-medium">Connecting to ZX Web...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
