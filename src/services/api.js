import axios from 'axios';

// Dev:  Vite proxy maps /api → localhost:5000  → same-origin, cookies work.
// Prod: Vercel rewrites /api/* → Railway server → browser still sees same origin,
//       SameSite=Strict cookies work without any cross-origin hop.
//       See vercel.json and DEPLOY.md.
const api = axios.create({
  baseURL: '/api/v1',
  withCredentials: true,
});

// On 401, try a silent token refresh then retry the original request once.
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
        return api(original);
      } catch {
        // Refresh also failed — let the error propagate (AuthContext will redirect to login)
      }
    }
    return Promise.reject(err);
  }
);

export default api;
