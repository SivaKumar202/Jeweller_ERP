import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar.jsx';
import InvoiceTemplate from '../components/InvoiceTemplate.jsx';
import { useBillingStore } from '../store/billingStore.js';
import { useCustomerStore } from '../store/customerStore.js';
import { useProductStore } from '../store/productStore.js';
import { useRateStore } from '../store/rateStore.js';
import { Search, UserCheck, Plus, Trash2, Printer, ShoppingCart, Sparkles, Coins, CreditCard, Wallet, BadgePercent, CheckCircle, Smartphone } from 'lucide-react';

const Billing = () => {
  const billingStore = useBillingStore();
  const { customers, fetchCustomers } = useCustomerStore();
  const { products, fetchProducts } = useProductStore();
  const { rates } = useRateStore();

  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Checkout modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentId, setPaymentId] = useState('');
  
  // Post-submit invoice viewing states
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const printInvoiceRef = useRef();

  useEffect(() => {
    fetchCustomers(customerSearch);
  }, [customerSearch]);

  useEffect(() => {
    fetchProducts({ search: productSearch, stockStatus: 'in_stock' });
  }, [productSearch]);

  const selectCustomer = (c) => {
    billingStore.selectCustomer(c);
    setCustomerSearch('');
  };

  const handleAddToCart = (p) => {
    billingStore.addToCart(p);
    setProductSearch('');
  };

  const openCheckout = () => {
    if (!billingStore.selectedCustomer) {
      alert('Please select a customer first!');
      return;
    }
    if (billingStore.cartItems.length === 0) {
      alert('Cart is empty!');
      return;
    }
    setAmountPaidInput(billingStore.invoiceTotals.finalAmount.toString());
    setShowCheckoutModal(true);
  };

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    const paid = Number(amountPaidInput);

    // Build split payment
    const paymentRecord = [{
      method: paymentMethod,
      amount: paid,
      paymentId: paymentId || `pay_desk_${Date.now()}`
    }];

    billingStore.setPayments(paymentRecord);
    const result = await billingStore.submitInvoice(paid);

    if (result.success) {
      setShowCheckoutModal(false);
      setActiveInvoice(result.data);
      setShowPrintModal(true);
    }
  };

  const handlePrint = () => {
    const printContent = printInvoiceRef.current.innerHTML;
    const originalContent = document.body.innerHTML;

    document.body.innerHTML = printContent;
    window.print();
    // Restore
    window.location.reload();
  };

  const totals = billingStore.invoiceTotals;
  const exchange = billingStore.oldGoldExchange;

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Jewellery Billing Workspace" />

      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        
        {/* Core Billing Engine Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Cart + Old Gold Exchange + Adjustments (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Customer Search & Selected Banner */}
            <div className="glass-panel rounded-3xl p-6 border border-royal-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-gold-400" />
                1. Customer Billing Ledger
              </h3>
              
              {!billingStore.selectedCustomer ? (
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search client by name or 10-digit phone number..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-slate-100 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-slate-500"
                  />
                  {customerSearch && customers.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-royal-900 border border-royal-800 rounded-2xl max-h-48 overflow-y-auto z-40 shadow-2xl p-2 space-y-1">
                      {customers.map((c) => (
                        <button
                          key={c._id}
                          onClick={() => selectCustomer(c)}
                          className="w-full text-left p-3 hover:bg-royal-850 rounded-xl text-xs flex justify-between items-center text-slate-200 cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-white block">{c.name}</span>
                            <span className="text-[10px] text-slate-500 block">+91 {c.phone}</span>
                          </div>
                          <Plus className="w-4 h-4 text-gold-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-gradient-to-r from-gold-500/10 to-transparent border border-gold-500/30 rounded-2xl flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">{billingStore.selectedCustomer.name}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Patron File: +91 {billingStore.selectedCustomer.phone}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => billingStore.selectCustomer(null)}
                    className="text-[10px] font-bold text-rose-400 hover:text-rose-300 tracking-wider uppercase border border-rose-500/20 bg-rose-500/5 px-3 py-1 rounded-lg cursor-pointer"
                  >
                    Change Client
                  </button>
                </div>
              )}
            </div>

            {/* Cart Items Table */}
            <div className="glass-panel rounded-3xl p-6 border border-royal-800 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-gold-400" />
                  2. fresh Jewellery Cart Items
                </h3>
                
                {/* Product Search inside cart */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stock item or barcode..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="pl-9 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-slate-100 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-slate-500"
                  />
                  {productSearch && products.length > 0 && (
                    <div className="absolute left-0 right-0 mt-2 bg-royal-900 border border-royal-800 rounded-2xl max-h-48 overflow-y-auto z-40 shadow-2xl p-2 space-y-1">
                      {products.map((p) => (
                        <button
                          key={p._id}
                          onClick={() => handleAddToCart(p)}
                          className="w-full text-left p-3 hover:bg-royal-850 rounded-xl text-xs flex justify-between items-center text-slate-200 cursor-pointer"
                        >
                          <div>
                            <span className="font-bold text-white block">{p.name}</span>
                            <span className="text-[10px] text-slate-500 block">{p.weight}g | {p.purity}</span>
                          </div>
                          <Plus className="w-4 h-4 text-gold-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Items list */}
              {billingStore.cartItems.length === 0 ? (
                <div className="border border-dashed border-royal-850 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 text-center">
                  <Sparkles className="w-10 h-10 text-royal-850 mb-2" />
                  <span className="text-xs font-semibold">Fresh invoice checkout cart is empty</span>
                  <span className="text-[9px] mt-0.5">Select a client and search products above to populate the ledger items</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {billingStore.cartItems.map((item, idx) => (
                    <div 
                      key={item.productId} 
                      className="p-4 bg-royal-950/30 border border-royal-850 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-royal-750 transition-colors"
                    >
                      <div className="flex-1 space-y-1">
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">ITEM #{idx + 1}</span>
                        <h4 className="font-bold text-white text-xs block">{item.name}</h4>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="px-2 py-0.5 rounded bg-royal-800 text-slate-300 text-[9px] uppercase font-bold">{item.metalType}</span>
                          <span className="px-2 py-0.5 rounded bg-royal-800 text-slate-300 text-[9px] font-bold">{item.purity}</span>
                        </div>
                      </div>

                      {/* Weight, Rate, Stone, Making Inputs */}
                      <div className="grid grid-cols-2 md:flex items-center gap-3">
                        <div className="w-20">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold mb-1">Weight (g)</span>
                          <input
                            type="number"
                            value={item.weight}
                            onChange={(e) => billingStore.updateCartItem(item.productId, 'weight', Number(e.target.value))}
                            className="w-full text-xs font-semibold py-1 px-2 bg-royal-950 border border-royal-800 rounded-lg text-slate-200"
                          />
                        </div>
                        <div className="w-24">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold mb-1">Rate (₹/g)</span>
                          <input
                            type="number"
                            value={item.rateApplied}
                            onChange={(e) => billingStore.updateCartItem(item.productId, 'rateApplied', Number(e.target.value))}
                            className="w-full text-xs font-semibold py-1 px-2 bg-royal-950 border border-royal-800 rounded-lg text-slate-200"
                          />
                        </div>
                        <div className="w-20">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold mb-1">Stone (₹)</span>
                          <input
                            type="number"
                            value={item.stonePrice}
                            onChange={(e) => billingStore.updateCartItem(item.productId, 'stonePrice', Number(e.target.value))}
                            className="w-full text-xs font-semibold py-1 px-2 bg-royal-950 border border-royal-800 rounded-lg text-slate-200"
                          />
                        </div>
                        <div className="w-24">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold mb-1">Making Charge</span>
                          <input
                            type="number"
                            value={item.makingCharge}
                            onChange={(e) => billingStore.updateCartItem(item.productId, 'makingCharge', Number(e.target.value))}
                            className="w-full text-xs font-semibold py-1 px-2 bg-royal-950 border border-royal-800 rounded-lg text-slate-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-royal-850 pt-2.5 md:pt-0">
                        <div className="text-right">
                          <span className="text-[8px] text-slate-500 block uppercase font-bold">Total price</span>
                          <span className="font-bold text-white text-xs">₹{item.itemTotal.toLocaleString('en-IN')}</span>
                        </div>
                        <button
                          onClick={() => billingStore.removeFromCart(item.productId)}
                          className="p-2 hover:bg-rose-500/10 text-rose-400 rounded-xl transition-all cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Old Gold Exchange module */}
            <div className="glass-panel rounded-3xl p-6 border border-royal-800 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                3. Old gold Exchange details (Simple Offset)
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Exchange Weight (g)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.000g"
                    value={exchange.weight || ''}
                    onChange={(e) => billingStore.setOldGoldExchange('weight', e.target.value)}
                    className="w-full px-3 py-2 bg-royal-950/60 border border-royal-800 text-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Exchange Purity %</label>
                  <input
                    type="number"
                    maxLength="3"
                    placeholder="e.g. 91.6%"
                    value={exchange.purity || ''}
                    onChange={(e) => billingStore.setOldGoldExchange('purity', e.target.value)}
                    className="w-full px-3 py-2 bg-royal-950/60 border border-royal-800 text-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Deduction / Wastage %</label>
                  <input
                    type="number"
                    maxLength="2"
                    placeholder="e.g. 10%"
                    value={exchange.deduction || ''}
                    onChange={(e) => billingStore.setOldGoldExchange('deduction', e.target.value)}
                    className="w-full px-3 py-2 bg-royal-950/60 border border-royal-800 text-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Simulated Exchange Value</label>
                  <div className="w-full px-3 py-2.5 bg-amber-500/10 border border-amber-500/25 text-amber-400 font-bold rounded-xl text-xs text-right">
                    ₹{exchange.exchangeValue.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Bill Calculators & Checkout (4 cols) */}
          <div className="lg:col-span-4 space-y-6 sticky top-28">
            <div className="glass-panel rounded-3xl p-6 border border-royal-800 space-y-6">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-royal-800/80 pb-4">
                4. invoice summary calculations
              </h3>

              {/* Numerical breakdown */}
              <div className="space-y-3.5 text-xs text-slate-400">
                <div className="flex justify-between items-center">
                  <span>Gross Jewellery Price:</span>
                  <span className="font-semibold text-slate-200">₹{totals.grossTotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Deduction Discount:</span>
                  <div className="relative w-28">
                    <span className="absolute left-2.5 top-1.5 text-slate-500 text-[10px]">₹</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={billingStore.discount || ''}
                      onChange={(e) => billingStore.setDiscount(e.target.value)}
                      className="w-full pl-6 pr-2 py-1 bg-royal-950 border border-royal-800 rounded-lg text-xs font-semibold text-right text-slate-200"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-royal-800/50 pt-3">
                  <span>GST Taxable Value:</span>
                  <span className="font-semibold text-slate-200">₹{totals.taxableValue.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex justify-between items-center text-[11px] pl-4 text-slate-500">
                  <span>CGST (1.5%):</span>
                  <span>₹{totals.cgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pl-4 text-slate-500">
                  <span>SGST (1.5%):</span>
                  <span>₹{totals.sgst.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] pl-4 text-slate-500 pb-2">
                  <span>Total GST (3.0%):</span>
                  <span>₹{totals.gstTotal.toLocaleString('en-IN')}</span>
                </div>

                {totals.exchangeValue > 0 && (
                  <div className="flex justify-between items-center text-amber-500 font-semibold border-t border-royal-800/30 pt-3">
                    <span>Old Gold Exchange:</span>
                    <span>− ₹{totals.exchangeValue.toLocaleString('en-IN')}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t border-royal-800 pt-4 text-sm font-bold text-white">
                  <span>Net Payable Amount:</span>
                  <span className="text-gold-400 text-base">₹{totals.finalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Checkout buttons */}
              <button
                onClick={openCheckout}
                className="w-full py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-2xl font-bold text-sm shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200 text-center"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Checkout Split Payment Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-royal-900 border border-royal-800 rounded-3xl p-8 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-6 uppercase tracking-wider">Complete Invoice Settlement</h3>

            <form onSubmit={handleCheckoutSubmit} className="space-y-5">
              <div className="p-4 bg-royal-950/50 border border-royal-800/60 rounded-2xl text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-1">Invoice Grand Total</span>
                <span className="text-xl font-bold text-gold-400">₹{totals.finalAmount.toLocaleString('en-IN')}</span>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Amount Paid (INR)</label>
                <input
                  type="number"
                  placeholder="₹ 0.00"
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full py-2.5 px-4 font-bold text-base bg-royal-950 border border-royal-800 text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-gold-500"
                  required
                />
                <span className="text-[9px] text-slate-500 mt-1.5 block">
                  Outstanding ledger balance: ₹{Math.max(0, totals.finalAmount - Number(amountPaidInput || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2.5">Payment Desk Method</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'cash', name: 'Cash Handed', icon: Coins },
                    { id: 'upi', name: 'UPI / Scan', icon: Smartphone },
                    { id: 'card', name: 'POS Card Swipe', icon: CreditCard },
                    { id: 'razorpay', name: 'Razorpay Online', icon: Wallet },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-[11px] font-semibold cursor-pointer ${
                        paymentMethod === m.id
                          ? 'bg-gold-500/10 border-gold-500 text-gold-400'
                          : 'bg-royal-950/20 border-royal-850 hover:border-royal-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <m.icon className="w-4 h-4" />
                      {m.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Transaction ID (Reference)</label>
                <input
                  type="text"
                  placeholder="e.g. txn_100293, UPI Ref..."
                  value={paymentId}
                  onChange={(e) => setPaymentId(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-royal-800/80 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCheckoutModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-royal-800/35 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
                >
                  Complete Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Print / View Invoice Modal Overlay */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-between p-6 bg-royal-950/90 backdrop-blur-md overflow-y-auto">
          <div className="max-w-4xl mx-auto w-full my-auto space-y-6">
            <div className="flex justify-between items-center no-print">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                <CheckCircle className="w-4 h-4" />
                Invoice Successfully Logged!
              </span>
              
              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-100 text-black rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
                >
                  <Printer className="w-4.5 h-4.5" />
                  Print Tax Invoice
                </button>
                <button
                  onClick={() => {
                    setShowPrintModal(false);
                    setActiveInvoice(null);
                  }}
                  className="px-4 py-2 border border-slate-700 hover:bg-royal-800 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close Window
                </button>
              </div>
            </div>

            {/* Embed printable template */}
            <div className="print-area">
              <InvoiceTemplate ref={printInvoiceRef} invoice={activeInvoice} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
