
import React from 'react';
import { CallLog, User } from '../types';

interface CallLogListProps {
  calls: CallLog[];
  searchQuery: string;
  onCall?: (contact: User) => void;
}

const CallLogList: React.FC<CallLogListProps> = ({ calls, searchQuery, onCall }) => {
  const filteredCalls = calls.filter(c => 
    c.contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 overflow-y-auto bg-white dark:bg-[#111b21] custom-scrollbar animate-in fade-in duration-300">
      {filteredCalls.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center opacity-40">
           <p className="text-sm text-gray-500 dark:text-[#8696a0]">No call logs found</p>
        </div>
      ) : (
        filteredCalls.map(call => (
          <div
            key={call.id}
            onClick={() => onCall?.(call.contact)}
            className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-[#202c33] border-b border-gray-100 dark:border-[#222d34] transition-colors"
          >
            <div className="shrink-0">
              <img
                src={call.contact.avatar}
                alt={call.contact.name}
                className="w-12 h-12 rounded-full object-cover border dark:border-gray-700"
              />
            </div>
            <div className="ml-4 flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className={`text-sm truncate font-semibold text-gray-800 dark:text-[#e9edef] ${call.type === 'missed' ? 'text-red-500 dark:text-red-400' : ''}`}>
                  {call.contact.name}
                </h3>
              </div>
              <div className="flex items-center mt-1">
                <span className={`mr-2 ${call.type === 'missed' ? 'text-red-500' : 'text-[#00a884]'}`}>
                  {call.type === 'incoming' && (
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M11 5V16.17L6.41 11.59L5 13L12 20L19 13L17.59 11.59L13 16.17V5H11Z" />
                    </svg>
                  )}
                  {call.type === 'outgoing' && (
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M13 19V7.83L17.59 12.41L19 11L12 4L5 11L6.41 12.41L11 7.83V19H13Z" />
                    </svg>
                  )}
                  {call.type === 'missed' && (
                    <svg viewBox="0 0 24 24" width="16" height="16">
                      <path fill="currentColor" d="M12,2C6.48,2,2,6.48,2,12s4.48,10,10,10s10-4.48,10-10S17.52,2,12,2z M13,17h-2v-2h2V17z M13,13h-2V7h2V13z" />
                    </svg>
                  )}
                </span>
                <p className="text-xs text-gray-500 dark:text-[#8696a0]">
                  {call.timestamp} {call.duration && `(${call.duration})`}
                </p>
              </div>
            </div>
            <div className="text-gray-400 dark:text-[#8696a0] hover:text-[#00a884] transition">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path fill="currentColor" d="M6.62 10.79c1.44 2.81 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
              </svg>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default CallLogList;
