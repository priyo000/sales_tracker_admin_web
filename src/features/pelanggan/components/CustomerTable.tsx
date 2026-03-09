import React from "react";
import { Store, User, Phone, MapPin, Check, X, Edit, Eye } from "lucide-react";
import { Pelanggan } from "../types";
import { getImageUrl } from "@/lib/utils";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CustomerTableProps {
  data: Pelanggan[];
  loading: boolean;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onEdit: (pelanggan: Pelanggan) => void;
  onView: (pelanggan: Pelanggan) => void;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  toolbar?: React.ReactNode;
  onSearchChange?: (value: string) => void;
}

const STATUS_VARIANT: Record<
  string,
  "success" | "destructive" | "secondary" | "warning" | "outline"
> = {
  active: "success",
  rejected: "destructive",
  nonactive: "secondary",
  pending: "warning",
  prospect: "info" as "outline",
};

const CustomerTable: React.FC<CustomerTableProps> = ({
  data,
  loading,
  onApprove,
  onReject,
  onEdit,
  onView,
  pagination,
  onPageChange,
  onPerPageChange,
  toolbar,
  onSearchChange,
}) => {
  const columns: ColumnDef<Pelanggan>[] = [
    {
      key: "nama_toko",
      header: "Toko & Pemilik",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
            {row.foto_toko_url ? (
              <img
                src={getImageUrl(row.foto_toko_url)}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <Store className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{row.nama_toko}</span>
              {row.kode_pelanggan && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono py-0 h-4"
                >
                  {row.kode_pelanggan}
                </Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <User className="h-3 w-3" /> {row.nama_pemilik}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "no_hp_pribadi",
      header: "Kontak",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm flex items-center gap-1.5">
            <Phone className="h-3 w-3 text-muted-foreground" />
            {row.no_hp_pribadi}
          </div>
          {row.alamat_usaha && (
            <div className="text-xs text-muted-foreground flex items-start gap-1 mt-0.5 max-w-[220px]">
              <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{row.alamat_usaha}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "kota_usaha",
      header: "Kota",
      sortable: true,
      cell: (row) => (
        <div className="text-sm">
          <div>{row.kota_usaha || "—"}</div>
          {row.provinsi_usaha && (
            <div className="text-xs text-muted-foreground">
              {row.provinsi_usaha}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "creator.nama_lengkap",
      header: "Creator",
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-muted-foreground">
          {row.creator?.nama_lengkap || "System"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      cell: (row) => (
        <Badge variant={STATUS_VARIANT[row.status ?? ""] ?? "outline"}>
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full inline-block bg-current opacity-70" />
          {row.status === "nonactive" ? "Non-Active" : row.status}
        </Badge>
      ),
    },
    {
      key: "id",
      header: "",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onView(row)}
            title="Lihat Detail"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(row)}
            title="Edit Data"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          {row.status === "pending" && (
            <>
              <Button
                size="sm"
                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                onClick={() => onApprove(row.id)}
              >
                <Check className="h-3 w-3 mr-1" /> Approve
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onReject(row.id)}
              >
                <X className="h-3 w-3 mr-1" /> Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const serverPagination = pagination
    ? {
        total: pagination.total,
        currentPage: pagination.currentPage,
        lastPage: pagination.lastPage,
        perPage: pagination.perPage,
        onPageChange: (p: number) => onPageChange?.(p),
        onPerPageChange: (pp: number) => onPerPageChange?.(pp),
      }
    : undefined;

  return (
    <DataTable
      data={data}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari toko atau pemilik..."
      rowKey={(r) => r.id}
      emptyMessage="Tidak ada data pelanggan"
      serverPagination={serverPagination}
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default CustomerTable;
