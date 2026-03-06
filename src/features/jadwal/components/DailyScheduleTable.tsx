import React from "react";
import { Edit, Trash, Calendar as CalendarIcon } from "lucide-react";
import { Jadwal } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DailyScheduleTableProps {
  data: Jadwal[];
  loading: boolean;
  onEdit: (jadwal: Jadwal) => void;
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

const DailyScheduleTable: React.FC<DailyScheduleTableProps> = ({
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
  const columns: ColumnDef<Jadwal>[] = [
    {
      key: "tanggal",
      header: "Tanggal",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-2 font-medium text-foreground tabular-nums">
          <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
          {formatDateDisplay(row.tanggal)}
        </div>
      ),
    },
    {
      key: "karyawan.nama_lengkap",
      header: "Sales",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm font-semibold text-foreground">
            {row.karyawan?.nama_lengkap}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.karyawan?.kode_karyawan}
          </div>
        </div>
      ),
    },
    {
      key: "rute.nama_rute",
      header: "Rute",
      sortable: true,
      cell: (row) => (
        <div className="text-sm font-medium text-foreground">
          {row.rute?.nama_rute || "—"}
        </div>
      ),
    },
    {
      key: "toko_count", // Virtual key for sorting if needed, but we'll use a getter
      header: "Jumlah Toko",
      sortable: true,
      cell: (row) => (
        <Badge
          variant="secondary"
          className="bg-primary/5 text-primary border-primary/10"
        >
          {row.rute?.details_count || row.rute?.details?.length || 0} Toko
        </Badge>
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
      searchPlaceholder="Cari nama sales atau rute..."
      rowKey={(r) => r.id}
      emptyMessage="Tidak ada data jadwal ditemukan"
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

export default DailyScheduleTable;
