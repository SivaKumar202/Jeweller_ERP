import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import StatCard from '../components/StatCard.jsx';
import axios from 'axios';
import { 
  TrendingUp, 
  ShoppingBag, 
  CircleDollarSign, 
  Percent, 
  Calendar, 
  Briefcase, 
  Coins, 
  CreditCard, 
  Smartphone, 
  Sparkles,
  BookOpen
} from 'lucide-react';

const Reports = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [reportsData, setReportsData] = useState({
    sales: { total: 420000, taxable: 407760, gst: 12240, list: [] },
    purchases: { total: 180000, list: [] },
    dues: { total: 57500, list: [] },
    cashbook: [
      { _id: 'cb-1', type: 'sales_payment', amount: 84460, method: 'cash', notes: 'Invoice INV-20260520-0001 downpayment', paymentDate: new Date().toISOString() },
      { _id: 'cb-2', type: 'sales_payment', amount: 12500, method: 'upi', notes: 'Invoice balance settlement', paymentDate: new Date().toISOString() },
      { _id: 'cb-3', type: 'purchase_payment', amount: 20000, method: 'cash', notes: 'Initial supplier downpayment', paymentDate: new Date().toISOString() }
    ],
    profitSummary: { grossProfit: 227760, marginPercent: 55.8 }
  });

  const fetchDetailedReports = async () => {
    try {
      const response = await axios.get('/api/reports/detailed', {
        params: { startDate, endDate }
      });
      if (response.data?.success) {
        setReportsData(response.data.data);
      }
    } catch (err) {
      console.warn('Backend reporting API offline, using local simulated transaction logs.');
    }
  };

  useEffect(() => {
    fetchDetailedReports();
  }, [startDate, endDate]);

  const [activeTab, setActiveTab] = useState('summary');

  return (
    <div className="min-h-screen bg-royal-950 pb-12">
      <Navbar title="Financial Reports Desk" />

      <main className="max-w-7xl mx-auto px-8 mt-8 space-y-6">
        
        {/* Date Filter Panel */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-royal-900/30 p-4 border border-royal-800/40 rounded-2xl">
          <div className="flex items-center gap-2.5 text-xs text-slate-400 font-medium">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span>Select Ledger Audit Duration</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-royal-950/60 border border-royal-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-royal-950/60 border border-royal-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-gold-500"
              />
            </div>
          </div>
        </div>

        {/* Dynamic Metric cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Interval Billed Sales"
            value={`₹${reportsData.sales.total.toLocaleString('en-IN')}`}
            icon={TrendingUp}
            description={`Taxable: ₹${reportsData.sales.taxable.toLocaleString('en-IN')} | GST: ₹${reportsData.sales.gst.toLocaleString('en-IN')}`}
            trendColor="text-emerald-400"
          />
          <StatCard
            title="Interval Procurements"
            value={`₹${reportsData.purchases.total.toLocaleString('en-IN')}`}
            icon={ShoppingBag}
            description="Acquisitions from registered suppliers"
            trendColor="text-rose-400"
          />
          <StatCard
            title="Outstanding Ledger Dues"
            value={`₹${reportsData.dues.total.toLocaleString('en-IN')}`}
            icon={CircleDollarSign}
            description="Total outstanding balance across accounts"
            trendColor="text-amber-500"
          />
          <StatCard
            title="Simulated Net Margin"
            value={`₹${reportsData.profitSummary.grossProfit.toLocaleString('en-IN')}`}
            icon={Percent}
            description={`Average profit index: ${reportsData.profitSummary.marginPercent}%`}
            trendColor="text-blue-400"
          />
        </div>

        {/* Audit Tabs */}
        <div className="border-b border-royal-800/80 flex gap-6">
          {[
            { id: 'summary', name: 'Margin & Profitability', icon: Briefcase },
            { id: 'cashbook', name: 'Daily Cash Book', icon: BookOpen },
            { id: 'ledger', name: 'Outstanding Balances', icon: CircleDollarSign },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`py-3 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                activeTab === t.id
                  ? 'border-gold-500 text-gold-400'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.name}
            </button>
          ))}
        </div>

        {/* Tab content panels */}
        <div className="glass-panel rounded-3xl p-6 border border-royal-800">
          {activeTab === 'summary' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Profitability margin breakdown
              </h3>
              
              <div className="p-6 rounded-2xl bg-royal-950/30 border border-royal-850/80 max-w-lg space-y-4">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Interval Sales (Excluding Taxes):</span>
                  <span className="font-bold text-white">₹{reportsData.sales.taxable.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Interval Raw Stock Purchases:</span>
                  <span className="font-bold text-slate-300">− ₹{reportsData.purchases.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-royal-800/60 my-2"></div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 font-bold">Estimated Raw Gross Profit:</span>
                  <span className="font-extrabold text-gold-400">₹{reportsData.profitSummary.grossProfit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Estimated Net Margin %:</span>
                  <span className="font-bold text-emerald-400">{reportsData.profitSummary.marginPercent}%</span>
                </div>
              </div>

              {/* <div className="text-[10px] text-slate-500 leading-relaxed max-w-2xl">
                {"> [!NOTE]"
                "> Financial margin values are simulated based on itemised taxable valuations compared directly against procurement expenditures. Operative overheads, wastage adjustments and daily refining indices are subject to localized store margins."}
              </div> */}
            </div>
          )}

          {activeTab === 'cashbook' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payments ledger journal</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-royal-950/40 border-b border-royal-800 text-slate-500 uppercase text-[9px] tracking-wider">
                      <th className="py-4 px-6 font-bold">Timestamp</th>
                      <th className="py-4 px-6 font-bold">Audit Description</th>
                      <th className="py-4 px-6 font-bold">Method</th>
                      <th className="py-4 px-6 font-bold text-right">Inflow (₹)</th>
                      <th className="py-4 px-6 font-bold text-right">Outflow (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-royal-850/40">
                    {reportsData.cashbook.map((cb) => (
                      <tr key={cb._id} className="text-slate-300">
                        <td className="py-4 px-6">
                          {new Date(cb.paymentDate).toLocaleDateString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 px-6 font-semibold text-white">
                          {cb.notes || (cb.type === 'sales_payment' ? 'Customer Account payment' : 'Supplier stock settlement')}
                        </td>
                        <td className="py-4 px-6">
                          <span className="flex items-center gap-1.5 capitalize font-medium">
                            {cb.method === 'cash' && <Coins className="w-3.5 h-3.5 text-amber-500" />}
                            {cb.method === 'card' && <CreditCard className="w-3.5 h-3.5 text-blue-400" />}
                            {cb.method === 'upi' && <Smartphone className="w-3.5 h-3.5 text-emerald-400" />}
                            {cb.method}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-emerald-400">
                          {cb.type === 'sales_payment' ? `₹${cb.amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="py-4 px-6 text-right font-bold text-rose-400">
                          {cb.type === 'purchase_payment' ? `₹${cb.amount.toLocaleString('en-IN')}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'ledger' && (
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Outstanding Client accounts ledger</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-royal-950/40 border-b border-royal-800 text-slate-500 uppercase text-[9px] tracking-wider">
                      <th className="py-4 px-6 font-bold">Client Name</th>
                      <th className="py-4 px-6 font-bold">Representative Phone</th>
                      <th className="py-4 px-6 font-bold">Billed GSTIN</th>
                      <th className="py-4 px-6 font-bold text-right">Outstanding Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-royal-850/40">
                    {reportsData.dues.list?.length === 0 ? (
                      <tr>
                        <td colSpan="4" className="py-8 text-center text-slate-500">
                          All client ledgers are fully cleared! No outstanding balances.
                        </td>
                      </tr>
                    ) : (
                      reportsData.dues.list?.map((d) => (
                        <tr key={d._id} className="text-slate-300">
                          <td className="py-4 px-6 font-semibold text-white">{d.name}</td>
                          <td className="py-4 px-6">+91 {d.phone}</td>
                          <td className="py-4 px-6 font-mono">{d.gstNumber || 'Unregistered'}</td>
                          <td className="py-4 px-6 text-right font-bold text-rose-400">₹{d.pendingAmount.toLocaleString('en-IN')}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default Reports;
