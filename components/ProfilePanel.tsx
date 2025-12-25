
import React, { useState } from 'react';
import { User } from '../types';

interface ProfilePanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: Partial<User>) => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingId, setIsEditingId] = useState(false);
  
  const [name, setName] = useState(user.name);
  const [about, setAbout] = useState(user.about);
  const [userId, setUserId] = useState(user.id);

  const handleNameSave = () => {
    if (name.trim()) {
      onUpdate({ name: name.trim() });
      setIsEditingName(false);
    }
  };

  const handleAboutSave = () => {
    onUpdate({ about: about.trim() || 'Available' });
    setIsEditingAbout(false);
  };

  const handleIdSave = () => {
    const cleanId = userId.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
    if (cleanId && cleanId.length >= 3) {
      onUpdate({ id: cleanId });
      setIsEditingId(false);
    } else {
      setUserId(user.id);
      setIsEditingId(false);
      alert("ID must be at least 3 characters (letters, numbers, underscores, or hyphens only).");
    }
  };

  const randomizeAvatar = () => {
    const newAvatar = `https://picsum.photos/seed/${Date.now()}/200`;
    onUpdate({ avatar: newAvatar });
  };

  const copyUsername = () => {
    navigator.clipboard.writeText(user.id);
    alert("Username (ID) copied! Share this with your friend.");
  };

  return (
    <div 
      className={`absolute inset-0 z-40 bg-[#f0f2f5] dark:bg-[#0b141a] transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } flex flex-col`}
    >
      <div className="bg-[#008069] dark:bg-[#202c33] h-[108px] flex items-end px-6 pb-4 shrink-0 transition-colors">
        <div className="flex items-center space-x-6 text-white w-full">
          <button onClick={onClose} className="hover:opacity-80 transition">
            <svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"></path></svg>
          </button>
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
        <div className="py-8 flex flex-col items-center group">
          <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-md border-4 border-white dark:border-[#202c33]">
            <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
            <button onClick={randomizeAvatar} className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" width="32" height="32" className="mb-2"><path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path></svg>
              <span className="text-[10px] font-semibold uppercase tracking-widest">Change</span>
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-[#111b21] px-8 py-5 shadow-sm mb-4 transition-colors">
          <div className="text-[13px] text-[#008069] dark:text-[#00a884] font-medium mb-4 uppercase tracking-wide">Your Name</div>
          <div className="flex items-center justify-between">
            {isEditingName ? (
              <div className="flex-1 flex items-center border-b-2 border-[#00a884] pb-1">
                <input type="text" className="flex-1 bg-transparent outline-none text-gray-800 dark:text-[#e9edef] text-base" value={name} onChange={(e) => setName(e.target.value)} autoFocus onBlur={handleNameSave} onKeyDown={(e) => e.key === 'Enter' && handleNameSave()} />
                <button onClick={handleNameSave} className="text-[#00a884]"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></button>
              </div>
            ) : (
              <>
                <div className="text-base text-gray-800 dark:text-[#e9edef] flex-1">{user.name}</div>
                <button onClick={() => setIsEditingName(true)} className="text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-white transition"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg></button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111b21] px-8 py-5 shadow-sm mb-4 transition-colors">
          <div className="text-[13px] text-[#008069] dark:text-[#00a884] font-medium mb-4 uppercase tracking-wide">Easy Username (ID)</div>
          <div className="flex items-center justify-between">
            {isEditingId ? (
              <div className="flex-1 flex items-center border-b-2 border-[#00a884] pb-1">
                <input type="text" className="flex-1 bg-transparent outline-none font-mono text-gray-800 dark:text-[#e9edef] text-base" value={userId} onChange={(e) => setUserId(e.target.value)} autoFocus onBlur={handleIdSave} onKeyDown={(e) => e.key === 'Enter' && handleIdSave()} />
                <button onClick={handleIdSave} className="text-[#00a884]"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></button>
              </div>
            ) : (
              <>
                <div className="text-base font-mono text-gray-800 dark:text-[#e9edef] flex-1">@{user.id}</div>
                <div className="flex items-center space-x-3">
                  <button onClick={() => setIsEditingId(true)} className="text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-white transition">
                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>
                  </button>
                  <button onClick={copyUsername} className="text-[#00a884] hover:opacity-70 transition p-1" title="Copy ID">
                    <svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
                  </button>
                </div>
              </>
            )}
          </div>
          <div className="mt-4 text-[12px] text-gray-500 dark:text-[#8696a0] leading-relaxed">This is your unique ID. Give this to friends so they can find you easily.</div>
        </div>

        <div className="bg-white dark:bg-[#111b21] px-8 py-5 shadow-sm transition-colors">
          <div className="text-[13px] text-[#008069] dark:text-[#00a884] font-medium mb-4 uppercase tracking-wide">About</div>
          <div className="flex items-center justify-between">
            {isEditingAbout ? (
              <div className="flex-1 flex items-center border-b-2 border-[#00a884] pb-1">
                <input type="text" className="flex-1 bg-transparent outline-none text-gray-800 dark:text-[#e9edef] text-base" value={about} onChange={(e) => setAbout(e.target.value)} autoFocus onBlur={handleAboutSave} onKeyDown={(e) => e.key === 'Enter' && handleAboutSave()} />
                <button onClick={handleAboutSave} className="text-[#00a884]"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"></path></svg></button>
              </div>
            ) : (
              <>
                <div className="text-base text-gray-800 dark:text-[#e9edef] flex-1">{user.about}</div>
                <button onClick={() => setIsEditingAbout(true)} className="text-gray-500 dark:text-[#8696a0] hover:text-gray-700 dark:hover:text-white transition"><svg viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg></button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePanel;
