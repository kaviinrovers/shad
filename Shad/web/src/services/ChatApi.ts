import ApiClient from './ApiClient';
import type { ApiResponse } from './ApiClient';

export interface MessageData {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  read: boolean;
  type: 'text' | 'image' | 'video' | 'voice' | 'gif';
  audioUrl?: string;
  duration?: number;
}

export interface ChatRoomData {
  id: string;
  participants: string[];
  lastMessage?: MessageData;
  updatedAt: number;
}

class ChatApi {
  /**
   * Get all chat rooms for current user
   */
  async getChatRooms(): Promise<ApiResponse<ChatRoomData[]>> {
    return ApiClient.get('/chat/rooms', { includeAuth: true });
  }

  /**
   * Get chat room with specific user
   */
  async getChatRoom(userId: string): Promise<ApiResponse<ChatRoomData>> {
    return ApiClient.get(`/chat/rooms/${userId}`, { includeAuth: true });
  }

  /**
   * Get message history with a user
   */
  async getMessageHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<MessageData[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return ApiClient.get(`/chat/messages/${userId}?${params}`, {
      includeAuth: true,
    });
  }

  /**
   * Send a text message (REST fallback for real-time Socket.io)
   */
  async sendMessage(
    to: string,
    text: string,
    type: string = 'text'
  ): Promise<ApiResponse<MessageData>> {
    return ApiClient.post(
      '/chat/messages',
      {
        to,
        text,
        type,
      },
      { includeAuth: true }
    );
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string): Promise<ApiResponse> {
    return ApiClient.put(
      `/chat/messages/${messageId}/read`,
      {},
      { includeAuth: true }
    );
  }

  /**
   * Mark all messages from a user as read
   */
  async markAllAsRead(userId: string): Promise<ApiResponse> {
    return ApiClient.put(
      `/chat/messages/${userId}/read-all`,
      {},
      { includeAuth: true }
    );
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<ApiResponse> {
    return ApiClient.delete(`/chat/messages/${messageId}`, { includeAuth: true });
  }

  /**
   * Delete entire conversation
   */
  async deleteConversation(userId: string): Promise<ApiResponse> {
    return ApiClient.delete(`/chat/rooms/${userId}`, { includeAuth: true });
  }

  /**
   * Search messages
   */
  async searchMessages(
    userId: string,
    query: string
  ): Promise<ApiResponse<MessageData[]>> {
    const params = new URLSearchParams({ q: query });
    return ApiClient.get(`/chat/messages/${userId}/search?${params}`, {
      includeAuth: true,
    });
  }

  /**
   * Upload voice message
   */
  async sendVoiceMessage(
    to: string,
    audioBlob: Blob,
    duration: number
  ): Promise<ApiResponse<MessageData>> {
    const formData = new FormData();
    formData.append('to', to);
    formData.append('audio', audioBlob);
    formData.append('duration', duration.toString());

    const token = localStorage.getItem('shadhee_auth_token');
    const headers: HeadersInit = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    try {
      const response = await fetch(
        `${ApiClient.getServerUrl()}/chat/voice-messages`,
        {
          method: 'POST',
          headers,
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          error: error.error || error.message || 'Failed to send voice message',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data: data as MessageData,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<ApiResponse<{ total: number; byUser: Record<string, number> }>> {
    return ApiClient.get('/chat/unread', { includeAuth: true });
  }

  /**
   * Get typing indicator (REST fallback - Socket.io is primary)
   */
  async sendTypingIndicator(to: string): Promise<ApiResponse> {
    return ApiClient.post(
      '/chat/typing',
      { to },
      { includeAuth: true }
    );
  }
}

export default new ChatApi();
