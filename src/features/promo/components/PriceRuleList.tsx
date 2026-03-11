import React from "react";
import { Edit, Trash, Calendar, Target } from "lucide-react";
import { PromoAturanHarga } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

interface PriceRuleListProps {
  rules: PromoAturanHarga[];
  loading: boolean;
  onEdit: (rule: PromoAturanHarga) => void;
  onDelete: (id: number) => void;
  onGrosirToggle?: () => void;
}

export const PriceRuleList: React.FC<PriceRuleListProps> = ({ 
  rules, 
  loading, 
  onEdit, 
  onDelete,
  onGrosirToggle
}) => {
  const columns: ColumnDef<PromoAturanHarga>[] = [
    {
      key: "produk.nama_produk",
      header: "Produk",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-1 px-2 bg-muted rounded font-black text-[10px] text-muted-foreground uppercase">
            SKU
          </div>
          <div>
            <div className="font-bold text-foreground uppercase tracking-tight leading-none mb-1">
              {row.produk?.nama_produk || "Produk Unknown"}
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold tabular-nums">
              {row.produk?.sku}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "target",
      header: "Target Scope",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          {row.cluster ? (
            <Badge variant="outline" className="w-fit bg-blue-500/5 text-blue-600 border-blue-200 font-bold text-[9px] uppercase">
              <Target className="h-2.5 w-2.5 mr-1" /> Cluster: {row.cluster.nama_cluster}
            </Badge>
          ) : (
            <Badge variant="outline" className="w-fit bg-emerald-500/5 text-emerald-600 border-emerald-200 font-bold text-[9px] uppercase">
              Semua Pelanggan
            </Badge>
          )}
          {row.id_divisi && (
            <span className="text-[9px] font-bold text-muted-foreground opacity-60 ml-1 uppercase">
              {row.divisi?.nama_divisi || `Divisi #${row.id_divisi}`}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "aturan",
      header: "Aturan Promo",
      cell: (row) => (
        <div>
          {row.harga_manual ? (
            <div className="flex flex-col">
              <span className="font-bold text-primary text-sm tracking-tight">
                {formatCurrency(parseFloat(row.harga_manual))}
              </span>
              <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">Fixed Pricing</span>
            </div>
          ) : (
            <div className="flex flex-col">
              <span className="font-bold text-orange-600 text-sm tracking-tight">
                Potongan {row.diskon_persen}%
              </span>
              <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">Discount Rule</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "tanggal_akhir",
      header: "Masa Berlaku",
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tabular-nums">
          <Calendar className="h-3.5 w-3.5 opacity-50" />
          <span>{new Date(row.tanggal_mulai).toLocaleDateString('id-ID')}</span>
          <span className="opacity-30">/</span>
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
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete(row.id)}
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
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari produk atau SKU..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada aturan harga promo yang ditemukan."
      toolbar={
        <div className="flex gap-2">
           <Button variant="secondary" size="sm" className="h-9 px-4 font-bold text-[10px] uppercase shadow-sm border border-border/50 bg-background text-foreground">
              Harga & Diskon
           </Button>
           <Button variant="ghost" size="sm" className="h-9 px-4 font-bold text-[10px] uppercase opacity-40 hover:opacity-100" onClick={onGrosirToggle}>
              Grosir/Tiering
           </Button>
        </div>
      }
    />
  );
};
