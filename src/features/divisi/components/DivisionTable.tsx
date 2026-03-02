import React from "react";
import { Trash, Layout, Edit } from "lucide-react";
import { Divisi } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface DivisionTableProps {
  data: Divisi[];
  loading: boolean;
  onDelete: (id: number) => void;
  onEdit: (divisi: Divisi) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const DivisionTable: React.FC<DivisionTableProps> = ({
  data,
  loading,
  onDelete,
  onEdit,
  toolbar,
  onSearchChange,
}) => {
  const columns: ColumnDef<Divisi>[] = [
    {
      key: "nama_divisi",
      header: "Nama Divisi",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
            <Layout className="h-5 w-5" />
          </div>
          <span className="font-semibold text-sm text-foreground">
            {row.nama_divisi}
          </span>
        </div>
      ),
    },
    {
      key: "radius_toleransi",
      header: "Jarak Toleransi",
      sortable: true,
      cell: (row) => (
        <Badge variant="info" className="font-mono">
          {row.radius_toleransi ? `${row.radius_toleransi} m` : "Default"}
        </Badge>
      ),
    },
    {
      key: "view_scope",
      header: "Jangkauan Data",
      sortable: true,
      cell: (row) => {
        if (row.view_scope === "COMPANY") {
          return <Badge variant="destructive">Satu Perusahaan</Badge>;
        }
        if (row.view_scope === "DIVISION") {
          return <Badge variant="success">Satu Divisi</Badge>;
        }
        return <Badge variant="secondary">Diri Sendiri (Default)</Badge>;
      },
    },
    {
      key: "created_at",
      header: "Dibuat Pada",
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground tabular-nums">
          {row.created_at
            ? new Date(row.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "-"}
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
      searchPlaceholder="Cari nama divisi..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada data divisi"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default DivisionTable;
