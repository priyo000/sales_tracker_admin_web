import { Trash, Calendar, Target, Layers, Package, Eye } from "lucide-react";
import { PromoCampaign } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HadiahTableProps {
  rules: PromoCampaign[];
  loading: boolean;
  onDelete: (row: PromoCampaign) => void;
  onView?: (campaign: PromoCampaign) => void;
}

export const HadiahTable: React.FC<HadiahTableProps> = ({ 
  rules, 
  loading, 
  onDelete,
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
              <Package className="h-3 w-3" /> {row.items_count} Item hadiah
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "products",
      header: "Ringkasan Produk",
      cell: (row) => (
        <div className="max-w-[200px] truncate text-xs text-muted-foreground">
          {row.products_summary}
        </div>
      ),
    },
    {
        key: "pemicu",
        header: "Syarat",
        cell: (row) => (
          <div className="text-xs">
            {row.pemicu_summary}
          </div>
        ),
    },
    {
        key: "hadiah",
        header: "Hadiah",
        cell: (row) => (
          <div className="font-semibold text-primary text-xs">
            {typeof row.hadiah === 'object' ? row.hadiah?.nama_produk : String(row.hadiah || "")} ({row.qty_hadiah}x)
          </div>
        ),
    },
    {
        key: "target",
        header: "Target",
        cell: (row) => (
          row.cluster ? (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
              <Target className="h-3 w-3 mr-1" /> {row.cluster.nama_cluster}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px]">Semua Pelanggan</Badge>
          )
        ),
    },
    {
        key: "masa_berlaku",
        header: "Masa Berlaku",
        cell: (row) => (
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums opacity-80">
            <Calendar className="h-3.5 w-3.5 opacity-50" />
            <span>{row.tanggal_akhir ? new Date(row.tanggal_akhir).toLocaleDateString('id-ID') : '-'}</span>
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
      emptyMessage="Belum ada promo hadiah yang ditemukan."
    />
  );
};
