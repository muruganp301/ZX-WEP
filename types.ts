
export interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'typing...';
  about: string;
  phone?: string;
  email?: string;
}

export interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  audioUrl?: string;
  isDeletedForEveryone?: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastSeen?: string;
}

export interface CallLog {
  id: string;
  contact: User;
  type: 'incoming' | 'outgoing' | 'missed';
  timestamp: string;
  duration?: string;
}
