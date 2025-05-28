import { create } from "zustand";
import axiosInstance from "../utils/axiosInstance";

export const useAuthStore = create((set) => ({
  totalMoney: 0,
  auth: null,
  isLoading: false,
  error: null,
  register: async (data) => {
    try {
      const res = await axiosInstance.post("/users/register",  data );
      set({ auth: res.data, isLoading: false });
    } catch (error) {
      set({ error: error.message });
    }
  },
  login: async (data) => {
    try {
        set({ isLoading: true });
        const res = await axiosInstance.post("/users/login",  data );
        set({ auth: res.data, isLoading: false });
    } catch (error) {
        set({ error: error.message });
    }
},
profile: async () => {
    try {
        set({ isLoading: true }); 
        const data = await axiosInstance.get("/users/profile");
        set({ auth: data.data, isLoading: false }); 
    } catch (error) {
        set({ error: error.message }); 
        set({ isLoading: false });
    }
},
updateProfile: async (data) => {
    try {
        const updateProfile = await axiosInstance.post("/users/updateProfile", data);
        console.log(updateProfile.data);
        set({ totalMoney: updateProfile.data.totalMoney, isLoading: false });
    } catch (error) {
        set({ error: error.message });
    }
},
logout: async () => {
    try {
        set({ isLoading: true });
        const logout = await axiosInstance.post("/users/logout");
        set({ isLoading: false });
    } catch (error) {
        set({ error: error.message });
    }
},
}));
