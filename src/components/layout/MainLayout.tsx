import Sidebar from "./Sidebar";
import { useAuth } from "@/hooks/useAuth";
import { usePerusahaan } from "@/features/perusahaan/hooks/usePerusahaan";
import { useEffect } from "react";
import { Building2, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLocation } from "react-router-dom";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MainLayoutProps {
  children: React.ReactNode;
}

const ROLE_STYLE: Record<string, string> = {
  super_admin:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  admin_perusahaan: "bg-primary/10 text-primary",
  admin_divisi: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
  sales: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  manager: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  gudang: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
};

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, switchCompany } = useAuth();
  const { perusahaans, fetchPerusahaans } = usePerusahaan();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isMonitoringPage = location.pathname === "/kunjungan";

  useEffect(() => {
    if (user?.peran === "super_admin") {
      fetchPerusahaans();
    }
  }, [user, fetchPerusahaans]);

  return (
    <div className="flex h-screen bg-muted/30">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex h-14 items-center border-b bg-background px-6 shadow-sm justify-between shrink-0 gap-4">
          {/* Left: Company Info / Switcher */}
          <div className="flex items-center gap-2 min-w-0">
            {user?.peran === "super_admin" ? (
              /* ShadCN Select untuk company switcher */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest whitespace-nowrap opacity-70">
                  <Building2 className="h-3 w-3 text-primary shrink-0" />
                  Manajemen:
                </div>
                <Select
                  value={String(user.id_perusahaan)}
                  onValueChange={(val) => switchCompany(Number(val))}
                >
                  <SelectTrigger
                    size="sm"
                    className="h-8 min-w-[180px] max-w-[280px] border-primary/20 bg-primary/5 font-bold text-foreground hover:bg-primary/10 transition-all focus:ring-primary shadow-sm rounded-lg"
                  >
                    <SelectValue placeholder="Pilih perusahaan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {perusahaans.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={String(p.id)}
                        className="text-sm"
                      >
                        {p.nama_perusahaan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground truncate">
                  {user?.perusahaan?.nama_perusahaan || "Sales Tracker"}
                </span>
              </div>
            )}
          </div>

          {/* Right: Theme Toggle + User */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={toggleTheme}
              title={
                theme === "dark"
                  ? "Switch to Light Mode"
                  : "Switch to Dark Mode"
              }
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* User Info */}
            <div className="flex items-center gap-2.5">
              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-foreground leading-none">
                  {user?.username}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-0.5",
                    ROLE_STYLE[user?.peran ?? ""] ??
                      "bg-muted text-muted-foreground",
                  )}
                >
                  {user?.peran?.replace(/_/g, " ")}
                </span>
              </div>
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shadow-sm shadow-primary/30 shrink-0">
                {user?.username?.[0]?.toUpperCase() ?? "U"}
              </div>
            </div>
          </div>
        </header>

        <main
          className={cn(
            "flex-1",
            isMonitoringPage ? "p-0 overflow-hidden" : "overflow-y-auto p-6",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
