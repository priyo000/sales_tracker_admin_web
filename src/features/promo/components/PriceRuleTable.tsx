import { Trash, Calendar, Target, Layers, Package, Eye } from "lucide-react";
import { PromoCampaign } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PriceRuleTableProps {
  rules: PromoCampaign[];
  loading: boolean;
  onDelete: (row: PromoCampaign) => void;
  onGrosirToggle?: () => void;
  onView?: (campaign: PromoCampaign) => void;
}

export const PriceRuleTable: React.FC<PriceRuleTableProps> = ({ 
  rules, 
  loading, 
  onDelete,
  onGrosirToggle,
  onView,
}) => {
  const batchColumns: ColumnDef<PromoCampaign>[] = [
    {
      key: "nama_promo",
      header: "Nama Promo / Batch",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-foreground capitalize">
              {row.nama_promo}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> {row.items_count} Produk terpilih
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "products",
      header: "Daftar Produk",
      cell: (row) => (
        <div className="max-w-[250px] truncate text-xs text-muted-foreground">
          {row.products_summary}
        </div>
      ),
    },
    {
        key: "target",
        header: "Target Scope",
        cell: (row) => (
          <div className="flex flex-col gap-1">
            {row.cluster ? (
              <Badge variant="outline" className="w-fit bg-primary/5 text-primary border-primary/20 font-medium text-xs">
                <Target className="h-3 w-3 mr-1" /> {row.cluster.nama_cluster}
              </Badge>
            ) : (
              <Badge variant="outline" className="w-fit bg-emerald-500/5 text-emerald-600 border-emerald-200 font-medium text-xs">
                Semua Pelanggan
              </Badge>
            )}
          </div>
        ),
    },
    {
        key: "masa_berlaku",
        header: "Masa Berlaku",
        cell: (row) => (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums">
            <Calendar className="h-3.5 w-3.5 opacity-50" />
            <span>{new Date(row.tanggal_mulai).toLocaleDateString('id-ID')}</span>
            <span className="opacity-30">-</span>
            <span>{new Date(row.tanggal_akhir).toLocaleDateString('id-ID')}</span>
          </div>
        ),
    },
    {
      key: "status",
      header: "Status",
      className: "text-center",
      cell: (row) => {
        const isExpired = new Date(row.tanggal_akhir) < new Date();
        return (
          <Badge 
            variant={isExpired ? "destructive" : "default"}
            className={!isExpired ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-red-500/10 text-red-600 border-red-200"}
          >
            {isExpired ? "Expired" : "Aktif"}
          </Badge>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {onView && (
             <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onView(row)}>
                <Eye className="h-4 w-4" />
             </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(row)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={rules}
      columns={batchColumns}
      loading={loading}
      searchPlaceholder="Cari nama promo..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada aturan harga promo yang ditemukan."
      toolbar={
        <div className="flex p-1 bg-muted rounded-lg w-fit border border-border/50">
           <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold bg-background shadow-sm">
              Harga & Diskon
           </Button>
           <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={onGrosirToggle}>
              Grosir/Tiering
           </Button>
        </div>
      }
    />
  );
};
