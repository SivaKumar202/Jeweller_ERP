import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import { useRateStore } from '../store/rateStore.js';
import { useCustomerStore } from '../store/customerStore.js';
import { useProductStore } from '../store/productStore.js';
import { useBillingStore } from '../store/billingStore.js';
import { usePurchaseStore } from '../store/purchaseStore.js';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  Coins, 
  CoinsIcon, 
  DollarSign, 
  CircleDollarSign,
  PlusCircle, 
  UserPlus, 
  FileText,
  Percent,
  TrendingDown
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const { rates } = useRateStore();
  
  // Dashboard states
  const [stats, setStats] = useState({
    todaySales: 245000,
    todayPurchases: 180000,
    totalCustomers: 3,
    pendingPayments: 57500,
    salesChart: [
      { date: '18 May', sales: 120000 },
      { date: '19 May', sales: 95000 },
      { date: '20 May', sales: 185000 },
      { date: '21 May', sales: 240000 },
      { date: '22 May', sales: 160000 },
      { date: '23 May', sales: 310000 },
      { date: '24 May', sales: 245000 },
    ],
  });

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      if (response.data?.success) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.warn('Backend reporting API offline, using premium preset dashboard metrics.');
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Shop Operations Dashboard" />
      
      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-8">
        
        {/* Core Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Total Sales"
            value={`₹${stats.todaySales.toLocaleString('en-IN')}`}
            icon={TrendingUp}
            description="Fresh invoice billing values"
            trendColor="text-emerald-400"
          />
          <StatCard
            title="Today's Procurements"
            value={`₹${stats.todayPurchases.toLocaleString('en-IN')}`}
            icon={ShoppingBag}
            description="Supplier stock acquisitions"
            trendColor="text-rose-400"
          />
          <StatCard
            title="Active Ledger Clients"
            value={stats.totalCustomers.toString()}
            icon={Users}
            description="Total registered shop patrons"
            trendColor="text-blue-400"
          />
          <StatCard
            title="Outstanding Customer Dues"
            value={`₹${stats.pendingPayments.toLocaleString('en-IN')}`}
            icon={CircleDollarSign}
            description="Outstanding ledger balances"
            trendColor="text-amber-500"
          />
        </div>

        {/* Dynamic Metal Spot Prices */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-royal-900/30 border border-royal-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gold 24K Rate</span>
              <span className="text-base font-bold text-white">₹{rates.gold24k}/g</span>
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">+1.2%</div>
          </div>
          <div className="bg-royal-900/30 border border-royal-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gold 22K Rate</span>
              <span className="text-base font-bold text-white">₹{rates.gold22k}/g</span>
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">+1.2%</div>
          </div>
          <div className="bg-royal-900/30 border border-royal-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Gold 18K Rate</span>
              <span className="text-base font-bold text-white">₹{rates.gold18k}/g</span>
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold">+0.8%</div>
          </div>
          <div className="bg-royal-900/30 border border-royal-800/40 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Silver Rate</span>
              <span className="text-base font-bold text-white">₹{rates.silver}/g</span>
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-semibold">−0.4%</div>
          </div>
          <div className="bg-royal-900/30 border border-royal-800/40 rounded-2xl p-4 flex items-center justify-between col-span-1">
            <div>
              <span className="text-[10px] text-slate-500 font-semibold block uppercase">Platinum Rate</span>
              <span className="text-base font-bold text-white">₹{rates.platinum}/g</span>
            </div>
            <div className="text-[10px] px-2 py-0.5 rounded-md bg-slate-500/10 text-slate-400 font-semibold">0.0%</div>
          </div>
        </div>

        {/* Chart + Quick Actions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sales chart */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-white/[0.06]">
            <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Sales Revenue Trend (Last 7 Days)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesChart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0071e3" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="#86868b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#86868b" fontSize={10} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#161617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#0071e3', fontWeight: 'bold' }}
                    itemStyle={{ color: '#ffffff' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#0071e3" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick actions panel */}
          <div className="glass-panel rounded-3xl p-6 border border-royal-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider">Fast desk actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => navigate('/billing')}
                  className="p-4 rounded-2xl bg-royal-800/40 border border-royal-800 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left flex flex-col justify-between h-28 cursor-pointer group"
                >
                  <FileText className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Generate GST Bill</span>
                </button>
                <button
                  onClick={() => navigate('/products')}
                  className="p-4 rounded-2xl bg-royal-800/40 border border-royal-800 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left flex flex-col justify-between h-28 cursor-pointer group"
                >
                  <PlusCircle className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Catalog Jewellery</span>
                </button>
                <button
                  onClick={() => navigate('/customers')}
                  className="p-4 rounded-2xl bg-royal-800/40 border border-royal-800 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left flex flex-col justify-between h-28 cursor-pointer group"
                >
                  <UserPlus className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Add Customer Ledger</span>
                </button>
                <button
                  onClick={() => navigate('/settings')}
                  className="p-4 rounded-2xl bg-royal-800/40 border border-royal-800 hover:border-gold-500/50 hover:bg-gold-500/5 transition-all text-left flex flex-col justify-between h-28 cursor-pointer group"
                >
                  <CoinsIcon className="w-6 h-6 text-gold-500 group-hover:scale-110 transition-transform" />
                  <span className="font-semibold text-xs text-slate-200">Update Metal Price</span>
                </button>
              </div>
            </div>
            
            {/* <div className="mt-6 p-4 rounded-2xl bg-royal-950/40 border border-royal-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span>Connected Branch:</span>
              <span className="font-bold text-gold-400">Bengaluru Main Desk</span>
            </div> */}
          </div>
          
        </div>

      </main>
    </div>
  );
};

export default Dashboard;
