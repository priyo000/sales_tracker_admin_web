import React from "react";
import { Edit, Trash, Map, MapPin } from "lucide-react";
import { Rute } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RouteTableProps {
  data: Rute[];
  loading: boolean;
  onEdit: (rute: Rute) => void;
  onDelete: (id: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const RouteTable: React.FC<RouteTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  toolbar,
  onSearchChange,
}) => {
  const columns: ColumnDef<Rute>[] = [
    {
      key: "nama_rute",
      header: "Nama Rute",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Map className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            {row.nama_rute}
          </span>
        </div>
      ),
    },
    {
      key: "deskripsi",
      header: "Deskripsi",
      sortable: true,
      cell: (row) => (
        <div
          className="text-sm text-muted-foreground max-w-xs truncate"
          title={row.deskripsi}
        >
          {row.deskripsi || "—"}
        </div>
      ),
    },
    {
      key: "details_count",
      header: "Jumlah Pelanggan",
      sortable: true,
      cell: (row) => (
        <Badge
          variant="success"
          className="bg-green-500/10 text-green-600 border-green-500/20"
        >
          <MapPin className="mr-1.5 h-3 w-3" />
          {row.details_count} Pelanggan
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
      searchPlaceholder="Cari nama rute..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada data rute"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default RouteTable;
