import React from "react";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { InformasiKunjungan } from "../types/InformasiKunjungan";

interface InformasiKunjunganTableProps {
  data: InformasiKunjungan[];
  loading: boolean;
  page: number;
  perPage: number;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  toolbar?: React.ReactNode;
}

const InformasiKunjunganTable: React.FC<InformasiKunjunganTableProps> = ({
  data,
  loading,
  page,
  perPage,
  pagination,
  onPageChange,
  onPerPageChange,
  toolbar,
}) => {
  const columns: ColumnDef<InformasiKunjungan>[] = [
    {
      key: "no",
      header: "NO",
      cell: (_row, index) => {
        return (
          <span className="text-sm font-medium text-muted-foreground w-6 text-center inline-block">
            {(page - 1) * perPage + index + 1}
          </span>
        );
      },
    },
    {
      key: "tanggal",
      header: "TANGGAL",
      sortable: true,
      cell: (row) => <span className="font-semibold text-sm">{row.tanggal}</span>,
    },
    {
      key: "nama",
      header: "NAMA",
      cell: (row) => (
        <span className="text-sm font-semibold text-primary">
          {row.nama !== "-" ? row.nama.toUpperCase() : row.nama}
        </span>
      ),
    },
    {
      key: "visited",
      header: "VISITED",
      className: "text-center",
      cell: (row) => (
        <span className="text-sm font-semibold">
          {row.visited}
        </span>
      ),
    },
    {
      key: "waktu_mulai",
      header: "WAKTU MULAI",
      className: "text-center",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.waktu_mulai}</span>
      ),
    },
    {
      key: "waktu_akhir",
      header: "WAKTU AKHIR",
      className: "text-center",
      cell: (row) => (
        <span className="text-sm text-muted-foreground">{row.waktu_akhir}</span>
      ),
    },
    {
      key: "total_penjualan",
      header: "TOTAL QTY PRODUK",
      className: "text-center",
      cell: (row) => (
        <span className="text-sm font-bold text-primary bg-primary/5 px-4 py-0.5 rounded-md">
          {Number(row.total_penjualan || 0).toLocaleString("id-ID")}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      rowKey={(r) => `${r.tanggal}-${r.nama}`}
      emptyMessage="Belum ada data informasi kunjungan"
      toolbar={toolbar}
      serverPagination={{
        ...pagination,
        onPageChange,
        onPerPageChange,
      }}
    />
  );
};

export default InformasiKunjunganTable;
