import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

const MOCK_VENDORS = [
  { _id: 'vend-1', name: 'Mahalaxmi Bullion Pvt Ltd', companyName: 'Mahalaxmi Bullion', phone: '9820011223', address: 'Zaveri Bazaar, Mumbai', gstNumber: '27AAAAA0000A1Z0' },
  { _id: 'vend-2', name: 'Sanjay Choksi & Sons', companyName: 'Choksi Gold Refineries', phone: '9320044556', address: 'Raja Market, Bengaluru', gstNumber: '29BBBBB0000B1Z1' }
];

const MOCK_PURCHASES = [
  {
    _id: 'purch-1',
    vendor: { name: 'Mahalaxmi Bullion Pvt Ltd', companyName: 'Mahalaxmi Bullion', phone: '9820011223' },
    itemName: '24K Raw Gold Bar (999 Purity)',
    metalType: 'gold',
    purity: '24K',
    weight: 100,
    rateApplied: 7450,
    otherCharges: 1200,
    purchaseAmount: 746200,
    amountPaid: 746200,
    balanceDue: 0,
    paymentStatus: 'paid',
    purchaseDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    _id: 'purch-2',
    vendor: { name: 'Sanjay Choksi & Sons', companyName: 'Choksi Gold Refineries', phone: '9320044556' },
    itemName: 'Sterling Silver Granules (925)',
    metalType: 'silver',
    purity: 'Sterling',
    weight: 500,
    rateApplied: 85,
    otherCharges: 500,
    purchaseAmount: 43000,
    amountPaid: 20000,
    balanceDue: 23000,
    paymentStatus: 'partially_paid',
    purchaseDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const usePurchaseStore = create((set, get) => ({
  purchases: [],
  vendors: [],
  loading: false,
  error: null,

  fetchVendors: async () => {
    try {
      const response = await axios.get(`${API_URL}/purchases/vendors`);
      if (response.data?.success) {
        set({ vendors: response.data.data });
      }
    } catch (err) {
      console.warn('Backend offline, loading mock supplier register.');
      set({ vendors: MOCK_VENDORS });
    }
  },

  createVendor: async (vendorData) => {
    try {
      const response = await axios.post(`${API_URL}/purchases/vendors`, vendorData);
      if (response.data?.success) {
        set({ vendors: [response.data.data, ...get().vendors] });
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.warn('Backend offline, adding local supplier mock.');
      const newMock = {
        _id: `vend-mock-${Date.now()}`,
        ...vendorData,
        createdAt: new Date().toISOString()
      };
      set({ vendors: [newMock, ...get().vendors] });
      return { success: true, data: newMock };
    }
  },

  fetchPurchases: async (filters = {}) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/purchases`, { params: filters });
      if (response.data?.success) {
        set({ purchases: response.data.data, loading: false });
      }
    } catch (err) {
      console.warn('Backend offline, loading mock procurement histories.');
      let filtered = [...MOCK_PURCHASES];
      if (filters.search) {
        const s = filters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.itemName.toLowerCase().includes(s) || 
          p.vendor.name.toLowerCase().includes(s)
        );
      }
      set({ purchases: filtered, loading: false });
    }
  },

  createPurchase: async (purchaseData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/purchases`, purchaseData);
      if (response.data?.success) {
        set({ purchases: [response.data.data, ...get().purchases], loading: false });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend offline, capturing local simulated purchase record.');
      
      const vendor = get().vendors.find(v => v._id === purchaseData.vendorId) || MOCK_VENDORS[0];
      const weight = Number(purchaseData.weight);
      const rate = Number(purchaseData.rateApplied);
      const charges = Number(purchaseData.otherCharges || 0);
      const total = (weight * rate) + charges;
      const paid = Number(purchaseData.amountPaid || 0);

      const newMock = {
        _id: `purch-mock-${Date.now()}`,
        vendor: {
          name: vendor.name,
          companyName: vendor.companyName,
          phone: vendor.phone
        },
        itemName: purchaseData.itemName,
        metalType: purchaseData.metalType,
        purity: purchaseData.purity,
        weight,
        rateApplied: rate,
        otherCharges: charges,
        purchaseAmount: total,
        amountPaid: paid,
        balanceDue: Math.max(0, total - paid),
        paymentStatus: paid >= total ? 'paid' : paid > 0 ? 'partially_paid' : 'unpaid',
        purchaseDate: new Date().toISOString()
      };

      set({ purchases: [newMock, ...get().purchases], loading: false });
      return { success: true };
    }
  }
}));
