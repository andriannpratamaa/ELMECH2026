import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'; // ganti IP kalau backend di laptop lain

const api = axios.create({
  baseURL: API_BASE,
});

export function fotoUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  const base = API_BASE.replace(/\/api$/, '');
  return `${base}${path.startsWith('/') ? path : '/' + path}`;
}

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
      window.location.href = `${window.location.origin}/dev/siminspeksi/admin`;
    }
    return Promise.reject(err);
  }
);

export default api;
