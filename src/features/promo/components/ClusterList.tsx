import React from "react";
import { Edit, Trash, Users, LayoutGrid } from "lucide-react";
import { PromoCluster } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ClusterListProps {
  clusters: PromoCluster[];
  loading: boolean;
  onEdit: (cluster: PromoCluster) => void;
  onDelete: (id: number) => void;
  onViewCustomers: (cluster: PromoCluster) => void;
}

export const ClusterList: React.FC<ClusterListProps> = ({ 
  clusters, 
  loading, 
  onEdit, 
  onDelete,
  onViewCustomers
}) => {
  const columns: ColumnDef<PromoCluster>[] = [
    {
      key: "nama_cluster",
      header: "Nama Cluster",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground uppercase tracking-tight">
            {row.nama_cluster}
          </div>
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
            ID: CID-{row.id.toString().padStart(4, '0')}
          </div>
        </div>
      ),
    },
    {
      key: "scope",
      header: "Scope & Divisi",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {row.id_divisi ? (
            <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase">
              <LayoutGrid className="h-3 w-3 mr-1" /> Divisi #{row.id_divisi}
            </Badge>
          ) : (
            <Badge variant="secondary" className="font-bold text-[10px] uppercase">
              Global Perusahaan
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "deskripsi",
      header: "Deskripsi",
      cell: (row) => (
        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
          {row.deskripsi || "—"}
        </div>
      )
    },
    {
      key: "pelanggan_assignments_count",
      header: "Jumlah Toko",
      className: "text-center",
      cell: (row) => (
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 gap-2 text-primary font-bold text-xs"
          onClick={() => onViewCustomers(row)}
        >
          <Users className="h-3.5 w-3.5" />
          {row.pelanggan_assignments_count || 0} Toko
        </Button>
      ),
    },
    {
      key: "is_aktif",
      header: "Status",
      className: "text-center",
      cell: (row) => (
        <Badge 
          variant={row.is_aktif ? "default" : "secondary"}
          className={row.is_aktif ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "opacity-50"}
        >
          {row.is_aktif ? "Aktif" : "Non-Aktif"}
        </Badge>
      ),
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
      data={clusters}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari cluster promo..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada cluster promo yang dibuat."
    />
  );
};
