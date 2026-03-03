import React from "react";
import { Edit, Trash, User, Mail, Phone } from "lucide-react";
import { Karyawan } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EmployeeTableProps {
  data: Karyawan[];
  loading: boolean;
  onEdit: (karyawan: Karyawan) => void;
  onDelete: (id: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  toolbar,
  onSearchChange,
}) => {
  const columns: ColumnDef<Karyawan>[] = [
    {
      key: "nama_lengkap",
      header: "Nama Karyawan",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm border border-primary/20">
            {row.nama_lengkap?.charAt(0)?.toUpperCase() ?? (
              <User className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm">{row.nama_lengkap}</div>
            <div className="flex gap-1 mt-0.5 flex-wrap">
              <Badge variant="info" className="text-[10px] py-0 h-4">
                {row.jabatan}
              </Badge>
              {row.kode_karyawan && (
                <Badge variant="success" className="text-[10px] py-0 h-4">
                  {row.kode_karyawan}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "no_hp",
      header: "Kontak",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.no_hp}
          </div>
          {row.email && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Mail className="h-3 w-3" />
              {row.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "divisi.nama_divisi",
      header: "Divisi",
      sortable: true,
      cell: (row) => (
        <span className="text-sm font-medium">
          {row.divisi?.nama_divisi || "—"}
        </span>
      ),
    },
    {
      key: "jabatan",
      header: "Jabatan",
      sortable: true,
      cell: (row) => <span className="text-sm">{row.jabatan}</span>,
    },
    {
      key: "status_karyawan",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge
          variant={row.status_karyawan === "aktif" ? "success" : "destructive"}
        >
          <span
            className={`w-1.5 h-1.5 mr-1.5 rounded-full inline-block ${
              row.status_karyawan === "aktif" ? "bg-green-600" : "bg-red-600"
            }`}
          />
          {row.status_karyawan === "aktif" ? "Aktif" : "Non-Aktif"}
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
      searchPlaceholder="Cari nama, jabatan, atau divisi..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada data karyawan"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default EmployeeTable;
