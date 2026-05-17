import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';
import { Moon, Sun, Menu, X, LayoutDashboard, Store, Users, ShoppingBag, AlertCircle, UserCog, Bike, DollarSign, Settings, CheckSquare, LogOut } from 'lucide-react';
import type { RootState } from '../app/store';
import { toggleTheme } from '../features/theme/themeSlice';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const menuSections = [
    {
      label: 'Overview',
      items: [
        { id: '', label: 'Analytics', icon: LayoutDashboard },
      ]
    },
    {
      label: 'High Priority',
      items: [
        { id: 'verification', label: 'Verification Queue', icon: CheckSquare },
      ]
    },
    {
      label: 'Operations',
      items: [
        { id: 'orders', label: 'Orders & Dispatch', icon: ShoppingBag },
      ]
    },
    {
      label: 'Management',
      items: [
        { id: 'users', label: 'Users', icon: Users },
        { id: 'restaurants', label: 'Restaurants', icon: Store },
        { id: 'deliverers', label: 'Deliverers', icon: Bike },
        { id: 'vendors', label: 'Vendors', icon: UserCog },
      ]
    },
    {
      label: 'Financials',
      items: [
        { id: 'ledger', label: 'Ledger & Payouts', icon: DollarSign },
      ]
    },
    {
      label: 'Support',
      items: [
        { id: 'disputes', label: 'Dispute Resolution', icon: AlertCircle },
      ]
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-200">
      {/* Sidebar */}
      <aside
        className={`admin-sidebar ${
          sidebarOpen ? 'w-64' : 'w-0'
        } transition-all duration-300 overflow-hidden shrink-0 z-20`}
      >
        <div className="w-64">
          <div className="p-6 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center shrink-0">
                <span className="text-white text-xl font-bold">AE</span>
              </div>
              <div>
                <h1 className="text-foreground text-lg font-semibold tracking-wide">AE Eats</h1>
                <p className="text-xs text-primary uppercase tracking-wider font-semibold">Mission Control</p>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-6 overflow-y-auto h-[calc(100vh-89px)] pb-10">
            {menuSections.map((section) => (
              <div key={section.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-3 px-3 font-semibold">
                  {section.label}
                </p>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.id}
                      to={`/${item.id}`}
                      end={item.id === ''}
                      className={({ isActive }) => `w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-primary to-orange-400 text-white shadow-lg shadow-orange-500/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="admin-header px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch(toggleTheme())}
              className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              title="Toggle Theme"
            >
              {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <div className="text-right hidden sm:block">
              <p className="text-sm text-foreground font-medium">{user?.fullName || 'Super Admin'}</p>
              <p className="text-xs text-primary">admin@aeeats.com</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-orange-400 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20">
              {user?.fullName?.charAt(0)?.toUpperCase() || 'SA'}
            </div>
            <button
              onClick={() => {
                dispatch(logout());
                navigate('/login');
              }}
              className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg transition-colors ml-2"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
