import axios from 'axios';

const TOKEN_COOKIE_NAME = 'auth_token';

// Helper function to get token from cookies
function getTokenFromCookies(): string | null {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_COOKIE_NAME) {
      return value;
    }
  }
  return null;
}

const api = axios.create({
  baseURL: 'https://ieltsmanagementlms-production.up.railway.app/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach token from cookies
api.interceptors.request.use(
  (config) => {
    const token = getTokenFromCookies();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
