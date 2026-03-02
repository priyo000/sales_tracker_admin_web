import { MonitoringEmployee } from "../types";
import { cn } from "@/lib/utils";
import { BadgeCheck, MapPin, AlertTriangle } from "lucide-react";

interface EmployeeCardProps {
  data: MonitoringEmployee;
  isSelected: boolean;
  onClick: () => void;
}

export const EmployeeCard = ({
  data,
  isSelected,
  onClick,
}: EmployeeCardProps) => {
  const { karyawan, stats, color } = data;

  const formatIDR = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "group cursor-pointer rounded-xl border p-4 transition-all duration-200",
        isSelected
          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary/20"
          : "bg-card border-border hover:border-primary/30 hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <div
          className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ring-2 ring-background shrink-0"
          style={{ backgroundColor: color }}
        >
          {karyawan.nama_lengkap.substring(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-foreground text-sm truncate">
            {karyawan.nama_lengkap}
          </h3>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
            {karyawan.kode_karyawan}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[10px]">
        {/* Planned */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground font-medium uppercase tracking-tight">
            <MapPin className="h-3 w-3 text-blue-500" />
            Terencana
          </div>
          <span className="font-bold text-foreground text-xs leading-none">
            {stats.planned_visited}{" "}
            <span className="text-muted-foreground font-normal">
              / {stats.planned_total}
            </span>
          </span>
        </div>

        {/* Unplanned */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground font-medium uppercase tracking-tight">
            <div className="h-2 w-2 rounded-full bg-orange-500" />
            Unplanned
          </div>
          <span className="font-bold text-foreground text-xs leading-none">
            {stats.unplanned}
          </span>
        </div>

        {/* With Order */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground font-medium uppercase tracking-tight">
            <BadgeCheck className="h-3 w-3 text-green-500" />
            Dgn Order
          </div>
          <span className="font-bold text-foreground text-xs leading-none">
            {stats.with_order}
          </span>
        </div>

        {/* Out of Range */}
        <div className="flex flex-col gap-1 p-2 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-center gap-1 text-muted-foreground font-medium uppercase tracking-tight">
            <AlertTriangle
              className={cn(
                "h-3 w-3",
                stats.out_of_range > 0
                  ? "text-destructive"
                  : "text-muted-foreground/50",
              )}
            />
            Luar Area
          </div>
          <span
            className={cn(
              "font-bold text-xs leading-none",
              stats.out_of_range > 0 ? "text-destructive" : "text-foreground",
            )}
          >
            {stats.out_of_range}
          </span>
        </div>
      </div>

      {/* Sales Total */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          Sales Order
        </span>
        <span className="text-sm font-bold text-green-600 dark:text-green-500">
          {formatIDR(stats.sales_total)}
        </span>
      </div>
    </div>
  );
};
