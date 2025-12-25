
import React from 'react';
import { User, Message } from '../types';

interface ChatListProps {
  contacts: User[];
  chatMetadata: Record<string, { lastMessage: Message | undefined, unreadCount: number }>;
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  searchQuery: string;
  onAddNewContact: (name: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ 
  contacts, 
  chatMetadata, 
  activeChatId, 
  onSelectChat, 
  searchQuery,
  onAddNewContact 
}) => {
  const filteredContacts = contacts.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasNoResults = searchQuery.trim() !== '' && filteredContacts.length === 0;

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar">
      {hasNoResults && (
        <div 
          onClick={() => onAddNewContact(searchQuery)}
          className="flex items-center px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] border-b border-gray-100 dark:border-[#222d34] animate-in slide-in-from-top-2 duration-300"
        >
          <div className="w-12 h-12 rounded-full bg-[#00a884] flex items-center justify-center text-white shrink-0 shadow-sm">
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="currentColor" d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h3 className="text-sm font-semibold text-[#00a884] dark:text-[#00a884]">
              Find and add "{searchQuery}"
            </h3>
            <p className="text-xs text-gray-500 dark:text-[#8696a0]">
              Start a new chat with this user
            </p>
          </div>
        </div>
      )}

      {filteredContacts.map(contact => {
        const metadata = chatMetadata[contact.id] || { lastMessage: undefined, unreadCount: 0 };
        const lastMsg = metadata.lastMessage;
        const unreadCount = metadata.unreadCount;
        const isActive = activeChatId === contact.id;

        return (
          <div
            key={contact.id}
            onClick={() => onSelectChat(contact.id)}
            className={`flex items-center px-4 py-3 cursor-pointer transition-colors border-b border-gray-100 dark:border-[#222d34] ${isActive ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-gray-50 dark:hover:bg-[#202c33]'}`}
          >
            <div className="relative shrink-0">
              <img
                src={contact.avatar}
                alt={contact.name}
                className="w-12 h-12 rounded-full object-cover border dark:border-gray-700"
              />
              {contact.status === 'online' && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-white dark:border-[#111b21] rounded-full"></div>
              )}
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`text-sm truncate ${unreadCount > 0 ? 'font-bold text-gray-900 dark:text-[#e9edef]' : 'font-semibold text-gray-800 dark:text-[#e9edef]'}`}>
                  {contact.name}
                </h3>
                <span className={`text-[11px] ${unreadCount > 0 ? 'text-[#00a884] font-bold' : 'text-gray-500 dark:text-[#8696a0]'}`}>
                  {lastMsg?.timestamp || ''}
                </span>
              </div>
              <div className="flex justify-between items-center mt-0.5">
                <p className={`text-sm truncate mr-2 flex-1 ${unreadCount > 0 ? 'text-gray-900 dark:text-[#d1d7db] font-medium' : 'text-gray-500 dark:text-[#8696a0]'}`}>
                  {lastMsg ? (
                    <span className="flex items-center">
                      {lastMsg.senderId === 'me' && (
                        <span className={`mr-1 ${lastMsg.status === 'read' ? 'text-blue-500' : 'text-gray-400 dark:text-[#aebac1]'}`}>
                          <svg viewBox="0 0 16 15" width="16" height="15">
                            <path fill="currentColor" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879l-2.972-2.317a.366.366 0 0 0-.51.063l-.478.372a.365.365 0 0 0 .063.51l3.748 2.921a.365.365 0 0 0 .51-.063l6.056-7.558a.366.366 0 0 0-.063-.51zm-4.24 0l-.478-.372a.365.365 0 0 0-.51.063L4.426 9.879 1.454 7.562a.366.366 0 0 0-.51.063l-.478.372a.365.365 0 0 0 .063.51l3.748 2.921a.365.365 0 0 0 .51-.063l6.056-7.558a.366.366 0 0 0-.063-.51z"></path>
                          </svg>
                        </span>
                      )}
                      <span className="truncate italic">
                        {lastMsg.isDeletedForEveryone ? '🚫 This message was deleted' : lastMsg.text}
                      </span>
                    </span>
                  ) : (
                    <span className="italic opacity-60">No messages yet</span>
                  )}
                </p>
                {unreadCount > 0 && (
                  <div className="bg-[#00a884] text-white text-[10px] font-bold min-w-[20px] h-[20px] rounded-full flex items-center justify-center px-1 animate-in zoom-in-50 duration-200">
                    {unreadCount}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {!hasNoResults && filteredContacts.length === 0 && searchQuery.trim() === '' && (
        <div className="flex flex-col items-center justify-center h-48 px-8 text-center opacity-40">
           <svg viewBox="0 0 24 24" width="48" height="48" className="mb-4 text-gray-400">
             <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"></path>
           </svg>
           <p className="text-sm">Search for friends by their name to start chatting</p>
        </div>
      )}
    </div>
  );
};

export default ChatList;
