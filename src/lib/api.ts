import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    console.log(`[API] ${res.config.method?.toUpperCase()} ${res.config.url}`, res.data);
    return res;
  },
  (err) => {
    console.error(`[API] ${err.config?.method?.toUpperCase()} ${err.config?.url}`, err.response?.data);
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin';
    }
    return Promise.reject(err);
  }
);

export default api;
