import ApiClient from './ApiClient';
import type { ApiResponse } from './ApiClient';

export interface CallData {
  id: string;
  from: string;
  to: string;
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  startTime?: number;
  endTime?: number;
  duration?: number;
}

class VideoCallApi {
  /**
   * Initiate a video call
   */
  async initiateCall(to: string): Promise<ApiResponse<CallData>> {
    return ApiClient.post(
      '/calls/initiate',
      { to },
      { includeAuth: true }
    );
  }

  /**
   * Accept incoming call
   */
  async acceptCall(callId: string): Promise<ApiResponse<CallData>> {
    return ApiClient.post(
      `/calls/${callId}/accept`,
      {},
      { includeAuth: true }
    );
  }

  /**
   * Reject incoming call
   */
  async rejectCall(callId: string): Promise<ApiResponse<CallData>> {
    return ApiClient.post(
      `/calls/${callId}/reject`,
      {},
      { includeAuth: true }
    );
  }

  /**
   * End active call
   */
  async endCall(callId: string): Promise<ApiResponse<CallData>> {
    return ApiClient.post(
      `/calls/${callId}/end`,
      {},
      { includeAuth: true }
    );
  }

  /**
   * Get call history
   */
  async getCallHistory(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<CallData[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    return ApiClient.get(`/calls/history?${params}`, { includeAuth: true });
  }

  /**
   * Get call details
   */
  async getCallDetails(callId: string): Promise<ApiResponse<CallData>> {
    return ApiClient.get(`/calls/${callId}`, { includeAuth: true });
  }

  /**
   * Get pending incoming calls
   */
  async getPendingCalls(): Promise<ApiResponse<CallData[]>> {
    return ApiClient.get('/calls/pending', { includeAuth: true });
  }

  /**
   * Get ongoing calls
   */
  async getOngoingCalls(): Promise<ApiResponse<CallData[]>> {
    return ApiClient.get('/calls/ongoing', { includeAuth: true });
  }

  /**
   * Send ICE candidate
   */
  async sendIceCandidate(
    callId: string,
    candidate: any
  ): Promise<ApiResponse> {
    return ApiClient.post(
      `/calls/${callId}/ice-candidate`,
      { candidate },
      { includeAuth: true }
    );
  }

  /**
   * Send SDP offer
   */
  async sendOffer(callId: string, offer: any): Promise<ApiResponse> {
    return ApiClient.post(
      `/calls/${callId}/offer`,
      { offer },
      { includeAuth: true }
    );
  }

  /**
   * Send SDP answer
   */
  async sendAnswer(callId: string, answer: any): Promise<ApiResponse> {
    return ApiClient.post(
      `/calls/${callId}/answer`,
      { answer },
      { includeAuth: true }
    );
  }
}

export default new VideoCallApi();
