import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { usePurchaseStore } from '../store/purchaseStore.js';
import { Search, Plus, Calendar, BadgePlus, ShoppingCart, Gem } from 'lucide-react';

const Purchases = () => {
  const { purchases, vendors, fetchPurchases, fetchVendors, createPurchase, createVendor, loading } = usePurchaseStore();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showVendorModal, setShowVendorModal] = useState(false);

  // Purchase Form States
  const [vendorId, setVendorId] = useState('');
  const [itemName, setItemName] = useState('');
  const [metalType, setMetalType] = useState('gold');
  const [purity, setPurity] = useState('24K');
  const [weight, setWeight] = useState('');
  const [rateApplied, setRateApplied] = useState('');
  const [otherCharges, setOtherCharges] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');

  // Vendor Form States
  const [vName, setVName] = useState('');
  const [vCompany, setVCompany] = useState('');
  const [vPhone, setVPhone] = useState('');
  const [vAddress, setVAddress] = useState('');
  const [vGst, setVGst] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    fetchPurchases({ search });
  }, [search]);

  // Set default vendor if vendors populated
  useEffect(() => {
    if (vendors.length > 0 && !vendorId) {
      setVendorId(vendors[0]._id);
    }
  }, [vendors]);

  const handlePurchaseSubmit = async (e) => {
    e.preventDefault();
    const result = await createPurchase({
      vendorId,
      itemName,
      metalType,
      purity,
      weight,
      rateApplied,
      otherCharges,
      amountPaid,
      notes,
    });
    if (result.success) {
      setShowAddModal(false);
      setItemName('');
      setWeight('');
      setRateApplied('');
      setOtherCharges('');
      setAmountPaid('');
      setNotes('');
    }
  };

  const handleVendorSubmit = async (e) => {
    e.preventDefault();
    const result = await createVendor({
      name: vName,
      companyName: vCompany,
      phone: vPhone,
      address: vAddress,
      gstNumber: vGst,
    });
    if (result.success) {
      setShowVendorModal(false);
      setVName('');
      setVCompany('');
      setVPhone('');
      setVAddress('');
      setVGst('');
    }
  };

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Procurements & Supplier Desk" />

      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        
        {/* Header Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-royal-900/30 p-4 border border-royal-800/40 rounded-2xl">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search item, vendor company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-slate-100 rounded-xl text-xs w-full focus:outline-none focus:ring-1 focus:ring-gold-500 placeholder:text-slate-500"
            />
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowVendorModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-royal-800 hover:bg-royal-800/40 hover:text-white text-slate-300 rounded-xl font-semibold text-xs cursor-pointer transition-all"
            >
              <BadgePlus className="w-4 h-4 text-gold-500" />
              Register Supplier
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              Log Procurement
            </button>
          </div>
        </div>

        {/* Procurement Logs List */}
        <div className="glass-panel rounded-3xl overflow-hidden border border-royal-800">
          <div className="p-6 border-b border-royal-800/80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Purchase History Ledger</h3>
          </div>

          {purchases.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-royal-850 mb-2" />
              <span className="text-xs font-semibold">No raw stock procurements logged yet</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-royal-950/40 border-b border-royal-800 text-slate-400 uppercase text-[9px] tracking-wider">
                    <th className="py-4 px-6 font-bold">Date</th>
                    <th className="py-4 px-6 font-bold">Supplier Info</th>
                    <th className="py-4 px-6 font-bold">Metal Description</th>
                    <th className="py-4 px-6 font-bold text-right">Net Weight</th>
                    <th className="py-4 px-6 font-bold text-right">Procure rate</th>
                    <th className="py-4 px-6 font-bold text-right">Total Price</th>
                    <th className="py-4 px-6 font-bold text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-royal-850/40">
                  {purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-royal-900/10 transition-colors text-slate-300">
                      <td className="py-4 px-6 font-medium flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-gold-500" />
                        {new Date(p.purchaseDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white block">{p.vendor.companyName || p.vendor.name}</span>
                        <span className="text-[10px] text-slate-500 block mt-0.5">+91 {p.vendor.phone}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white block">{p.itemName}</span>
                        <span className="text-[10px] text-gold-500 font-bold block mt-0.5 uppercase tracking-wider">{p.purity} {p.metalType}</span>
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-slate-200">{p.weight.toFixed(3)}g</td>
                      <td className="py-4 px-6 text-right text-slate-200">₹{p.rateApplied.toLocaleString('en-IN')}/g</td>
                      <td className="py-4 px-6 text-right font-bold text-white">₹{p.purchaseAmount.toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          p.paymentStatus === 'paid'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-yellow-500/10 text-yellow-400'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* Log Procurement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-royal-900 border border-royal-800 rounded-3xl p-8 max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Log Raw stock Procurement</h3>

            <form onSubmit={handlePurchaseSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Select Vendor */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Registered Supplier</label>
                  {vendors.length === 0 ? (
                    <div className="text-xs text-amber-400">No registered suppliers found! Click Cancel and add supplier first.</div>
                  ) : (
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full py-2.5 px-4 glass-input text-xs"
                    >
                      {vendors.map((v) => (
                        <option key={v._id} value={v._id}>{v.companyName || v.name} (+91 {v.phone})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Particular Name */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Particular Details</label>
                  <input
                    type="text"
                    placeholder="e.g. 24K pure gold bricks"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Metal Type */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Metal classification</label>
                  <select
                    value={metalType}
                    onChange={(e) => setMetalType(e.target.value)}
                    className="w-full py-2.5 px-4 glass-input text-xs uppercase"
                  >
                    <option value="gold">Gold</option>
                    <option value="silver">Silver</option>
                    <option value="platinum">Platinum</option>
                    <option value="diamond">Diamond</option>
                  </select>
                </div>

                {/* Purity */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Metal Purity</label>
                  <input
                    type="text"
                    placeholder="e.g. 24K, 22K, Sterling"
                    value={purity}
                    onChange={(e) => setPurity(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Weight */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Net Weight (grams)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 100.000"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Purchase Rate */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Purchase Rate Applied (₹/g)</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={rateApplied}
                    onChange={(e) => setRateApplied(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>

                {/* Other charges */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Refining / Other Charges (₹)</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={otherCharges}
                    onChange={(e) => setOtherCharges(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                  />
                </div>

                {/* Paid amount */}
                <div>
                  <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Settled Payment Amount (₹)</label>
                  <input
                    type="number"
                    placeholder="₹ 0.00"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    className="w-full py-2 px-4 glass-input text-xs"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Supplier comments</label>
                <textarea
                  placeholder="Additional logistics notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
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
                  Log Procurement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Register Modal */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-royal-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-royal-900 border border-royal-800 rounded-3xl p-8 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Register Supplier Company</h3>

            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Company / Vendor Name</label>
                <input
                  type="text"
                  placeholder="e.g. Mahalaxmi Bullion Pvt Ltd"
                  value={vCompany}
                  onChange={(e) => setVCompany(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Supplier Representative Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sanjay Choksi"
                  value={vName}
                  onChange={(e) => setVName(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Representative Phone</label>
                <input
                  type="text"
                  maxLength="10"
                  placeholder="e.g. 9820011223"
                  value={vPhone}
                  onChange={(e) => setVPhone(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">GSTIN ID</label>
                <input
                  type="text"
                  placeholder="e.g. 27AAAAA0000A1Z0"
                  value={vGst}
                  onChange={(e) => setVGst(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Registered Address</label>
                <textarea
                  placeholder="Supplier HQ coordinates..."
                  value={vAddress}
                  onChange={(e) => setVAddress(e.target.value)}
                  className="w-full py-2 px-4 glass-input text-xs h-20 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-royal-800/80 pt-5 mt-6">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 border border-slate-700 hover:bg-royal-800/35 text-slate-300 hover:text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] cursor-pointer transition-all duration-200"
                >
                  Register Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Purchases;
