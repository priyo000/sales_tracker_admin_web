import React from "react";
import { Perusahaan } from "../types";
import { Edit, Trash, Building2, Mail, Phone } from "lucide-react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PerusahaanTableProps {
  data: Perusahaan[];
  loading: boolean;
  onEdit: (item: Perusahaan) => void;
  onDelete: (id: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

const PerusahaanTable: React.FC<PerusahaanTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  toolbar,
  onSearchChange,
  pagination,
  onPageChange,
  onPerPageChange,
}) => {
  const columns: ColumnDef<Perusahaan>[] = [
    {
      key: "nama_perusahaan",
      header: "Perusahaan",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-sm text-foreground">
              {row.nama_perusahaan}
            </div>
            <div
              className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]"
              title={row.alamat ?? undefined}
            >
              {row.alamat || "Tidak ada alamat"}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email_kontak",
      header: "Kontak",
      sortable: true,
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center text-xs text-muted-foreground">
            <Mail className="mr-1.5 h-3 w-3" />
            {row.email_kontak || "—"}
          </div>
          <div className="flex items-center text-xs text-muted-foreground">
            <Phone className="mr-1.5 h-3 w-3" />
            {row.no_telp || "—"}
          </div>
        </div>
      ),
    },
    {
      key: "status_langganan",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge
          variant={row.status_langganan === "aktif" ? "success" : "destructive"}
          className="capitalize"
        >
          {row.status_langganan}
        </Badge>
      ),
    },
    {
      key: "tanggal_bergabung",
      header: "Tgl Bergabung",
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.tanggal_bergabung
            ? new Date(row.tanggal_bergabung).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "—"}
        </span>
      ),
    },
    {
      key: "id",
      header: "",
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
      data={data}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari nama perusahaan..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada data perusahaan"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
      serverPagination={
        pagination
          ? {
              currentPage: pagination.currentPage,
              lastPage: pagination.lastPage,
              total: pagination.total,
              perPage: pagination.perPage,
              onPageChange: onPageChange || (() => {}),
              onPerPageChange: onPerPageChange,
            }
          : undefined
      }
    />
  );
};

export default PerusahaanTable;
