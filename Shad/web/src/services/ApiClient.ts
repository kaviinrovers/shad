import ChatService from './ChatService';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  includeAuth?: boolean;
  timeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number = 10000;

  constructor() {
    this.baseUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  }

  /**
   * Get authentication token from localStorage
   */
  private getAuthToken(): string | null {
    return localStorage.getItem('shadhee_auth_token') || null;
  }

  /**
   * Prepare headers for API request
   */
  private prepareHeaders(options: ApiRequestOptions = {}): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.includeAuth !== false) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.prepareHeaders(options),
        timeout: options.timeout || this.defaultTimeout,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: this.prepareHeaders(options),
        body: JSON.stringify(data),
        timeout: options.timeout || this.defaultTimeout,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: this.prepareHeaders(options),
        body: JSON.stringify(data),
        timeout: options.timeout || this.defaultTimeout,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Generic DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: this.prepareHeaders(options),
        timeout: options.timeout || this.defaultTimeout,
      });

      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
        data: data as T,
      };
    }

    return {
      success: true,
      data: data as T,
    };
  }

  /**
   * Handle API errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    console.error('API Error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    localStorage.setItem('shadhee_auth_token', token);
  }

  /**
   * Clear authentication token
   */
  clearAuthToken(): void {
    localStorage.removeItem('shadhee_auth_token');
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.baseUrl;
  }

  /**
   * Check server health
   */
  async checkHealth(): Promise<ApiResponse> {
    return this.get('/health', { includeAuth: false });
  }

  /**
   * Get user online status
   */
  async getUserStatus(userId: string): Promise<ApiResponse> {
    return this.get(`/users/${userId}`, { includeAuth: false });
  }

  /**
   * Protected endpoint - example
   */
  async getProtected(): Promise<ApiResponse> {
    return this.get('/protected', { includeAuth: true });
  }
}

export default new ApiClient();
