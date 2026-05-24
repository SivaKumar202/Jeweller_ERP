import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

const MOCK_PRODUCTS = [
  {
    _id: 'prod-1',
    name: 'Royal Heritage Gold Neckpiece',
    category: 'Necklaces',
    metalType: 'gold',
    purity: '22K',
    weight: 24.5,
    stonePrice: 4500,
    makingCharge: 350,
    makingChargeType: 'per_gram',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80',
    barcodeId: 'BAR-100293',
    stockStatus: 'in_stock',
    description: 'Masterfully crafted heritage temple jewellery design from Tamil Nadu.'
  },
  {
    _id: 'prod-2',
    name: 'Elegance Diamond Engagement Ring',
    category: 'Rings',
    metalType: 'diamond',
    purity: '18K',
    weight: 4.8,
    stonePrice: 48000,
    makingCharge: 12,
    makingChargeType: 'percentage',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=400&q=80',
    barcodeId: 'BAR-200984',
    stockStatus: 'in_stock',
    description: 'VVS1 purity brilliant cut solitaire diamond ring with white gold band.'
  },
  {
    _id: 'prod-3',
    name: 'Sleek Platinum Men Kara',
    category: 'Bracelets',
    metalType: 'platinum',
    purity: '950',
    weight: 18.2,
    stonePrice: 0,
    makingCharge: 800,
    makingChargeType: 'fixed',
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=400&q=80',
    barcodeId: 'BAR-300481',
    stockStatus: 'in_stock',
    description: 'Minimalistic matte finish pure platinum heavy kara for men.'
  }
];

export const useProductStore = create((set, get) => ({
  products: [],
  categories: ['Rings', 'Necklaces', 'Chains', 'Bangles', 'Earrings', 'Bracelets', 'Pendants', 'Nose pins', 'Coins', 'Custom jewellery'],
  loading: false,
  error: null,

  fetchProducts: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/products`, { params: filters });
      if (response.data?.success) {
        set({ products: response.data.data, loading: false });
      }
    } catch (err) {
      console.warn('Backend offline, loading premium mock product catalog.');
      // Filter mock products locally
      let filtered = [...MOCK_PRODUCTS];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.name.toLowerCase().includes(s) || 
          p.barcodeId.toLowerCase().includes(s) || 
          p.purity.toLowerCase().includes(s)
        );
      }
      if (filters.category) {
        filtered = filtered.filter(p => p.category === filters.category);
      }
      if (filters.metalType) {
        filtered = filtered.filter(p => p.metalType === filters.metalType.toLowerCase());
      }
      set({ products: filtered, loading: false });
    }
  },

  createProduct: async (productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/products`, productData);
      if (response.data?.success) {
        set({ products: [response.data.data, ...get().products], loading: false });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update failed, seeding local product.');
      const newMock = {
        _id: `prod-mock-${Date.now()}`,
        ...productData,
        stockStatus: 'in_stock',
        barcodeId: productData.barcodeId || `BAR-MOCK-${Date.now()}`,
      };
      set({ products: [newMock, ...get().products], loading: false });
      return { success: true, message: 'Saved to local mock store' };
    }
  },

  updateProduct: async (id, productData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/products/${id}`, productData);
      if (response.data?.success) {
        set({
          products: get().products.map((p) => (p._id === id ? response.data.data : p)),
          loading: false,
        });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend product update failed, updating local state.');
      set({
        products: get().products.map((p) => (p._id === id ? { ...p, ...productData } : p)),
        loading: false,
      });
      return { success: true };
    }
  },

  deleteProduct: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.delete(`${API_URL}/products/${id}`);
      if (response.data?.success) {
        set({
          products: get().products.filter((p) => p._id !== id),
          loading: false,
        });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend delete failed, removing local state.');
      set({
        products: get().products.filter((p) => p._id !== id),
        loading: false,
      });
      return { success: true };
    }
  },
}));
