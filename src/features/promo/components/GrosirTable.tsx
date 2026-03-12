import { Trash, Calendar, Package, Layers, Eye } from "lucide-react";
import { PromoCampaign } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface GrosirTableProps {
  rules: PromoCampaign[];
  loading: boolean;
  onDelete: (row: PromoCampaign) => void;
  onPriceToggle?: () => void;
  onView?: (campaign: PromoCampaign) => void;
}

export const GrosirTable: React.FC<GrosirTableProps> = ({ 
  rules, 
  loading, 
  onDelete,
  onPriceToggle,
  onView,
}) => {
  const batchColumns: ColumnDef<PromoCampaign>[] = [
    {
      key: "nama_promo",
      header: "Nama Promo / Batch",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-foreground capitalize">
              {row.nama_promo}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Package className="h-3 w-3 text-orange-400" /> 
              <span className="font-semibold text-orange-700/80 bg-orange-50 px-1.5 rounded">{row.items_count} Produk terpilih</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "products_summary",
      header: "Daftar Produk",
      cell: (row) => (
        <div className="max-w-[250px] truncate text-[11px] font-medium text-muted-foreground leading-relaxed">
          {row.products_summary}
        </div>
      ),
    },
    {
        key: "min_qty",
        header: "Ketentuan",
        cell: (row) => (
          <div className="text-xs font-bold text-foreground bg-muted/50 px-2 py-1 rounded w-fit">
            {row.is_multi_tier 
              ? "Multi-tier" 
              : `Min. ${row.min_qty} PCS`}
          </div>
        ),
    },
    {
        key: "benefit",
        header: "Potongan",
        cell: (row) => (
            <div className="text-xs font-bold text-orange-600">
                {row.is_multi_tier ? (
                    <span className="bg-orange-50 px-2 py-1 rounded border border-orange-100 italic font-bold">Bervariasi</span>
                ) : (
                    row.harga_spesial ? formatCurrency(parseFloat(row.harga_spesial)) : `${row.diskon_persen}%`
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
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(row)}>
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
      emptyMessage="Belum ada aturan harga grosir yang aktif."
      toolbar={
        <div className="flex p-1 bg-muted rounded-lg w-fit border border-border/50">
           <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold text-muted-foreground hover:text-foreground" onClick={onPriceToggle}>
              Harga & Diskon
           </Button>
           <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-semibold bg-background shadow-sm">
              Grosir/Tiering
           </Button>
        </div>
      }
    />
  );
};
