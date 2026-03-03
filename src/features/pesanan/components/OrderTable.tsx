import React from "react";
import { Eye, Clock } from "lucide-react";
import { Pesanan } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OrderTableProps {
  data: Pesanan[];
  loading: boolean;
  onViewDetail: (id: number) => void;
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

const STATUS_VARIANT: Record<
  string,
  "success" | "warning" | "destructive" | "info" | "secondary"
> = {
  sukses: "success",
  pending: "warning",
  batal: "destructive",
  proses: "info",
  dikirim: "secondary",
};

const OrderTable: React.FC<OrderTableProps> = ({
  data,
  loading,
  onViewDetail,
  toolbar,
  onSearchChange,
  pagination,
  onPageChange,
  onPerPageChange,
}) => {
  const columns: ColumnDef<Pesanan>[] = [
    {
      key: "no_pesanan",
      header: "No. Pesanan",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-semibold text-foreground text-sm">
            {row.no_pesanan}
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
            <Clock className="h-3 w-3" />
            {new Date(row.tanggal_transaksi).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      ),
    },
    {
      key: "pelanggan.nama_toko",
      header: "Toko",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="font-medium text-sm">
            {row.pelanggan?.nama_toko || "N/A"}
          </div>
          <div className="text-xs text-muted-foreground font-mono">
            {row.pelanggan?.kode_pelanggan || ""}
          </div>
        </div>
      ),
    },
    {
      key: "karyawan.nama_lengkap",
      header: "Sales",
      sortable: true,
      cell: (row) => (
        <div className="text-sm">{row.karyawan?.nama_lengkap || "—"}</div>
      ),
    },
    {
      key: "items",
      header: "Items",
      cell: (row) => (
        <Badge variant="secondary" className="tabular-nums">
          {row.items?.length ?? 0} item
        </Badge>
      ),
    },
    {
      key: "total_tagihan",
      header: "Total",
      sortable: true,
      className: "text-right",
      cell: (row) => (
        <div className="font-semibold text-sm text-right tabular-nums">
          Rp {(Number(row.total_tagihan) || 0).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge
          variant={STATUS_VARIANT[row.status?.toLowerCase() ?? ""] ?? "outline"}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "",
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetail(row.id)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari no pesanan / toko..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada pesanan"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
      serverPagination={
        pagination && onPageChange
          ? {
              ...pagination,
              onPageChange,
              onPerPageChange,
            }
          : undefined
      }
    />
  );
};

export default OrderTable;
