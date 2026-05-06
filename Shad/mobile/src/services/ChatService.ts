import { io, Socket } from 'socket.io-client';
import ApiClient from './ApiClient';

export interface Message {
  id?: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read?: boolean;
  type?: 'text' | 'image' | 'video' | 'voice';
}

class ChatService {
  private socket: Socket | null = null;
  private listeners: Set<(message: Message) => void> = new Set();
  private typingListeners: Set<(userId: string, isTyping: boolean) => void> = new Set();

  /**
   * Connect to the chat server
   */
  connect(userId: string): void {
    if (this.socket?.connected) return;

    const serverUrl = ApiClient.getServerUrl();
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('receiveMessage', (message: Message) => {
      this.listeners.forEach(listener => listener(message));
    });

    this.socket.on('typing', (fromId: string) => {
      this.typingListeners.forEach(listener => listener(fromId, true));
    });

    this.socket.on('stopTyping', (fromId: string) => {
      this.typingListeners.forEach(listener => listener(fromId, false));
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });
  }

  /**
   * Disconnect from the chat server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Send a message
   */
  sendMessage(to: string, from: string, text: string, type: Message['type'] = 'text'): void {
    if (!this.socket) return;

    const message: Message = {
      from,
      to,
      text,
      timestamp: Date.now(),
      type,
    };

    this.socket.emit('sendMessage', message);
  }

  /**
   * Send typing indicator
   */
  sendTyping(to: string, from: string): void {
    this.socket?.emit('typing', { to, from });
  }

  /**
   * Send stop typing indicator
   */
  sendStopTyping(to: string, from: string): void {
    this.socket?.emit('stopTyping', { to, from });
  }

  /**
   * Subscribe to new messages
   */
  onMessage(callback: (message: Message) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to typing indicators
   */
  onTyping(callback: (userId: string, isTyping: boolean) => void): () => void {
    this.typingListeners.add(callback);
    return () => this.typingListeners.delete(callback);
  }

  /**
   * Get message history from API
   */
  async getMessageHistory(userId: string): Promise<Message[]> {
    const response = await ApiClient.get(`/chat/messages/${userId}`, { includeAuth: true });
    return response.success ? response.data : [];
  }
}

export default new ChatService();
