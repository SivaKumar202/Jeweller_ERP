import React, { useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import { useRateStore } from '../store/rateStore.js';
import { Sparkles, Save, ShieldAlert, Award } from 'lucide-react';

const Settings = () => {
  const { rates, updateRates, loading } = useRateStore();

  const [gold24k, setGold24k] = useState(rates.gold24k.toString());
  const [gold22k, setGold22k] = useState(rates.gold22k.toString());
  const [gold18k, setGold18k] = useState(rates.gold18k.toString());
  const [silver, setSilver] = useState(rates.silver.toString());
  const [platinum, setPlatinum] = useState(rates.platinum.toString());

  const [notice, setNotice] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateRates({
      gold24k: Number(gold24k),
      gold22k: Number(gold22k),
      gold18k: Number(gold18k),
      silver: Number(silver),
      platinum: Number(platinum),
    });

    if (result.success) {
      setNotice({ type: 'success', text: result.message || 'Live spot rates updated successfully!' });
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="ERP System Configurations" />

      <main className="max-w-4xl mx-auto px-8 mt-8 space-y-6">
        
        <div className="glass-panel rounded-3xl p-8 border border-royal-800 space-y-6">
          <div className="flex items-center gap-3 border-b border-royal-800/80 pb-5">
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center text-gold-400 border border-gold-500/20">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white tracking-tight uppercase text-sm">Today's Spot metal rate settings</h3>
              <span className="text-[10px] text-slate-500 block mt-0.5">Admin-only adjustments that automatically drive cart calculations</span>
            </div>
          </div>

          {notice && (
            <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed border ${
              notice.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}>
              {notice.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gold 24K Spot Rate (₹/g)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={gold24k}
                    onChange={(e) => setGold24k(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-white rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gold 22K Spot Rate (₹/g)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={gold22k}
                    onChange={(e) => setGold22k(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-white rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Gold 18K Spot Rate (₹/g)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={gold18k}
                    onChange={(e) => setGold18k(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-white rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Silver Spot Rate (₹/g)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={silver}
                    onChange={(e) => setSilver(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-white rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Platinum Spot Rate (₹/g)</label>
                <div className="relative">
                  <span className="absolute left-4 top-2.5 text-slate-500 text-xs font-bold">₹</span>
                  <input
                    type="number"
                    value={platinum}
                    onChange={(e) => setPlatinum(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 bg-royal-950/60 border border-royal-800 text-white rounded-xl text-xs focus:ring-1 focus:ring-gold-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

            </div>

            <div className="flex justify-end gap-3 border-t border-royal-800/80 pt-5 mt-6">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-xl font-bold text-xs shadow-md active:scale-[0.99] flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-all duration-200"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving live rates...' : 'Commit live Spot rates'}
              </button>
            </div>
          </form>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-royal-850 bg-royal-900/15 flex items-start gap-4">
          <ShieldAlert className="w-10 h-10 text-amber-500 flex-shrink-0" />
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Automated Invoice Re-indexing Notice</h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Applying new metal prices changes live valuations for all unbilled cart lines immediately. All completed invoices are stored with legacy audit-trail rates intact to ensure legal compliance.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default Settings;
