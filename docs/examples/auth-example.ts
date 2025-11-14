/**
 * Azora OS Authentication Examples
 * Ubuntu Principle: "My security ensures our freedom"
 */

import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

// ============================================
// 1. USER REGISTRATION
// ============================================

async function registerUser() {
  try {
    const response = await axios.post(`${API_BASE}/auth/register`, {
      email: 'student@azora.world',
      password: 'Azora2025!',
      name: 'Themba Ndlovu',
      role: 'student'
    });

    console.log('✅ Registration successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Registration failed:', error.response?.data);
    throw error;
  }
}

// ============================================
// 2. USER LOGIN
// ============================================

async function loginUser(email: string, password: string) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password
    });

    const { token, refreshToken, user } = response.data;
    
    // Store tokens securely
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    console.log('✅ Login successful:', user);
    return response.data;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data);
    throw error;
  }
}

// ============================================
// 3. GET USER PROFILE
// ============================================

async function getUserProfile() {
  try {
    const token = localStorage.getItem('authToken');
    
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('✅ Profile retrieved:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get profile:', error.response?.data);
    throw error;
  }
}

// ============================================
// 4. AXIOS INTERCEPTOR (Auto-attach token)
// ============================================

function setupAxiosInterceptor() {
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
}

// Export for use in other modules
export {
  registerUser,
  loginUser,
  getUserProfile,
  setupAxiosInterceptor
};
