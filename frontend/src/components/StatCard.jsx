import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trendColor = 'text-[#0071e3]' }) => {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group">
      {/* Background radial shine */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-tr from-white/[0.03] to-transparent rounded-full filter blur-xl group-hover:scale-150 transition-all duration-500"></div>
      
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-400 text-xs font-semibold tracking-wider uppercase">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center border border-white/[0.08] group-hover:border-[#0071e3]/45 group-hover:bg-[#0071e3]/5 transition-all duration-300">
          <Icon className="w-5 h-5 text-slate-300 group-hover:text-[#0071e3] group-hover:scale-110 transition-transform" />
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight text-white mb-1.5">{value}</span>
        {description && (
          <span className={`text-[10px] font-medium ${trendColor}`}>{description}</span>
        )}
      </div>
    </div>
  );
};

export default StatCard;
