import React from "react";
import {
  Edit,
  Trash,
  User as UserIcon,
  Shield,
  Smartphone,
  Bell,
} from "lucide-react";
import { User } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserTableProps {
  data: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const ROLE_VARIANT: Record<
  string,
  "success" | "info" | "warning" | "destructive" | "secondary"
> = {
  super_admin: "destructive",
  admin_perusahaan: "success",
  admin_divisi: "info",
  sales: "warning",
};

const UserTable: React.FC<UserTableProps> = ({
  data,
  loading,
  onEdit,
  onDelete,
  toolbar,
  onSearchChange,
}) => {
  const columns: ColumnDef<User>[] = [
    {
      key: "karyawan.nama_lengkap",
      header: "Nama Karyawan",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm border border-primary/20">
            {row.karyawan?.nama_lengkap?.charAt(0)?.toUpperCase() ?? (
              <UserIcon className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="font-medium text-sm text-foreground">
              {row.karyawan?.nama_lengkap || "Unknown"}
            </div>
            <div className="flex gap-1 mt-0.5">
              <Badge
                variant="outline"
                className="text-[10px] py-0 h-4 border-muted-foreground/30"
              >
                ID: {row.karyawan?.kode_karyawan || "-"}
              </Badge>
              <Badge
                variant="secondary"
                className="text-[10px] py-0 h-4 bg-primary/5 text-primary border-primary/10"
              >
                {row.karyawan?.divisi?.nama_divisi || "-"}
              </Badge>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "username",
      header: "Username & Akses",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <UserIcon className="h-3 w-3 text-muted-foreground" />
            {row.username}
          </div>
          {row.karyawan?.no_hp && (
            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Smartphone className="h-3 w-3" />
              {row.karyawan.no_hp}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "peran",
      header: "Role",
      sortable: true,
      cell: (row) => (
        <Badge
          variant={ROLE_VARIANT[row.peran] || "secondary"}
          className="capitalize"
        >
          <Shield className="w-3 h-3 mr-1.5 opacity-70" />
          {row.peran.replace("_", " ")}
        </Badge>
      ),
    },
    {
      key: "fcm_token",
      header: "Status App",
      sortable: true,
      cell: (row) =>
        row.fcm_token ? (
          <Badge
            variant="success"
            className="bg-green-500/10 text-green-600 border-green-500/20"
          >
            <Bell className="w-3 h-3 mr-1.5" />
            Aktif
          </Badge>
        ) : (
          <Badge variant="secondary" className="opacity-60">
            <Bell className="w-3 h-3 mr-1.5" />
            N/A
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
      searchPlaceholder="Cari username atau nama karyawan..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada data pengguna"
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default UserTable;
