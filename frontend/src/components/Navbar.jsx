import React, { useEffect } from 'react';
import { useRateStore } from '../store/rateStore.js';
import { useAuthStore } from '../store/authStore.js';
import { Sparkles, Calendar, BadgeAlert } from 'lucide-react';

const Navbar = ({ title }) => {
  const { rates, fetchRates } = useRateStore();
  const { isMock } = useAuthStore();

  useEffect(() => {
    fetchRates();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <header className="h-20 glass-panel border-b border-white/[0.06] sticky top-0 flex items-center justify-between px-8 z-20 no-print">
      <div className="flex items-center gap-4">
        <h2 className="text-xl font-bold tracking-tight text-white">{title}</h2>
        {isMock && (
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BadgeAlert className="w-3.5 h-3.5" />
            Offline Demo Mode
          </span>
        )}
      </div>

      {/* Live Metal Rates Ticker (Apple Style) */}
      <div className="hidden lg:flex items-center gap-6 bg-white/[0.01] border border-white/[0.06] rounded-2xl px-5 py-2.5 shadow-sm">
        <div className="flex items-center gap-1 text-[10px] text-[#0071e3] font-bold uppercase tracking-widest border-r border-white/[0.06] pr-4">
          <Sparkles className="w-3.5 h-3.5 text-[#0071e3]" />
          Live Metal Rates
        </div>
        
        <div className="flex items-center gap-5 text-xs">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium">Gold 24K</span>
            <span className="font-semibold text-slate-200">₹{rates.gold24k}/g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium">Gold 22K</span>
            <span className="font-semibold text-slate-200">₹{rates.gold22k}/g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium">Gold 18K</span>
            <span className="font-semibold text-slate-200">₹{rates.gold18k}/g</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-medium">Silver</span>
            <span className="font-semibold text-slate-200">₹{rates.silver}/g</span>
          </div>
        </div>
      </div>

      {/* Calendar Date Display */}
      <div className="flex items-center gap-2.5 text-slate-400 text-xs font-medium">
        <Calendar className="w-4 h-4 text-[#0071e3]" />
        <span>{todayStr}</span>
      </div>
    </header>
  );
};

export default Navbar;
