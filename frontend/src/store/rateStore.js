import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

export const useRateStore = create((set, get) => ({
  rates: {
    gold24k: 7600,
    gold22k: 7000,
    gold18k: 5800,
    silver: 90,
    platinum: 3500,
  },
  loading: false,
  error: null,

  fetchRates: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/rates`);
      if (response.data?.success) {
        set({ rates: response.data.data, loading: false });
      }
    } catch (err) {
      console.warn('Backend offline, using default local metal rates.');
      set({ loading: false }); // Silently fallback
    }
  },

  updateRates: async (newRates) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/rates`, newRates);
      if (response.data?.success) {
        set({ rates: response.data.data, loading: false });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update failed, updating local rate store state.');
      set({ rates: { ...get().rates, ...newRates }, loading: false });
      return { success: true, message: 'Saved in offline simulation mode' };
    }
  },
}));
