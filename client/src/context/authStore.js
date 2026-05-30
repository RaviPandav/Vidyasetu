import { create } from "zustand";
import { persist } from "zustand/middleware";
import api from "../services/api";

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/login", { email, password });
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
          api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || "Login failed" };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post("/auth/register", userData);
          set({ isLoading: false });
          return { success: true, message: data.message };
        } catch (error) {
          set({ isLoading: false });
          return { success: false, message: error.response?.data?.message || "Registration failed" };
        }
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        delete api.defaults.headers.common["Authorization"];
      },

      fetchMe: async () => {
        try {
          const { data } = await api.get("/auth/me");
          set({ user: data.user });
        } catch {
          get().logout();
        }
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: "vidyasetu-auth",
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

export default useAuthStore;
