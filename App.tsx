
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import CallLogList from './components/CallLogList';
import CallScreen from './components/CallScreen';
import NewContactModal from './components/NewContactModal';
import ProfilePanel from './components/ProfilePanel';
import Login from './components/Login';
import { User, Chat, Message } from './types';
import { INITIAL_CONTACTS, MOCK_CHATS, MOCK_CALLS } from './constants';
import { getGeminiResponse } from './services/geminiService';
import { auth } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

const STORAGE_KEY_USER = 'zx_web_current_user';
const STORAGE_KEY_CONTACTS = 'zx_web_contacts';
const STORAGE_KEY_CHATS = 'zx_web_chats';
const STORAGE_KEY_THEME = 'zx_web_theme';

const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    return (saved as 'light' | 'dark') || 'light';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_USER);
    return saved ? JSON.parse(saved) : null;
  });

  const [contacts, setContacts] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [chats, setChats] = useState<Record<string, Chat>>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CHATS);
    return saved ? JSON.parse(saved) : MOCK_CHATS;
  });

  const [sidebarView, setSidebarView] = useState<'chats' | 'calls'>('chats');
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeCallContact, setActiveCallContact] = useState<User | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Firebase Auth State Listener
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Only map if we don't have a local one or if it's explicitly a new login
        if (!currentUser || currentUser.id.length > 20) { // Simple check to see if it's a long Firebase UID
          const mappedUser: User = {
            id: firebaseUser.uid.substring(0, 8),
            name: firebaseUser.displayName || firebaseUser.phoneNumber || 'User',
            avatar: firebaseUser.photoURL || `https://picsum.photos/seed/${firebaseUser.uid}/200`,
            status: 'online',
            about: 'Available on ZX Web',
            email: firebaseUser.email || undefined,
            phone: firebaseUser.phoneNumber || undefined
          };
          setCurrentUser(mappedUser);
        }
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THEME, theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHATS, JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    localStorage.removeItem(STORAGE_KEY_USER);
    setCurrentUser(null);
    window.location.reload();
  };

  const markChatAsRead = useCallback((chatId: string) => {
    setChats(prev => {
      const chat = prev[chatId];
      if (!chat) return prev;
      const hasUnread = chat.messages.some(m => m.senderId !== 'me' && m.status !== 'read');
      if (!hasUnread) return prev;
      return {
        ...prev,
        [chatId]: {
          ...chat,
          messages: chat.messages.map(m => 
            m.senderId !== 'me' ? { ...m, status: 'read' as const } : m
          )
        }
      };
    });
  }, []);

  const handleSelectChat = (id: string) => {
    setActiveChatId(id);
    markChatAsRead(id);
  };

  const handleAddContact = useCallback((name: string, about: string = 'Available on ZX Web') => {
    // Generate an easy 6-character user ID
    const easyId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const newUser: User = {
      id: easyId,
      name,
      avatar: `https://picsum.photos/seed/${easyId}/200`,
      status: 'online',
      about
    };
    setContacts(prev => [newUser, ...prev]);
    if (currentUser) {
      setChats(prev => ({
        ...prev,
        [easyId]: {
          id: easyId,
          participants: [currentUser, newUser],
          messages: []
        }
      }));
    }
    setIsModalOpen(false);
    setSearchQuery('');
    setActiveChatId(easyId);
  }, [currentUser]);

  const handleSendMessage = useCallback(async (text: string, audioUrl?: string) => {
    if (!activeChatId || !currentUser) return;
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      audioUrl,
      senderId: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    };
    setChats(prev => ({
      ...prev,
      [activeChatId]: {
        ...prev[activeChatId],
        messages: [...prev[activeChatId].messages, newMessage]
      }
    }));
    
    // Auto-responder for AI
    if (activeChatId === 'gemini-ai') {
      setContacts(prev => prev.map(c => c.id === 'gemini-ai' ? { ...c, status: 'typing...' as const } : c));
      const history = (chats['gemini-ai']?.messages || []).map(m => ({
        role: m.senderId === 'me' ? 'user' as const : 'model' as const,
        text: m.text || (m.audioUrl ? "[Voice Message]" : "")
      }));
      const promptText = audioUrl ? "I just sent you a voice message." : text;
      const aiText = await getGeminiResponse(promptText, history);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        senderId: 'gemini-ai',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: activeChatId === 'gemini-ai' ? 'read' : 'delivered'
      };
      setChats(prev => ({
        ...prev,
        ['gemini-ai']: {
          ...prev['gemini-ai'],
          messages: [...prev['gemini-ai'].messages, aiMessage]
        }
      }));
      setContacts(prev => prev.map(c => c.id === 'gemini-ai' ? { ...c, status: 'online' as const } : c));
    }
  }, [activeChatId, chats, currentUser]);

  const handleDeleteMessage = useCallback((chatId: string, messageId: string, forEveryone: boolean) => {
    setChats(prev => {
      const chat = prev[chatId];
      if (!chat) return prev;
      if (forEveryone) {
        return {
          ...prev,
          [chatId]: {
            ...chat,
            messages: chat.messages.map(m => 
              m.id === messageId ? { ...m, text: 'This message was deleted', isDeletedForEveryone: true, audioUrl: undefined } : m
            )
          }
        };
      } else {
        return {
          ...prev,
          [chatId]: {
            ...chat,
            messages: chat.messages.filter(m => m.id !== messageId)
          }
        };
      }
    });
  }, []);

  const handleUpdateProfile = (updatedUser: Partial<User>) => {
    setCurrentUser(prev => prev ? ({ ...prev, ...updatedUser }) : null);
  };

  const handleStartCall = (contact: User) => {
    setActiveCallContact(contact);
  };

  const chatMetadata = Object.keys(chats).reduce((acc, chatId) => {
    const msgs = chats[chatId].messages;
    const unreadCount = msgs.filter(m => m.senderId !== 'me' && m.status !== 'read' && !m.isDeletedForEveryone).length;
    acc[chatId] = {
      lastMessage: msgs.length > 0 ? msgs[msgs.length - 1] : undefined,
      unreadCount
    };
    return acc;
  }, {} as Record<string, { lastMessage: Message | undefined, unreadCount: number }>);

  const activeChat = activeChatId ? chats[activeChatId] : null;
  const activeContact = activeChatId ? contacts.find(c => c.id === activeChatId) || null : null;

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="flex flex-col h-screen overflow-hidden bg-[#f0f2f5] dark:bg-[#0b141a] transition-colors duration-300">
        
        {/* Top Branding Bar */}
        <header className="h-12 bg-[#00a884] dark:bg-[#202c33] flex items-center px-4 md:px-20 lg:px-40 shrink-0 shadow-md z-30 transition-colors duration-300">
          <div className="flex items-center space-x-2">
            <svg viewBox="0 0 24 24" width="24" height="24" className="text-white">
              <path fill="currentColor" d="M12.004 2c-5.523 0-10 4.477-10 10 0 1.767.458 3.427 1.258 4.873l-1.258 4.61 4.721-1.238c1.404.722 2.992 1.137 4.679 1.137 5.523 0 10-4.477 10-10s-4.477-10-10-10zm.004 18.25c-1.576 0-3.051-.412-4.329-1.133l-.31-.175-2.822.74.753-2.763-.192-.306c-.787-1.255-1.204-2.711-1.204-4.229 0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"></path>
            </svg>
            <h1 className="text-white text-lg font-bold tracking-tight">ZX Web</h1>
          </div>
          <div className="flex-1"></div>
          <div className="hidden md:block text-white/70 text-xs font-medium uppercase tracking-widest">
            End-to-End Encrypted
          </div>
        </header>

        <main className="flex-1 flex overflow-hidden md:p-4 lg:px-20 lg:pb-8 lg:pt-4">
          <div className="flex w-full h-full shadow-2xl bg-white dark:bg-[#111b21] overflow-hidden md:rounded-lg relative border border-gray-200 dark:border-[#2f3b44]">
            
            {/* Sidebar */}
            <div className={`flex flex-col w-full md:w-[350px] lg:w-[420px] border-r border-gray-300 dark:border-[#2f3b44] relative ${isMobileView && activeChatId ? 'hidden' : 'flex'}`}>
              <ProfilePanel 
                isOpen={isProfileOpen} 
                onClose={() => setIsProfileOpen(false)} 
                user={currentUser}
                onUpdate={handleUpdateProfile}
              />

              <div className="flex items-center justify-between px-4 py-2 bg-[#ededed] dark:bg-[#202c33] z-10 shrink-0">
                <div className="flex items-center space-x-3">
                  <img 
                    src={currentUser.avatar} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 transition object-cover border border-gray-300 dark:border-gray-600" 
                    onClick={() => setIsProfileOpen(true)}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold truncate max-w-[120px] text-gray-800 dark:text-[#e9edef]">{currentUser.name}</span>
                    <span className="text-[10px] text-gray-500 dark:text-[#8696a0] truncate">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 text-gray-500 dark:text-[#aebac1]">
                  <button 
                    onClick={toggleTheme} 
                    className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                    title={theme === 'light' ? "Switch to Dark Mode" : "Switch to Light Mode"}
                  >
                    {theme === 'light' ? (
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z"></path>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="20" height="20">
                        <path fill="currentColor" d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"></path>
                      </svg>
                    )}
                  </button>

                  <button onClick={() => setIsModalOpen(true)} className="hover:text-gray-700 dark:hover:text-white p-1" title="New Chat">
                    <svg viewBox="0 0 24 24" width="22" height="22">
                      <path fill="currentColor" d="M19.005 3.17a1.1 1.1 0 0 1 1.06 1.188l-.006.117v15.763a1.1 1.1 0 0 1-1.1 1.107 1.1 1.1 0 0 1-1.093-1.03l-.007-.117V4.475a1.1 1.1 0 0 1 1.146-1.305zm-6.837 0a1.1 1.1 0 0 1 1.06 1.188l-.006.117v15.763a1.1 1.1 0 0 1-1.1 1.107 1.1 1.1 0 0 1-1.093-1.03l-.007-.117V4.475a1.1 1.1 0 0 1 1.146-1.305zm-6.838 0a1.1 1.1 0 0 1 1.06 1.188l-.006.117v15.763a1.1 1.1 0 0 1-1.1 1.107 1.1 1.1 0 0 1-1.093-1.03l-.007-.117V4.475a1.1 1.1 0 0 1 1.146-1.305z"></path>
                    </svg>
                  </button>
                  <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="hover:text-gray-700 dark:hover:text-white p-1" title="Menu">
                      <svg viewBox="0 0 24 24" width="22" height="22">
                        <path fill="currentColor" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 4.001A2 2 0 0 0 12 15z"></path>
                      </svg>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute top-10 right-0 w-48 bg-white dark:bg-[#233138] shadow-xl rounded-sm py-2 z-50 border border-gray-100 dark:border-[#2f3b44] animate-in fade-in zoom-in-95 duration-100">
                        <button onClick={() => { setSidebarView('chats'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-50 dark:hover:bg-[#111b21] transition">
                          Chats
                        </button>
                        <button onClick={() => { setSidebarView('calls'); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-50 dark:hover:bg-[#111b21] transition font-semibold">
                          Call Logs
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-[#2f3b44] my-1"></div>
                        <button onClick={() => { toggleTheme(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-50 dark:hover:bg-[#111b21] transition">
                          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        </button>
                        <button onClick={() => { setIsProfileOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-50 dark:hover:bg-[#111b21] transition">
                          Profile
                        </button>
                        <button onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#e9edef] hover:bg-gray-50 dark:hover:bg-[#111b21] transition">
                          Find Friends
                        </button>
                        <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition">
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* View Toggle Tabs */}
              <div className="flex bg-white dark:bg-[#111b21] border-b border-gray-100 dark:border-[#2f3b44]">
                <button 
                  onClick={() => setSidebarView('chats')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${sidebarView === 'chats' ? 'text-[#00a884]' : 'text-gray-500 dark:text-[#8696a0]'}`}
                >
                  CHATS
                  {sidebarView === 'chats' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00a884]"></div>}
                </button>
                <button 
                  onClick={() => setSidebarView('calls')}
                  className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${sidebarView === 'calls' ? 'text-[#00a884]' : 'text-gray-500 dark:text-[#8696a0]'}`}
                >
                  CALLS
                  {sidebarView === 'calls' && <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00a884]"></div>}
                </button>
              </div>

              <div className="bg-white dark:bg-[#111b21] p-2 z-10 shrink-0">
                <div className="flex items-center bg-[#f0f2f5] dark:bg-[#202c33] rounded-lg px-3 py-1 ring-1 ring-transparent focus-within:ring-[#00a884] transition-all">
                  <svg viewBox="0 0 24 24" width="18" height="18" className="text-gray-500 dark:text-[#8696a0]">
                    <path fill="currentColor" d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path>
                  </svg>
                  <input
                    type="text"
                    placeholder={sidebarView === 'chats' ? "Find friend by username or name" : "Search in call logs"}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm ml-4 py-1.5 outline-none text-gray-800 dark:text-[#e9edef]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {sidebarView === 'chats' ? (
                <ChatList
                  contacts={contacts}
                  chatMetadata={chatMetadata}
                  activeChatId={activeChatId}
                  onSelectChat={handleSelectChat}
                  searchQuery={searchQuery}
                  onAddNewContact={(name) => handleAddContact(name)}
                />
              ) : (
                <CallLogList
                  calls={MOCK_CALLS}
                  searchQuery={searchQuery}
                  onCall={handleStartCall}
                />
              )}
            </div>

            {/* Chat Window */}
            <div className={`flex-1 ${isMobileView && !activeChatId ? 'hidden' : 'flex'} relative`}>
              <ChatWindow
                contact={activeContact}
                messages={activeChat?.messages || []}
                onSendMessage={handleSendMessage}
                onDeleteMessage={(messageId, forEveryone) => activeChatId && handleDeleteMessage(activeChatId, messageId, forEveryone)}
                onBack={() => setActiveChatId(null)}
                onCall={handleStartCall}
              />
              
              {/* Call Overlay */}
              {activeCallContact && (
                <CallScreen 
                  contact={activeCallContact} 
                  onEndCall={() => setActiveCallContact(null)} 
                />
              )}
            </div>

            <NewContactModal 
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onAdd={handleAddContact}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
