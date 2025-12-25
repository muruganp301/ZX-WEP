
import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  contact: User | null;
  messages: Message[];
  onSendMessage: (text: string, audioUrl?: string) => void;
  onDeleteMessage: (messageId: string, forEveryone: boolean) => void;
  onBack: () => void;
  onCall?: (contact: User) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, messages, onSendMessage, onDeleteMessage, onBack, onCall }) => {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, contact?.status]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = window.setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  if (!contact) {
    return (
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#f0f2f5] dark:bg-[#0b141a] border-l border-gray-300 dark:border-[#2f3b44] transition-colors duration-300">
        <div className="max-w-md text-center p-8">
          <img 
            src="https://picsum.photos/seed/placeholder/400/300" 
            alt="Select a chat" 
            className="w-64 h-auto mx-auto mb-8 rounded-full opacity-50 dark:opacity-20 grayscale"
          />
          <h1 className="text-3xl font-light text-gray-600 dark:text-[#e9edef] mb-4">ZX Web</h1>
          <p className="text-gray-500 dark:text-[#8696a0] text-sm leading-relaxed">
            Send and receive messages without keeping your phone online. Use ZX Web on up to 4 linked devices and 1 phone at the same time.
          </p>
        </div>
        <div className="absolute bottom-8 flex items-center text-gray-400 dark:text-[#8696a0] text-xs">
          <svg viewBox="0 0 24 24" width="16" height="16" className="mr-2">
            <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
          </svg>
          End-to-end encrypted
        </div>
      </div>
    );
  }

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        onSendMessage('', audioUrl);
        stream.getTracks().forEach(track => track.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Please allow microphone access to record audio messages.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isTyping = contact.status === 'typing...';

  return (
    <div className="flex flex-1 flex-col h-full bg-[#e5ddd5] dark:bg-[#0b141a] relative">
      <div 
        className="absolute inset-0 opacity-[0.08] dark:opacity-[0.05] pointer-events-none"
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')" }}
      ></div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#ededed] dark:bg-[#202c33] shadow-sm z-10 transition-colors">
        <div className="flex items-center">
          <button onClick={onBack} className="md:hidden mr-2 p-1 text-gray-600 dark:text-[#aebac1]">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path>
            </svg>
          </button>
          <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full object-cover border dark:border-gray-700" />
          <div className="ml-3">
            <h2 className="text-base font-semibold text-gray-900 dark:text-[#e9edef] leading-tight">{contact.name}</h2>
            <p className={`text-[11px] capitalize ${isTyping ? 'text-[#00a884] font-semibold animate-pulse' : 'text-gray-500 dark:text-[#8696a0]'}`}>
              {contact.status}
            </p>
          </div>
        </div>
        <div className="flex space-x-5 text-gray-500 dark:text-[#aebac1]">
          <button 
            onClick={() => onCall?.(contact)}
            className="hover:text-gray-700 dark:hover:text-white transition"
            title="Voice Call"
          >
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M6.62 10.79c1.44 2.81 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </svg>
          </button>
          <button className="hover:text-gray-700 dark:hover:text-white transition" title="Video Call">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path fill="currentColor" d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
            </svg>
          </button>
          <button className="hover:text-gray-700 dark:hover:text-white transition" title="Menu">
            <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"></path></svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 z-10 flex flex-col space-y-1">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} isMe={msg.senderId === 'me'} onDelete={onDeleteMessage} />
        ))}
        {isTyping && (
          <div className="flex w-full mb-2 justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="bg-white dark:bg-[#202c33] px-3 py-2 rounded-lg shadow-sm rounded-tl-none flex items-center space-x-1">
              <div className="flex space-x-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f0f0] dark:bg-[#202c33] p-2 flex items-center space-x-2 z-10 transition-colors duration-300">
        {!isRecording ? (
          <>
            <button type="button" className="p-2 text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-white">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>
            </button>
            <form onSubmit={handleSend} className="flex-1 flex items-center">
              <input
                type="text"
                placeholder="Type a message"
                className="flex-1 bg-white dark:bg-[#2a3942] dark:text-[#e9edef] rounded-full px-4 py-2 focus:outline-none text-sm shadow-sm transition-colors border-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </form>
            {inputValue.trim() ? (
              <button onClick={() => handleSend()} className="p-2 text-[#00a884] hover:text-[#008f6f]">
                <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
              </button>
            ) : (
              <button onClick={startRecording} className="p-2 text-gray-500 dark:text-[#8696a0] hover:text-[#00a884]">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="currentColor" d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path fill="currentColor" d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </button>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-between px-4 animate-in fade-in slide-in-from-right-4 duration-300">
            <button onClick={() => setIsRecording(false)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-full transition">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>
            </button>
            <div className="flex items-center space-x-3"><div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div><span className="text-gray-700 dark:text-[#e9edef] font-mono font-semibold">{formatTime(recordingTime)}</span></div>
            <button onClick={stopRecording} className="bg-[#00a884] text-white p-3 rounded-full shadow-lg hover:bg-[#008f6f] transition transform hover:scale-105 active:scale-95">
              <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path></svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;
