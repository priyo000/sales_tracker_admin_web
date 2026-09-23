import React from "react";
import { Eye, Trash, FileDown } from "lucide-react";
import { Kiriman } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import ExportMenu from "./ExportMenu";

interface KirimanTableProps {
  data: Kiriman[];
  loading: boolean;
  onOpen: (kiriman: Kiriman) => void;
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

const formatDateDisplay = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  const dayName = new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(
    date,
  );
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${dayName}, ${day}-${month}-${year}`;
};

const KirimanTable: React.FC<KirimanTableProps> = ({
  data,
  loading,
  onOpen,
  onDelete,
  toolbar,
  onSearchChange,
  pagination,
  onPageChange,
  onPerPageChange,
}) => {
  const columns: ColumnDef<Kiriman>[] = [
    {
      key: "tanggal",
      header: "Tanggal",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 font-medium text-foreground tabular-nums">
          <FileDown className="hidden" />
          {formatDateDisplay(row.tanggal)}
        </div>
      ),
    },
    {
      key: "keterangan",
      header: "Keterangan",
      cell: (row) => (
        <div className="text-sm text-foreground max-w-[220px] truncate">
          {row.keterangan || <span className="text-muted-foreground">—</span>}
        </div>
      ),
    },
    {
      key: "divisi.nama_divisi",
      header: "Divisi",
      cell: (row) => row.divisi?.nama_divisi ?? "—",
    },
    {
      key: "details_count",
      header: "Jumlah Titik",
      sortable: true,
      cell: (row) => <Badge variant="secondary">{row.details_count ?? 0}</Badge>,
    },
    {
      key: "aksi",
      header: "Aksi",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            title="Edit / susun ulang"
            onClick={() => onOpen(row)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <ExportMenu tanggal={row.tanggal} kirimanId={row.id} />
          <Button
            variant="ghost"
            size="icon"
            title="Hapus"
            onClick={() => onDelete(row.id)}
          >
            <Trash className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      toolbar={toolbar}
      onSearchChange={onSearchChange}
      serverPagination={
        pagination
          ? {
              total: pagination.total,
              currentPage: pagination.currentPage,
              lastPage: pagination.lastPage,
              perPage: pagination.perPage,
              onPageChange: onPageChange ?? (() => {}),
              onPerPageChange: onPerPageChange,
            }
          : undefined
      }
      emptyMessage="Belum ada kiriman. Klik “Buat Kiriman” untuk mulai."
      rowKey={(row) => row.id}
    />
  );
};

export default KirimanTable;
