
import React, { useState, useEffect } from 'react';
import { User } from '../types';

interface CallScreenProps {
  contact: User;
  onEndCall: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ contact, onEndCall }) => {
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isNoiseCancelled, setIsNoiseCancelled] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-[100] bg-[#0b141a] flex flex-col items-center justify-between py-20 animate-in fade-in zoom-in-95 duration-300">
      {/* Background Blur Effect */}
      <div 
        className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
        style={{ 
          backgroundImage: `url(${contact.avatar})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>

      {/* Top Info */}
      <div className="z-10 text-center">
        <div className="mb-6 relative">
          <img 
            src={contact.avatar} 
            alt={contact.name} 
            className="w-32 h-32 rounded-full object-cover border-4 border-[#00a884] shadow-2xl mx-auto"
          />
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-[#00a884] text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
            Encrypted
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{contact.name}</h2>
        <p className="text-[#8696a0] font-mono text-lg">{formatTime(timer)}</p>
      </div>

      {/* Call Status Indicators */}
      <div className="z-10 flex flex-col items-center space-y-4">
        {isMuted && (
          <div className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-semibold flex items-center animate-pulse">
            <svg viewBox="0 0 24 24" width="14" height="14" className="mr-1"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/></svg>
            Microphone Muted
          </div>
        )}
        {isNoiseCancelled && (
          <div className="bg-[#00a884]/20 text-[#00a884] px-3 py-1 rounded-full text-xs font-semibold flex items-center">
            <svg viewBox="0 0 24 24" width="14" height="14" className="mr-1"><path fill="currentColor" d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
            Noise Cancellation Active
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="z-10 w-full max-w-sm px-6 grid grid-cols-4 gap-4">
        {/* Noise Cancellation Toggle */}
        <div className="flex flex-col items-center space-y-2">
          <button 
            onClick={() => setIsNoiseCancelled(!isNoiseCancelled)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isNoiseCancelled ? 'bg-[#00a884] text-white shadow-[0_0_15px_rgba(0,168,132,0.5)]' : 'bg-[#2a3942] text-[#aebac1] hover:bg-[#3b4a54]'}`}
            title="Toggle Noise Cancellation"
          >
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity=".3"/>
              <path fill="currentColor" d="M7 12h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/>
            </svg>
          </button>
          <span className="text-[10px] text-[#8696a0] font-semibold uppercase">AI Noise</span>
        </div>

        {/* Mute Toggle */}
        <div className="flex flex-col items-center space-y-2">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-[#2a3942] text-[#aebac1] hover:bg-[#3b4a54]'}`}
            title="Mute Microphone"
          >
            {isMuted ? (
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28zm-4.02.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.17l5.98 6zm-1.1 4.15l-1.84-1.84c-.03.17-.04.34-.04.52 0 1.66-1.34 3-3 3s-3-1.34-3-3h-2c0 2.42 1.72 4.44 4 4.9V21h2v-3.03c.51-.07 1-.22 1.46-.45l4.48 4.48 1.41-1.41L4.27 5.11 2.86 6.52l2.27 2.27V11c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c1.15-.17 2.21-.61 3.12-1.26l1.91 1.91 1.41-1.41-9.72-9.72z"/></svg>
            ) : (
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
            )}
          </button>
          <span className="text-[10px] text-[#8696a0] font-semibold uppercase">Mute</span>
        </div>

        {/* Speaker Toggle */}
        <div className="flex flex-col items-center space-y-2">
          <button 
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isSpeaker ? 'bg-white text-[#0b141a]' : 'bg-[#2a3942] text-[#aebac1] hover:bg-[#3b4a54]'}`}
          >
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM3 9v6h4l5 5V4L7 9H3z"/></svg>
          </button>
          <span className="text-[10px] text-[#8696a0] font-semibold uppercase">Speaker</span>
        </div>

        {/* End Call Button */}
        <div className="flex flex-col items-center space-y-2">
          <button 
            onClick={onEndCall}
            className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-all transform hover:scale-105 active:scale-90 shadow-lg shadow-red-900/40"
          >
            <svg viewBox="0 0 24 24" width="28" height="28" className="rotate-[135deg]">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.81 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
          <span className="text-[10px] text-[#8696a0] font-semibold uppercase">End</span>
        </div>
      </div>
    </div>
  );
};

export default CallScreen;
