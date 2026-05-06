import AsyncStorage from '@react-native-async-storage/async-storage';

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
  // IMPORTANT: Replace this with your computer's local IP address (e.g., http://192.168.1.5:3001/api)
  // if you are testing on a real mobile device!
  private baseUrl: string = 'http://localhost:3001/api';
  private defaultTimeout: number = 10000;

  constructor() {
    // In production, this would be your deployed backend URL
    console.log(`ApiClient initialized with baseUrl: ${this.baseUrl}`);
  }

  /**
   * Get authentication token from AsyncStorage
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('shadhee_auth_token');
    } catch (e) {
      console.error('Error reading auth token:', e);
      return null;
    }
  }

  /**
   * Prepare headers for API request
   */
  private async prepareHeaders(options: ApiRequestOptions = {}): Promise<HeadersInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (options.includeAuth !== false) {
      const token = await this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers as HeadersInit;
  }

  /**
   * Generic GET request
   */
  async get<T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'GET',
        headers: await this.prepareHeaders(options),
        signal: controller.signal,
      });

      clearTimeout(id);
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
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: await this.prepareHeaders(options),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(id);
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
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: await this.prepareHeaders(options),
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(id);
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
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), options.timeout || this.defaultTimeout);

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: await this.prepareHeaders(options),
        signal: controller.signal,
      });

      clearTimeout(id);
      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;

    try {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
    } catch (e) {
      data = {};
    }

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
        data: data.data as T,
      };
    }

    // Backend already returns { success, data, error } format
    // so pass it through directly
    if (data && typeof data === 'object' && 'success' in data) {
      return {
        success: data.success,
        data: data.data as T,
        error: data.error,
        message: data.message,
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
    if (error.name === 'AbortError') {
      return { success: false, error: 'Request timeout' };
    }
    return {
      success: false,
      error: error.message || 'Unknown error occurred',
    };
  }

  /**
   * Set authentication token
   */
  async setAuthToken(token: string): Promise<void> {
    await AsyncStorage.setItem('shadhee_auth_token', token);
  }

  /**
   * Clear authentication token
   */
  async clearAuthToken(): Promise<void> {
    await AsyncStorage.removeItem('shadhee_auth_token');
  }

  /**
   * Get server URL
   */
  getServerUrl(): string {
    return this.baseUrl.replace('/api', '');
  }

  /**
   * Set server URL (dynamically)
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url.endsWith('/api') ? url : `${url}/api`;
  }
}

export default new ApiClient();
