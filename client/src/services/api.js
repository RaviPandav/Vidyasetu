import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("vidyasetu-auth");
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch {
        localStorage.removeItem("vidyasetu-auth");
      }
    }

    if (config.data instanceof FormData) {
      if (config.headers) {
        delete config.headers["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("vidyasetu-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
