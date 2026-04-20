import io, { Socket } from 'socket.io-client';
import { encryptMessage, decryptMessage } from '../utils/encryption';

export interface Message {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'voice' | 'gif';
  audioUrl?: string; // For voice messages
  duration?: number; // For voice messages
}

export interface CallSignal {
  from: string;
  to: string;
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
}

export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: number;
}

class ChatService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    // Get environment variable, fallback to localhost
    const envUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
    this.serverUrl = envUrl;
  }

  connect(userId: string) {
    if (this.socket?.connected) return this.socket;

    this.socket = io(this.serverUrl, {
      auth: { userId },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('Connected to chat server');
      this.socket?.emit('join', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from chat server');
    });

    return this.socket;
  }

  sendMessage(to: string, text: string, type: Message['type'] = 'text') {
    if (!this.socket) return;

    const encryptedMessage = encryptMessage(text);
    this.socket.emit('sendMessage', {
      to,
      text: encryptedMessage,
      type,
      timestamp: Date.now(),
    });
  }

  onReceiveMessage(callback: (message: Message) => void) {
    if (!this.socket) return;

    this.socket.on('receiveMessage', (data: any) => {
      const decryptedMessage = decryptMessage(data.text);
      callback({
        id: data.id || `msg-${Date.now()}`,
        from: data.from,
        to: data.to,
        text: decryptedMessage,
        timestamp: data.timestamp || Date.now(),
        read: false,
        type: data.type || 'text',
      });
    });
  }

  onTyping(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('typing', callback);
  }

  onStopTyping(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('stopTyping', callback);
  }

  sendTyping(to: string) {
    if (!this.socket) return;
    this.socket.emit('typing', { to });
  }

  sendStopTyping(to: string) {
    if (!this.socket) return;
    this.socket.emit('stopTyping', { to });
  }

  // WebRTC Call Signaling Methods
  sendCallSignal(signal: CallSignal) {
    if (!this.socket) return;
    this.socket.emit('callSignal', signal);
  }

  onCallSignal(callback: (signal: CallSignal) => void) {
    if (!this.socket) return;
    this.socket.on('callSignal', callback);
  }

  startCall(to: string) {
    if (!this.socket) return;
    this.socket.emit('startCall', { to });
  }

  onIncomingCall(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('incomingCall', callback);
  }

  acceptCall(from: string) {
    if (!this.socket) return;
    this.socket.emit('acceptCall', { from });
  }

  rejectCall(from: string) {
    if (!this.socket) return;
    this.socket.emit('rejectCall', { from });
  }

  endCall(to: string) {
    if (!this.socket) return;
    this.socket.emit('endCall', { to });
  }

  onCallAccepted(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('callAccepted', callback);
  }

  onCallRejected(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('callRejected', callback);
  }

  onCallEnded(callback: (from: string) => void) {
    if (!this.socket) return;
    this.socket.on('callEnded', callback);
  }

  // Voice Message Methods
  sendVoiceMessage(to: string, audioBlob: Blob, duration: number) {
    const socket = this.socket;
    if (!socket) return;

    // Convert blob to base64 for transmission
    const reader = new FileReader();
    reader.onload = () => {
      const base64Audio = reader.result as string;
      const encryptedAudio = encryptMessage(base64Audio);

      socket.emit('sendVoiceMessage', {
        to,
        audio: encryptedAudio,
        duration,
        timestamp: Date.now(),
      });
    };
    reader.readAsDataURL(audioBlob);
  }

  onVoiceMessage(callback: (message: Message) => void) {
    if (!this.socket) return;

    this.socket.on('voiceMessage', (data: any) => {
      const decryptedAudio = decryptMessage(data.audio);
      callback({
        id: data.id || `voice-${Date.now()}`,
        from: data.from,
        to: data.to,
        text: '', // Voice messages don't have text
        timestamp: data.timestamp || Date.now(),
        read: false,
        type: 'voice',
        audioUrl: decryptedAudio,
        duration: data.duration,
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default new ChatService();
