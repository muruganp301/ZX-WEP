
import React, { useState } from 'react';

interface NewContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, about: string) => void;
}

const NewContactModal: React.FC<NewContactModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onAdd(name.trim(), about.trim() || 'Hey there! I am using ZX Web.');
      setName('');
      setAbout('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#233138] rounded shadow-xl w-full max-w-md overflow-hidden transform transition-all border dark:border-[#2f3b44]">
        <div className="bg-[#008069] dark:bg-[#202c33] text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <h3 className="text-lg font-semibold">New Contact</h3>
          <button onClick={onClose} className="hover:opacity-80 transition"><svg viewBox="0 0 24 24" width="24" height="24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"></path></svg></button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-[13px] font-medium text-[#008069] dark:text-[#00a884] mb-2 uppercase tracking-wide">Contact Name</label>
            <input type="text" required className="w-full bg-transparent border-b-2 border-gray-200 dark:border-[#2f3b44] focus:border-[#00a884] outline-none py-2 transition-colors text-gray-800 dark:text-[#e9edef] text-base" placeholder="e.g. Mom, Bestie" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#008069] dark:text-[#00a884] mb-2 uppercase tracking-wide">About / Status</label>
            <input type="text" className="w-full bg-transparent border-b-2 border-gray-200 dark:border-[#2f3b44] focus:border-[#00a884] outline-none py-2 transition-colors text-gray-800 dark:text-[#e9edef] text-base" placeholder="Hey there! I am using ZX Web." value={about} onChange={(e) => setAbout(e.target.value)} />
          </div>
          <div className="flex justify-end pt-4 space-x-3">
            <button type="button" onClick={onClose} className="px-5 py-2 text-gray-600 dark:text-[#8696a0] font-semibold hover:bg-gray-100 dark:hover:bg-[#111b21] rounded transition text-[13px] tracking-wide">CANCEL</button>
            <button type="submit" className="px-6 py-2 bg-[#00a884] text-white font-semibold rounded shadow-md hover:bg-[#008f6f] transition text-[13px] tracking-wide">ADD CONTACT</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewContactModal;
