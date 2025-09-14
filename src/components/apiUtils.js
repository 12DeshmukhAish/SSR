import { handleApiError } from "./ErrorBoundary";
import { API_BASE_URL } from '../config';
// // API Configuration
// const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://24.101.103.87:8082';
const API_TIMEOUT = 10000; // 10 seconds

// Custom Error Classes
class NetworkError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NetworkError';
  }
}

class ServerError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ServerError';
    this.status = status;
  }
}

class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Network Status Check
const checkNetworkStatus = () => {
  if (!navigator.onLine) {
    throw new NetworkError('No internet connection');
  }
};

// Enhanced Fetch with Error Handling
const apiFetch = async (url, options = {}) => {
  // Check network status first
  checkNetworkStatus();

  // Set default options
  const defaultOptions = {
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Add authentication token if available
  const token = localStorage.getItem('authToken') || localStorage.getItem('jwt');
  if (token) {
    defaultOptions.headers['Authorization'] = `Bearer ${token}`;
  }

  const finalOptions = { ...defaultOptions, ...options };
  const controller = new AbortController();
  
  // Set up timeout
  const timeoutId = setTimeout(() => controller.abort(), finalOptions.timeout);

  try {
    const response = await fetch(url.startsWith('http') ? url : `${API_BASE_URL}${url}`, {
      ...finalOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle different response statuses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status >= 500) {
        throw new ServerError(
          errorData.message || 'Server error occurred',
          response.status
        );
      } else if (response.status === 404) {
        throw new APIError(
          errorData.message || 'Resource not found',
          404,
          errorData
        );
      } else if (response.status === 401) {
        // Handle unauthorized - clear auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        throw new APIError(
          'Authentication required',
          401,
          errorData
        );
      } else {
        throw new APIError(
          errorData.message || 'Request failed',
          response.status,
          errorData
        );
      }
    }

    // Return response data
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new NetworkError('Request timeout');
    }
    
    if (error instanceof NetworkError || error instanceof ServerError || error instanceof APIError) {
      throw error;
    }
    
    // Handle fetch errors (network issues, etc.)
    if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
      throw new NetworkError('Network connection failed');
    }
    
    throw new APIError('Unexpected error occurred', 0, { originalError: error.message });
  }
};

// API Methods
export const apiUtils = {
  // GET request
  get: async (url, options = {}) => {
    return apiFetch(url, { method: 'GET', ...options });
  },

  // POST request
  post: async (url, data, options = {}) => {
    return apiFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  },

  // PUT request
  put: async (url, data, options = {}) => {
    return apiFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  },

  // DELETE request
  delete: async (url, options = {}) => {
    return apiFetch(url, { method: 'DELETE', ...options });
  },

  // PATCH request
  patch: async (url, data, options = {}) => {
    return apiFetch(url, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
    });
  },

  // File upload
  uploadFile: async (url, formData, options = {}) => {
    const uploadOptions = { ...options };
    delete uploadOptions.headers?.['Content-Type']; // Let browser set content-type for FormData
    
    return apiFetch(url, {
      method: 'POST',
      body: formData,
      ...uploadOptions,
    });
  },
};

// Error Handler Hook for React Components
export const useApiErrorHandler = () => {
  const handleError = (error) => {
    console.error('API Error:', error);
    
    // Determine error type for display
    let errorType = 'API_ERROR';
    
    if (error instanceof NetworkError) {
      errorType = 'NO_INTERNET';
    } else if (error instanceof ServerError) {
      errorType = 'SERVER_ERROR';
    } else if (error instanceof APIError) {
      if (error.status === 404) {
        errorType = 'PAGE_NOT_FOUND';
      } else if (error.status >= 500) {
        errorType = 'SERVER_ERROR';
      }
    }
    
    return {
      errorType,
      message: error.message,
      shouldRetry: error instanceof NetworkError || error instanceof ServerError,
    };
  };

  return { handleError };
};

// Retry mechanism for failed requests
export const retryRequest = async (requestFn, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on authentication or client errors
      if (error instanceof APIError && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      // Wait before retrying
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
};

// Cache mechanism for GET requests
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const cachedApiGet = async (url, options = {}) => {
  const cacheKey = `${url}_${JSON.stringify(options)}`;
  const now = Date.now();
  
  // Check cache
  if (cache.has(cacheKey)) {
    const { data, timestamp } = cache.get(cacheKey);
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
    cache.delete(cacheKey);
  }
  
  // Fetch fresh data
  const data = await apiUtils.get(url, options);
  cache.set(cacheKey, { data, timestamp: now });
  
  return data;
};

// Clear cache
export const clearApiCache = () => {
  cache.clear();
};

// Health check utility
export const checkApiHealth = async () => {
  try {
    await apiUtils.get('/health', { timeout: 5000 });
    return { status: 'healthy', online: true };
  } catch (error) {
    return { 
      status: 'unhealthy', 
      online: false, 
      error: error.message 
    };
  }
};

// Export error classes for use in components
export { NetworkError, ServerError, APIError };

export default apiUtils;