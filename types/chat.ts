// Chat and messaging models - converted from Kotlin data classes
export interface Chat {
  chatId: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Date | null;
  isActive: boolean;
  eventId?: string; // If chat is related to a specific event
  matchId?: string; // If chat is from a match
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  text: string;
  senderId: string;
  timestamp: Date | null;
  type: MessageType;
  attachments?: MessageAttachment[];
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  LOCATION = 'location',
  EVENT_INVITE = 'event_invite'
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'file';
  url: string;
  thumbnailUrl?: string;
  fileName?: string;
  fileSize?: number;
}

// Chat metadata for UI
export interface ChatPreview {
  chat: Chat;
  otherUser: User;
  unreadCount: number;
  lastMessagePreview: string;
}

// Real-time chat state
export interface ChatState {
  chats: ChatPreview[];
  currentChat: Chat | null;
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}




