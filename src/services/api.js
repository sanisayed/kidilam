// API Service for Flask Backend & Mock Mode Fallback

export const apiService = {
  // Store status state
  isStrapiOnline: false,
  useMockMode: true,

  // Check if Flask backend is available
  async checkConnection() {
    try {
      const response = await fetch('/api/bills');
      // Even if it returns 401 Unauthorized, it means the server is reachable and active
      this.isStrapiOnline = true; // Use this variable to represent backend connection
      this.useMockMode = false;
      return true;
    } catch (error) {
      console.log('Flask backend not found at localhost:5000. Running in MOCK Mode.');
      this.isStrapiOnline = false;
      this.useMockMode = true;
      return false;
    }
  },

  // Perform Login
  async login(identifier, password) {
    if (this.useMockMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (password.length >= 6) {
            const mockUser = {
              id: 1,
              username: identifier || 'admin',
              email: `${identifier || 'admin'}@buyology.io`,
              confirmed: true,
              blocked: false,
              role: { name: 'Administrator' }
            };
            const mockJwt = 'mock-jwt-token-buyology-xyz-12345';
            
            localStorage.setItem('jwt', mockJwt);
            localStorage.setItem('user', JSON.stringify(mockUser));
            resolve({ jwt: mockJwt, user: mockUser });
          } else {
            reject(new Error('Password must be at least 6 characters long!'));
          }
        }, 1200); // realistic network delay
      });
    }

    // Real Flask API authentication call
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: identifier,
        password: password,
      }),
    });

    const data = await response.json();

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
    if (this.useMockMode) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (password.length >= 6) {
            const mockUser = {
              id: 2,
              username,
              email,
              confirmed: true,
              blocked: false
            };
            const mockJwt = 'mock-jwt-token-buyology-xyz-98765';
            localStorage.setItem('jwt', mockJwt);
            localStorage.setItem('user', JSON.stringify(mockUser));
            resolve({ jwt: mockJwt, user: mockUser });
          } else {
            reject(new Error('Password must be at least 6 characters long!'));
          }
        }, 1200);
      });
    }

    // Real Flask registration call
    const response = await fetch('/api/auth/register', {
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

    const data = await response.json();

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
