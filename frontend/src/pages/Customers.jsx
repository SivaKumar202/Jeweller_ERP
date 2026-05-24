import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useCustomerStore } from '../store/customerStore.js';
import { Search, Plus, UserCheck, Calendar, Receipt, CircleDollarSign, Compass, ArrowRight } from 'lucide-react';

const Customers = () => {
  const { customers, selectedCustomer, salesHistory, fetchCustomers, fetchCustomerById, createCustomer, loading } = useCustomerStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeProfileId, setActiveProfileId] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');

  useEffect(() => {
    fetchCustomers(search);
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await createCustomer({ name, phone, address, gstNumber });
    if (result.success) {
      setShowAddModal(false);
      setName('');
      setPhone('');
      setAddress('');
      setGstNumber('');
    }
  };

  const viewProfile = (id) => {
    setActiveProfileId(id);
    fetchCustomerById(id);
  };

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Customer Dues Ledger" />

      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        
        {/* Dynamic Multi-column profile splitter */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Customers List Column */}
          <div className="lg:col-span-1 glass-panel rounded-3xl p-6 border border-royal-800 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Patron Directory</h3>
              <button
                onClick={() => setShowAddModal(true)}
                className="w-8 h-8 rounded-xl bg-[#0071e3] hover:bg-[#0077ed] text-white flex items-center justify-center cursor-pointer shadow-md active:scale-[0.95] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search name, phone number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-slate-100 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-slate-500"
              />
            </div>

            {/* Customer List Container */}
            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {customers.map((c) => (
                <button
                  key={c._id}
                  onClick={() => viewProfile(c._id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center group cursor-pointer ${
                    activeProfileId === c._id
                      ? 'bg-gradient-to-r from-gold-500/15 to-transparent border-gold-500/40 text-gold-400'
                      : 'bg-royal-950/30 border-royal-850 hover:border-royal-700/80 hover:bg-royal-800/20 text-slate-300'
                  }`}
                >
                  <div>
                    <h4 className={`font-bold text-xs truncate group-hover:text-gold-400 transition-colors ${activeProfileId === c._id ? 'text-gold-400' : 'text-white'}`}>{c.name}</h4>
                    <span className="text-[10px] text-slate-500 block mt-0.5">+91 {c.phone}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-bold block ${c.pendingAmount > 0 ? 'text-rose-400' : 'text-slate-500'}`}>
                      {c.pendingAmount > 0 ? `₹${c.pendingAmount.toLocaleString('en-IN')}` : 'Cleared'}
                    </span>
                    <span className="text-[8px] text-slate-600 block uppercase font-medium mt-0.5">Balance</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Customer Profile Column */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-royal-800 h-[75vh] flex flex-col justify-between">
            {selectedCustomer ? (
              <div className="flex flex-col justify-between h-full space-y-6">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-royal-800/80 pb-5 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-royal-850 border border-royal-800 flex items-center justify-center text-gold-400">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white tracking-tight">{selectedCustomer.name}</h2>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Patron File: +91 {selectedCustomer.phone}</span>
                    </div>
                  </div>

                  <div className="bg-royal-950/50 border border-royal-800/50 rounded-2xl px-5 py-2.5 flex items-center gap-4">
                    <div>
                      <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">Ledger Balance</span>
                      <span className={`text-sm font-bold ${selectedCustomer.pendingAmount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                        ₹{selectedCustomer.pendingAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                    {selectedCustomer.gstNumber && (
                      <div className="border-l border-royal-800/80 pl-4">
                        <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">GSTIN</span>
                        <span className="text-xs font-semibold text-slate-300 font-mono">{selectedCustomer.gstNumber}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Body: Ledger details and address */}
                <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
                  {/* Ledger addresses */}
                  <div className="md:w-60 bg-royal-950/20 border border-royal-850 rounded-2xl p-4 space-y-4">
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Office details</h4>
                    <div>
                      <span className="text-[9px] text-slate-600 block uppercase font-medium">Billed Address:</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1">{selectedCustomer.address || 'No billing address saved'}</p>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-600 block uppercase font-medium">Creation Date:</span>
                      <p className="text-xs text-slate-300 leading-relaxed mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        {new Date(selectedCustomer.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Purchase history list */}
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-3">Billing history</h4>
                    
                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                      {salesHistory.length === 0 ? (
                        <div className="border border-dashed border-royal-800/60 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-500 text-center h-full">
                          <Receipt className="w-10 h-10 text-royal-850 mb-2" />
                          <span className="text-xs font-semibold">No purchase history logged</span>
                        </div>
                      ) : (
                        salesHistory.map((s) => (
                          <div 
                            key={s._id} 
                            className="p-4 bg-royal-950/30 border border-royal-850 rounded-2xl flex justify-between items-center hover:border-royal-750 transition-colors"
                          >
                            <div className="space-y-1">
                              <span className="text-[10px] font-mono font-bold text-slate-500 block">{s.invoiceNumber}</span>
                              <span className="text-xs font-bold text-white block">₹{s.totals.finalAmount.toLocaleString('en-IN')}</span>
                              <span className="text-[9px] text-slate-600 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {new Date(s.createdAt).toLocaleDateString('en-IN')}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                s.paymentStatus === 'paid' 
                                  ? 'bg-green-500/10 text-green-400 border border-green-500/10' 
                                  : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/10'
                              }`}>
                                {s.paymentStatus}
                              </span>
                              {s.balanceDue > 0 && (
                                <span className="text-[9px] text-rose-400 font-semibold block mt-1.5">
                                  Dues: ₹{s.balanceDue.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-500 h-full text-center">
                <Compass className="w-12 h-12 text-royal-800 mb-3 animate-spin" style={{ animationDuration: '60s' }} />
                <span className="text-sm font-semibold">Select a Customer to view ledger details</span>
                <span className="text-[10px] mt-1 text-slate-600">Choose from the left panel directory to review clients file</span>
              </div>
            )}
          </div>
          
        </div>

      </main>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-royal-900 border border-royal-800 rounded-3xl p-8 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Register new Client</h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Customer Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Active Phone Number</label>
                <input
                  type="text"
                  maxLength="10"
                  placeholder="e.g. 9845012345"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">GSTIN Registration (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. 29AAAAA1111A1Z1"
                  value={gstNumber}
                  onChange={(e) => setGstNumber(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Residential Address</label>
                <textarea
                  placeholder="Residential coordinates..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-royal-800/80 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-royal-800/35 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
