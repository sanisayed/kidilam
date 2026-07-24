// API Service for Flask Backend & Mock Mode Fallback
import { getApiUrl } from '../config';

async function safeJsonParse(response) {
  const text = await response.text();
  if (text && text.trim().length > 0) {
    try {
      return JSON.parse(text);
    } catch (e) {
      console.warn('Response is not valid JSON:', text.substring(0, 100));
      return { error: 'Invalid response from server' };
    }
  }
  return {};
}

export const apiService = {
  // Store status state
  isStrapiOnline: false,
  useMockMode: false,

  // Check if Flask backend is available
  async checkConnection() {
    try {
      const response = await fetch(getApiUrl('/api/health'));
      if (response.ok) {
        this.isStrapiOnline = true;
        this.useMockMode = false;
        return true;
      }
      this.isStrapiOnline = true;
      this.useMockMode = false;
      return true;
    } catch (error) {
      console.log('Flask backend connection check failed:', error);
      this.isStrapiOnline = false;
      this.useMockMode = false;
      return false;
    }
  },

  // Perform Login
  async login(identifier, password) {
    const response = await fetch(getApiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: identifier,
        password: password,
      }),
    });

    const data = await safeJsonParse(response);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Login failed. Please check your credentials.');
    }

    // Save token and user details in storage
    const user = data.user;
    const dummyJwt = 'flask-session-active';
    localStorage.setItem('jwt', dummyJwt);
    localStorage.setItem('user', JSON.stringify(user));
    return { jwt: dummyJwt, user };
  },

  // Perform Registration
  async register(username, email, password) {
    const response = await fetch(getApiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    const data = await safeJsonParse(response);

    if (!response.ok || !data.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    const user = data.user;
    const dummyJwt = 'flask-session-active';
    localStorage.setItem('jwt', dummyJwt);
    localStorage.setItem('user', JSON.stringify(user));
    return { jwt: dummyJwt, user };
  },

  // Get currently logged-in user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get current token
  getToken() {
    return localStorage.getItem('jwt');
  },

  // Logout user
  logout() {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
  }
};
