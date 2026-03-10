import {
  Home,
  Calendar,
  Map,
  MapPin,
  Users,
  Package,
  FileText,
  LogOut,
  LayoutGrid,
  Building2,
  UserCog,
  Bell,
  ChevronRight,
  ChevronLeft,
  TrendingUp,
  Smartphone,
} from "lucide-react";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ElementType;
  label: string;
  to: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const Sidebar = () => {
  const { logout, user } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar-collapsed");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  const navGroups: NavGroup[] = [
    {
      label: "Utama",
      items: [
        { icon: Home, label: "Dashboard", to: "/" },
        { icon: Bell, label: "Notifikasi", to: "/notifikasi" },
      ],
    },
    {
      label: "Operasional",
      items: [
        { icon: Calendar, label: "Jadwal Sales", to: "/jadwal" },
        { icon: MapPin, label: "Monitoring Kunjungan", to: "/kunjungan" },
        { icon: FileText, label: "Informasi Kunjungan", to: "/informasi-kunjungan" },
        { icon: Map, label: "Rute", to: "/rute" },
      ],
    },
    {
      label: "Data",
      items: [
        { icon: Users, label: "Pelanggan", to: "/pelanggan" },
        { icon: Package, label: "Produk", to: "/produk" },
        { icon: FileText, label: "Pesanan", to: "/pesanan" },
      ],
    },
    {
      label: "Manajemen",
      items: [
        { icon: Users, label: "Karyawan", to: "/karyawan" },
        { icon: LayoutGrid, label: "Divisi", to: "/divisi" },
        { icon: UserCog, label: "Pengguna", to: "/users" },
        ...(user?.peran === "super_admin"
          ? [
              { icon: Building2, label: "Perusahaan", to: "/perusahaan" },
              { icon: Smartphone, label: "Update App", to: "/app-update" },
            ]
          : []),
      ],
    },
  ].filter((g) => g.items.length > 0);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out border-r border-sidebar-border relative",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-50 h-6 w-6 items-center justify-center rounded-full border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-md hover:bg-sidebar-accent transition-colors hidden md:flex"
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </button>

      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4 overflow-hidden shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30 shrink-0">
          <TrendingUp className="h-4 w-4 text-white" />
        </div>
        {!isCollapsed && (
          <div className="opacity-100 transition-opacity duration-300 whitespace-nowrap">
            <h1 className="text-sm font-bold leading-none text-foreground">
              Sales Tracker
            </h1>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Admin Panel
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {navGroups.map((group, gi) => (
          <div key={gi} className="space-y-2">
            {!isCollapsed ? (
              <p className="px-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40 transition-opacity">
                {group.label}
              </p>
            ) : (
              <div className="h-px bg-sidebar-border mx-2 opacity-50" />
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/"}
                  title={isCollapsed ? item.label : ""}
                  className={({ isActive }) =>
                    cn(
                      "group flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-all duration-200 border border-transparent",
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/20 border-primary/10"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground hover:border-sidebar-border/50",
                      isCollapsed && "justify-center px-0",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={cn(
                          "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          isActive
                            ? "text-white"
                            : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground",
                        )}
                      />
                      {!isCollapsed && (
                        <span className="truncate flex-1">{item.label}</span>
                      )}
                      {isActive && !isCollapsed && (
                        <div className="h-1 w-1 rounded-full bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-sidebar-border p-3 shrink-0">
        <button
          onClick={logout}
          title={isCollapsed ? "Keluar" : ""}
          className={cn(
            "group flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-sidebar-foreground/60 transition-all hover:bg-red-500/10 hover:text-red-500",
            isCollapsed && "justify-center",
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Keluar</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
