import {
  Home,
  Calendar,
  Map,
  MapPin,
  Users,
  Package,
  FileText,
  LogOut,
  Layout,
  Building2,
  UserPlus,
  Bell,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-purple-100 text-purple-700" },
  admin_perusahaan: {
    label: "Admin Perusahaan",
    color: "bg-indigo-100 text-indigo-700",
  },
  admin_divisi: { label: "Admin Divisi", color: "bg-sky-100 text-sky-700" },
  sales: { label: "Sales", color: "bg-green-100 text-green-700" },
};

const Sidebar = () => {
  const { logout, user } = useAuth();
  const roleInfo = ROLE_LABELS[user?.peran ?? ""] ?? {
    label: user?.peran ?? "",
    color: "bg-slate-100 text-slate-600",
  };

  const navItems = [
    { icon: Home, label: "Dashboard", to: "/" },
    ...(user?.peran === "super_admin"
      ? [{ icon: Building2, label: "Perusahaan", to: "/perusahaan" }]
      : []),
    { icon: Calendar, label: "Jadwal Sales", to: "/jadwal" },
    { icon: MapPin, label: "Monitoring Kunjungan", to: "/kunjungan" },
    { icon: Map, label: "Rute", to: "/rute" },
    { icon: Users, label: "Pelanggan", to: "/pelanggan" },
    { icon: Users, label: "Karyawan", to: "/karyawan" },
    { icon: Layout, label: "Divisi", to: "/divisi" },
    { icon: UserPlus, label: "Pengguna", to: "/users" },
    { icon: Package, label: "Produk", to: "/produk" },
    { icon: FileText, label: "Pesanan", to: "/pesanan" },
    { icon: Bell, label: "Notifikasi", to: "/notifikasi" },
    { icon: Settings, label: "Pengaturan", to: "/pengaturan" },
  ];

  return (
    <div className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="flex h-16 flex-col items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">Sales Tracker</h1>
        <div
          className={cn(
            "mt-1 text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
            roleInfo.color,
          )}
        >
          {roleInfo.label}
        </div>
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
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <item.icon className="mr-3 h-5 w-5 shrink-0" />
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
