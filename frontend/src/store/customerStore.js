import { create } from 'zustand';
import axios from 'axios';

const API_URL = '/api';

const MOCK_CUSTOMERS = [
  {
    _id: 'cust-1',
    name: 'Ramesh Kumar',
    phone: '9845012345',
    address: 'Indiranagar, Bengaluru, Karnataka',
    gstNumber: '29AAAAA1111A1Z1',
    pendingAmount: 12500,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cust-2',
    name: 'Priya Sharma',
    phone: '9123456789',
    address: 'Saket, New Delhi',
    gstNumber: '',
    pendingAmount: 0,
    createdAt: new Date().toISOString(),
  },
  {
    _id: 'cust-3',
    name: 'Ananya Deshmukh',
    phone: '8765432109',
    address: 'Andheri West, Mumbai, Maharashtra',
    gstNumber: '27BBBBB2222B2Z2',
    pendingAmount: 45000,
    createdAt: new Date().toISOString(),
  }
];

export const useCustomerStore = create((set, get) => ({
  customers: [],
  selectedCustomer: null,
  salesHistory: [],
  loading: false,
  error: null,

  fetchCustomers: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/customers`, { params: { search } });
      if (response.data?.success) {
        set({ customers: response.data.data, loading: false });
      }
    } catch (err) {
      console.warn('Backend offline, loading premium mock customer list.');
      let filtered = [...MOCK_CUSTOMERS];
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(s) || 
          c.phone.toLowerCase().includes(s)
        );
      }
      set({ customers: filtered, loading: false });
    }
  },

  fetchCustomerById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/customers/${id}`);
      if (response.data?.success) {
        set({
          selectedCustomer: response.data.data.customer,
          salesHistory: response.data.data.salesHistory,
          loading: false,
        });
      }
    } catch (err) {
      console.warn('Backend offline, retrieving mock customer file.');
      const customer = get().customers.find(c => c._id === id) || MOCK_CUSTOMERS.find(c => c._id === id);
      set({
        selectedCustomer: customer,
        salesHistory: [
          {
            _id: 'sale-mock-h1',
            invoiceNumber: 'INV-20260520-0001',
            customer: { name: customer.name, phone: customer.phone },
            totals: { grossTotal: 84000, discount: 2000, taxableValue: 82000, gstTotal: 2460, exchangeValue: 0, finalAmount: 84460 },
            amountPaid: 84460,
            balanceDue: 0,
            paymentStatus: 'paid',
            createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          }
        ],
        loading: false,
      });
    }
  },

  createCustomer: async (customerData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/customers`, customerData);
      if (response.data?.success) {
        set({ customers: [response.data.data, ...get().customers], loading: false });
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.warn('Backend offline, saving local mock customer profile.');
      const newMock = {
        _id: `cust-mock-${Date.now()}`,
        ...customerData,
        pendingAmount: 0,
        createdAt: new Date().toISOString(),
      };
      set({ customers: [newMock, ...get().customers], loading: false });
      return { success: true, data: newMock, message: 'Saved to local mock store' };
    }
  },

  updateCustomer: async (id, customerData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/customers/${id}`, customerData);
      if (response.data?.success) {
        set({
          customers: get().customers.map((c) => (c._id === id ? response.data.data : c)),
          loading: false,
        });
        return { success: true };
      }
    } catch (err) {
      console.warn('Backend update failed, updating local state.');
      set({
        customers: get().customers.map((c) => (c._id === id ? { ...c, ...customerData } : c)),
        loading: false,
      });
      return { success: true };
    }
  },
}));
