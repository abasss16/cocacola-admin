import { LayoutDashboard, ShoppingBag, ClipboardList, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SidebarProps {
  activeTab: 'dashboard' | 'products' | 'orders';
  setActiveTab: (tab: 'dashboard' | 'products' | 'orders') => void;
  onLogout: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userEmail?: string;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  setIsOpen,
  userEmail,
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as const, label: 'Products', icon: ShoppingBag },
    { id: 'orders' as const, label: 'Orders', icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile Burger / Header bar */}
      <div id="mobile-nav-header" className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-[#E60028]">
            <span className="font-serif font-black text-xs tracking-wider italic">Coke</span>
          </div>
          <span className="font-sans font-bold text-gray-800 text-lg">Catalog Studio</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#E60028]"
          aria-label="Toggle navigation menu"
          id="mobile-burger-toggle"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-xs z-40 md:hidden"
            id="sidebar-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Sidebar container */}
      <div
        id="app-sidebar"
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-transform duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:sticky md:top-0 md:h-screen shrink-0`}
      >
        <div className="p-6">
          {/* Logo element */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#E60028] shadow-xs">
              <span className="font-serif font-black text-sm tracking-wider italic">Coke</span>
            </div>
            <div>
              <span className="font-sans font-extrabold text-gray-900 tracking-tight block text-lg">
                Coca-Cola
              </span>
              <span className="font-sans font-semibold text-xs text-gray-400 uppercase tracking-widest block -mt-1">
                Catalog Admin
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5" id="sidebar-nav">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all focus:outline-none cursor-pointer
                    ${
                      isActive
                        ? 'bg-gray-50 text-[#E60028]'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/70'
                    }`}
                >
                  {isActive && <span className="w-1.5 h-5 bg-[#E60028] absolute left-0 rounded-r-md"></span>}
                  <Icon className={`w-5 h-5 ${isActive ? 'text-[#E60028]' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer / User panel */}
        <div className="p-6 border-t border-gray-100">
          {userEmail && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-gray-50/80 rounded-xl" id="sidebar-user-panel">
              <div className="w-8 h-8 rounded-full bg-[#E60028]/10 text-[#E60028] flex items-center justify-center font-bold text-xs shrink-0 font-mono">
                {userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate font-mono">
                  {userEmail}
                </p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                  Active Admin
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onLogout}
            id="sidebar-logout-button"
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-[#E60028] hover:bg-red-50/40 rounded-xl font-medium text-sm transition-all focus:outline-none cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </>
  );
}
