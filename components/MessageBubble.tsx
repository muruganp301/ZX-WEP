
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  isMe: boolean;
  onDelete?: (messageId: string, forEveryone: boolean) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isMe, onDelete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handleDeleteForMe = () => {
    onDelete?.(message.id, false);
    setShowDeleteModal(false);
    setShowDropdown(false);
  };

  const handleDeleteForEveryone = () => {
    onDelete?.(message.id, true);
    setShowDeleteModal(false);
    setShowDropdown(false);
  };

  if (message.isDeletedForEveryone) {
    return (
      <div className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div
          className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative italic flex items-center space-x-2 border transition-colors ${
            isMe 
              ? 'bg-[#f0f2f5] dark:bg-[#0b141a] text-gray-400 dark:text-[#8696a0] border-gray-100 dark:border-[#2f3b44] rounded-tr-none' 
              : 'bg-white dark:bg-[#202c33] text-gray-400 dark:text-[#8696a0] border-gray-100 dark:border-[#2f3b44] rounded-tl-none'
          }`}
        >
          <svg viewBox="0 0 24 24" width="14" height="14">
            <path fill="currentColor" d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
          </svg>
          <span className="text-[13px]">This message was deleted</span>
          <span className="text-[9px] uppercase ml-2 not-italic">{message.timestamp}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-1 group ${isMe ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm relative transition-all duration-300 ${
          isMe 
            ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-gray-800 dark:text-[#e9edef] rounded-tr-none' 
            : 'bg-white dark:bg-[#202c33] text-gray-800 dark:text-[#e9edef] rounded-tl-none'
        }`}
      >
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          className={`absolute top-0.5 right-0.5 p-1 text-gray-400 dark:text-[#aebac1] opacity-0 group-hover:opacity-100 transition-opacity z-20 ${showDropdown ? 'opacity-100' : ''}`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M7 10l5 5 5-5z" /></svg>
        </button>

        {showDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute top-7 right-0 bg-white dark:bg-[#233138] shadow-2xl rounded py-1 z-30 min-w-[160px] animate-in fade-in zoom-in-95 duration-100 border border-gray-100 dark:border-[#2f3b44]"
          >
            <button onClick={() => setShowDeleteModal(true)} className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 dark:hover:bg-[#111b21] text-gray-700 dark:text-[#e9edef] transition">
              Delete message
            </button>
            <button className="w-full text-left px-4 py-2 text-[14px] hover:bg-gray-50 dark:hover:bg-[#111b21] text-gray-700 dark:text-[#e9edef] transition">
              Message info
            </button>
          </div>
        )}

        {message.audioUrl ? (
          <div className="flex items-center space-x-3 py-0.5 pr-4 min-w-[200px]">
            <button onClick={togglePlay} className="p-1.5 text-gray-600 dark:text-[#aebac1] hover:text-gray-800 dark:hover:text-white transition">
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <div className="flex-1 flex flex-col justify-center">
              <div className="h-0.5 bg-gray-300 dark:bg-gray-600 rounded-full relative overflow-hidden">
                <div className={`h-full bg-[#00a884] transition-all duration-300 ${isPlaying ? 'w-full animate-progress' : 'w-0'}`} style={{ animationDuration: '30s' }}></div>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-[#8696a0] mt-1">Voice Message</span>
            </div>
            <audio ref={audioRef} src={message.audioUrl} className="hidden" />
          </div>
        ) : (
          <p className="text-[14px] leading-relaxed mb-0.5 whitespace-pre-wrap pr-3">{message.text}</p>
        )}
        <div className="flex items-center justify-end space-x-1">
          <span className="text-[10px] text-gray-500 dark:text-[#8696a0] uppercase">{message.timestamp}</span>
          {isMe && (
            <span className={message.status === 'read' ? 'text-blue-500' : 'text-gray-400 dark:text-[#8696a0]'}>
              <svg viewBox="0 0 16 15" width="15" height="14">
                <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879l-2.972-2.317a.366.366 0 0 0-.51.063l-.478.372a.365.365 0 0 0 .063.51l3.748 2.921a.365.365 0 0 0 .51-.063l6.056-7.558a.366.366 0 0 0-.063-.51zm-4.24 0l-.478-.372a.365.365 0 0 0-.51.063L4.426 9.879 1.454 7.562a.366.366 0 0 0-.51.063l-.478.372a.365.365 0 0 0 .063.51l3.748 2.921a.365.365 0 0 0 .51-.063l6.056-7.558a.366.366 0 0 0-.063-.51z"></path>
              </svg>
            </span>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#233138] rounded shadow-2xl max-w-sm w-full mx-4 overflow-hidden border dark:border-[#2f3b44]">
            <div className="p-5">
              <h3 className="text-gray-800 dark:text-[#e9edef] text-base mb-6">Delete message?</h3>
              <div className="flex flex-col space-y-1">
                {isMe && (
                  <button onClick={handleDeleteForEveryone} className="w-full text-right text-[#00a884] font-semibold py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-[#111b21] rounded uppercase text-[13px] tracking-wide">
                    Delete for everyone
                  </button>
                )}
                <button onClick={handleDeleteForMe} className="w-full text-right text-[#00a884] font-semibold py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-[#111b21] rounded uppercase text-[13px] tracking-wide">
                  Delete for me
                </button>
                <button onClick={() => setShowDeleteModal(false)} className="w-full text-right text-[#00a884] font-semibold py-2.5 px-4 hover:bg-gray-50 dark:hover:bg-[#111b21] rounded uppercase text-[13px] tracking-wide">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
