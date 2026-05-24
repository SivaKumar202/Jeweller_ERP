import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';
import { 
  LayoutDashboard, 
  Gem, 
  Users, 
  Receipt, 
  ShoppingCart, 
  BarChart3, 
  Settings, 
  LogOut,
  Crown
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Billing Engine', path: '/billing', icon: Receipt },
    { name: 'Jewellery Catalog', path: '/products', icon: Gem },
    { name: 'Customer Ledger', path: '/customers', icon: Users },
    { name: 'Procurements', path: '/purchases', icon: ShoppingCart },
    { name: 'Financial Reports', path: '/reports', icon: BarChart3 },
  ];

  if (isAdmin) {
    menuItems.push({ name: 'System Settings', path: '/settings', icon: Settings });
  }

  return (
    <aside className="w-64 glass-panel h-screen fixed left-0 top-0 flex flex-col justify-between border-r border-white/[0.06] z-30">
      <div>
        {/* Brand / Logo */}
        <div className="p-6 border-b border-white/[0.06] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-neutral-800 to-black flex items-center justify-center border border-white/10 shadow-lg shadow-black/40">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight leading-none">SWARNA ERP</h1>
            <span className="text-[10px] text-[#0071e3] font-bold tracking-wider uppercase">Jewelry ERP Lite</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.01]">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest leading-none mb-1">Active Staff</p>
          <p className="font-medium text-slate-200 text-sm truncate">{user?.name || 'Shop Representative'}</p>
          <span className="inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/10 text-white border border-white/15 capitalize">
            {user?.role || 'Staff'}
          </span>
        </div>

        {/* Menu Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-white/[0.07] text-white border-l-[3px] border-[#0071e3] shadow-sm'
                    : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-white/[0.06]">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-xl transition-all duration-250 cursor-pointer"
        >
          <LogOut className="w-4.5 h-4.5" />
          Log Out Desk
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
