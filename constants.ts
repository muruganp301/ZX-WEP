
import { User, Chat, CallLog } from './types';

export const CURRENT_USER: User = {
  id: 'me',
  name: 'Alex Johnson',
  avatar: 'https://picsum.photos/seed/me/200',
  status: 'online',
  about: 'Hey there! I am using ZX Web.'
};

export const INITIAL_CONTACTS: User[] = [
  {
    id: 'gemini-ai',
    name: 'ZX Assistant',
    avatar: 'https://picsum.photos/seed/gemini/200',
    status: 'online',
    about: 'I am your AI companion on ZX Web.'
  },
  {
    id: 'sara-dev',
    name: 'Sara (Frontend)',
    avatar: 'https://picsum.photos/seed/sara/200',
    status: 'online',
    about: 'React/TS Enthusiast'
  },
  {
    id: 'john-doe',
    name: 'John Doe',
    avatar: 'https://picsum.photos/seed/john/200',
    status: 'offline',
    about: 'Living life to the fullest'
  },
  {
    id: 'work-group',
    name: 'Development Team',
    avatar: 'https://picsum.photos/seed/team/200',
    status: 'online',
    about: 'Group Chat'
  }
];

export const MOCK_CHATS: Record<string, Chat> = {
  'gemini-ai': {
    id: 'gemini-ai',
    participants: [CURRENT_USER, INITIAL_CONTACTS[0]],
    messages: [
      { id: '1', text: 'Hi Alex! Welcome to ZX Web. How can I help you today?', senderId: 'gemini-ai', timestamp: '10:00 AM', status: 'read' }
    ]
  },
  'sara-dev': {
    id: 'sara-dev',
    participants: [CURRENT_USER, INITIAL_CONTACTS[1]],
    messages: [
      { id: '1', text: 'Hey, did you see the new update?', senderId: 'sara-dev', timestamp: 'Yesterday', status: 'read' }
    ]
  },
  'john-doe': {
    id: 'john-doe',
    participants: [CURRENT_USER, INITIAL_CONTACTS[2]],
    messages: []
  },
  'work-group': {
    id: 'work-group',
    participants: [CURRENT_USER, INITIAL_CONTACTS[3]],
    messages: [
      { id: '1', text: 'Deployment successful!', senderId: 'sara-dev', timestamp: '9:45 AM', status: 'read' }
    ]
  }
};

export const MOCK_CALLS: CallLog[] = [
  {
    id: 'c1',
    contact: INITIAL_CONTACTS[1],
    type: 'incoming',
    timestamp: 'Today, 2:30 PM',
    duration: '5:12'
  },
  {
    id: 'c2',
    contact: INITIAL_CONTACTS[2],
    type: 'missed',
    timestamp: 'Today, 11:15 AM'
  },
  {
    id: 'c3',
    contact: INITIAL_CONTACTS[1],
    type: 'outgoing',
    timestamp: 'Yesterday, 6:45 PM',
    duration: '1:30'
  },
  {
    id: 'c4',
    contact: INITIAL_CONTACTS[0],
    type: 'incoming',
    timestamp: 'Oct 24, 10:05 AM',
    duration: '12:45'
  }
];
