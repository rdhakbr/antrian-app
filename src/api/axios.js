import axios from 'axios';

// Menggunakan path relatif — diteruskan ke backend lewat "proxy" di package.json
// sehingga TIDAK ADA CORS sama sekali (request dianggap same-origin oleh browser).
// Pastikan "proxy" di frontend/package.json sudah diatur ke http://localhost
const api = axios.create({
  baseURL: '/antrian-app/backend/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
