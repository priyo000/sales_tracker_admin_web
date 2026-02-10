import { Home, Calendar, Map, Users, Package, FileText, Settings, LogOut } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

const Sidebar = () => {
    const { logout } = useAuth();

    const navItems = [
        { icon: Home, label: 'Dashboard', to: '/' },
        { icon: Calendar, label: 'Jadwal & Kunjungan', to: '/jadwal' },
        { icon: Map, label: 'Rute', to: '/rute' },
        { icon: Users, label: 'Pelanggan', to: '/pelanggan' },
        { icon: Users, label: 'Karyawan', to: '/karyawan' },
        { icon: Package, label: 'Produk', to: '/produk' },
        { icon: FileText, label: 'Pesanan', to: '/pesanan' },
        { icon: Settings, label: 'Pengaturan', to: '/pengaturan' },
    ];

    return (
        <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-slate-700">
                <h1 className="text-xl font-bold">Sales Tracker</h1>
            </div>
            
            <nav className="flex-1 space-y-1 px-2 py-4">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            cn(
                                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-slate-800 text-white"
                                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                            )
                        }
                    >
                        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            <div className="border-t border-slate-700 p-4">
                <button
                    onClick={logout}
                    className="group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium text-slate-300 hover:bg-red-900/20 hover:text-red-400"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
