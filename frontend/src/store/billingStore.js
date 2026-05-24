import { create } from 'zustand';
import axios from 'axios';
import { useRateStore } from './rateStore.js';
import { useCustomerStore } from './customerStore.js';

const API_URL = '/api';

const initialExchange = {
  weight: 0,
  purity: 100, // purity percentage, e.g. 91.6% for 22K gold
  deduction: 0, // deduction percentage
  exchangeValue: 0,
};

const initialTotals = {
  grossTotal: 0,
  discount: 0,
  taxableValue: 0,
  cgst: 0,
  sgst: 0,
  gstTotal: 0,
  exchangeValue: 0,
  finalAmount: 0,
};

export const useBillingStore = create((set, get) => ({
  selectedCustomer: null,
  cartItems: [],
  oldGoldExchange: { ...initialExchange },
  discount: 0,
  payments: [],
  invoiceTotals: { ...initialTotals },
  sales: [],
  loading: false,
  error: null,

  selectCustomer: (customer) => {
    set({ selectedCustomer: customer });
  },

  addToCart: (product, rateApplied = null) => {
    const { cartItems } = get();
    const existing = cartItems.find((item) => item.productId === product._id);

    if (existing) return;

    // Use live rate if rateApplied not passed
    let rate = rateApplied;
    if (!rate) {
      const metalRates = useRateStore.getState().rates;
      if (product.metalType === 'gold') {
        if (product.purity === '24K') rate = metalRates.gold24k;
        else if (product.purity === '18K') rate = metalRates.gold18k;
        else rate = metalRates.gold22k; // Default 22K
      } else if (product.metalType === 'silver') {
        rate = metalRates.silver;
      } else if (product.metalType === 'platinum') {
        rate = metalRates.platinum;
      } else {
        rate = 1000; // fallback standard
      }
    }

    const newItem = {
      productId: product._id,
      name: product.name,
      metalType: product.metalType,
      purity: product.purity,
      weight: product.weight,
      rateApplied: rate,
      stonePrice: product.stonePrice || 0,
      makingCharge: product.makingCharge || 0,
      makingChargeType: product.makingChargeType || 'fixed',
      makingChargeTotal: 0,
      itemTotal: 0,
    };

    set({ cartItems: [...cartItems, newItem] });
    get().calculateTotals();
  },

  removeFromCart: (productId) => {
    set({ cartItems: get().cartItems.filter((item) => item.productId !== productId) });
    get().calculateTotals();
  },

  updateCartItem: (productId, field, value) => {
    const updated = get().cartItems.map((item) => {
      if (item.productId === productId) {
        const updatedItem = { ...item, [field]: value };
        return updatedItem;
      }
      return item;
    });
    set({ cartItems: updated });
    get().calculateTotals();
  },

  setOldGoldExchange: (field, value) => {
    const exchange = { ...get().oldGoldExchange, [field]: Number(value) };
    
    // Live calculate exchange rate value using today's gold rate
    const metalRates = useRateStore.getState().rates;
    const rate = metalRates.gold22k; // Old gold is valued at 22K typically or live market standard

    const rawVal = exchange.weight * rate;
    const purityAdjusted = rawVal * (exchange.purity / 100);
    const deductionVal = purityAdjusted * (exchange.deduction / 100);
    exchange.exchangeValue = Math.max(0, Math.round((purityAdjusted - deductionVal) * 100) / 100);

    set({ oldGoldExchange: exchange });
    get().calculateTotals();
  },

  setDiscount: (value) => {
    set({ discount: Number(value) });
    get().calculateTotals();
  },

  calculateTotals: () => {
    const { cartItems, discount, oldGoldExchange } = get();

    let grossTotal = 0;

    const itemsWithTotals = cartItems.map((item) => {
      const weight = Number(item.weight || 0);
      const rate = Number(item.rateApplied || 0);
      const stonePrice = Number(item.stonePrice || 0);
      const makingCharge = Number(item.makingCharge || 0);
      
      let makingChargeTotal = 0;
      if (item.makingChargeType === 'fixed') {
        makingChargeTotal = makingCharge;
      } else if (item.makingChargeType === 'per_gram') {
        makingChargeTotal = makingCharge * weight;
      } else if (item.makingChargeType === 'percentage') {
        makingChargeTotal = (weight * rate) * (makingCharge / 100);
      }

      const itemTotal = (weight * rate) + stonePrice + makingChargeTotal;
      grossTotal += itemTotal;

      return {
        ...item,
        makingChargeTotal: Math.round(makingChargeTotal * 100) / 100,
        itemTotal: Math.round(itemTotal * 100) / 100,
      };
    });

    const taxableValue = Math.max(0, grossTotal - discount);
    const cgst = Math.round((taxableValue * 0.015) * 100) / 100;
    const sgst = Math.round((taxableValue * 0.015) * 100) / 100;
    const gstTotal = cgst + sgst;
    
    const exchangeVal = oldGoldExchange.exchangeValue || 0;
    const finalAmount = Math.max(0, Math.round((taxableValue + gstTotal - exchangeVal) * 100) / 100);

    set({
      cartItems: itemsWithTotals,
      invoiceTotals: {
        grossTotal: Math.round(grossTotal * 100) / 100,
        discount,
        taxableValue: Math.round(taxableValue * 100) / 100,
        cgst,
        sgst,
        gstTotal,
        exchangeValue: exchangeVal,
        finalAmount,
      },
    });
  },

  setPayments: (payList) => {
    set({ payments: payList });
  },

  clearInvoice: () => {
    set({
      selectedCustomer: null,
      cartItems: [],
      oldGoldExchange: { ...initialExchange },
      discount: 0,
      payments: [],
      invoiceTotals: { ...initialTotals },
    });
  },

  fetchSales: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/billing`);
      if (response.data?.success) {
        set({ sales: response.data.data, loading: false });
      }
    } catch (err) {
      console.warn('Backend offline, using local billing sales memory.');
      set({ loading: false });
    }
  },

  submitInvoice: async (amountPaid) => {
    const { selectedCustomer, cartItems, oldGoldExchange, discount, payments, invoiceTotals } = get();

    if (!selectedCustomer) return { success: false, message: 'Please select a customer first' };
    if (cartItems.length === 0) return { success: false, message: 'Please add items to cart' };

    set({ loading: true, error: null });

    const payload = {
      customerId: selectedCustomer._id,
      items: cartItems,
      oldGoldExchange,
      discount,
      payments,
      amountPaid,
    };

    try {
      const response = await axios.post(`${API_URL}/billing`, payload);
      if (response.data?.success) {
        set({ sales: [response.data.data, ...get().sales], loading: false });
        get().clearInvoice();
        return { success: true, data: response.data.data };
      }
    } catch (err) {
      console.warn('Backend offline, simulating invoice creation locally.');
      
      const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(get().sales.length + 1).padStart(4, '0')}`;
      const mockInvoice = {
        _id: `sale-mock-${Date.now()}`,
        invoiceNumber,
        customer: {
          id: selectedCustomer._id,
          name: selectedCustomer.name,
          phone: selectedCustomer.phone,
          gstNumber: selectedCustomer.gstNumber,
        },
        items: [...cartItems],
        oldGoldExchange: { ...oldGoldExchange },
        totals: { ...invoiceTotals },
        payments: [...payments],
        amountPaid,
        balanceDue: Math.max(0, invoiceTotals.finalAmount - amountPaid),
        paymentStatus: amountPaid >= invoiceTotals.finalAmount ? 'paid' : amountPaid > 0 ? 'partially_paid' : 'unpaid',
        createdAt: new Date().toISOString(),
      };

      // Update local ledger outstanding dues
      const dues = Math.max(0, invoiceTotals.finalAmount - amountPaid);
      if (dues > 0) {
        useCustomerStore.getState().updateCustomer(selectedCustomer._id, {
          pendingAmount: (selectedCustomer.pendingAmount || 0) + dues
        });
      }

      set({ sales: [mockInvoice, ...get().sales], loading: false });
      get().clearInvoice();

      return { success: true, data: mockInvoice, message: 'Invoices created and saved locally' };
    }
  },
}));
