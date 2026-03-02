import React from "react";
import { Package, Edit, Trash } from "lucide-react";
import { Produk } from "../types";
import { getImageUrl } from "@/lib/utils";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductTableProps {
  produks: Produk[];
  onEdit: (produk: Produk) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
  onSearchChange?: (value: string) => void;
  toolbar?: React.ReactNode;
}

const ProductTable: React.FC<ProductTableProps> = ({
  produks,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPageChange,
  onPerPageChange,
  onSearchChange,
  toolbar,
}) => {
  const columns: ColumnDef<Produk>[] = [
    {
      key: "nama_produk",
      header: "Info Barang",
      sortable: true,
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded bg-primary/10 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
            {row.gambar_url ? (
              <img
                src={getImageUrl(row.gambar_url) || ""}
                alt={row.nama_produk || "Produk"}
                className="h-full w-full object-cover"
              />
            ) : (
              <Package className="h-5 w-5" />
            )}
          </div>
          <div>
            <div className="font-semibold text-sm">
              {row.nama_produk || "-"}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {row.satuan || "pcs"}
              </span>
              {row.kategori && typeof row.kategori === "object" && (
                <Badge variant="info" className="text-[10px] py-0 h-4">
                  {row.kategori.nama_kategori || "Tanpa Kategori"}
                </Badge>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "kode_barang",
      header: "Kode / SKU",
      sortable: true,
      cell: (row) => (
        <div>
          <div className="text-sm font-medium">{row.kode_barang || "-"}</div>
          <div className="text-xs text-muted-foreground font-mono">
            {row.sku || "-"}
          </div>
        </div>
      ),
    },
    {
      key: "harga_jual",
      header: "Harga",
      sortable: true,
      className: "text-right",
      cell: (row) => (
        <div className="text-sm font-semibold text-right tabular-nums">
          Rp {(parseFloat(row.harga_jual || "0") || 0).toLocaleString("id-ID")}
        </div>
      ),
    },
    {
      key: "stok_tersedia",
      header: "Stok",
      sortable: true,
      className: "text-center",
      cell: (row) => (
        <div className="text-center">
          <Badge
            variant={
              row.stok_tersedia && row.stok_tersedia > 10
                ? "success"
                : "warning"
            }
            className="tabular-nums"
          >
            {row.stok_tersedia ?? 0}
          </Badge>
        </div>
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
            onClick={() => row.id && onDelete(row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
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
      data={produks}
      columns={columns}
      loading={loading}
      searchPlaceholder="Cari nama produk, kode atau SKU..."
      rowKey={(r) => r.id || Math.random()}
      emptyMessage="Belum ada data produk"
      serverPagination={serverPagination}
      toolbar={toolbar}
      onSearchChange={onSearchChange}
    />
  );
};

export default ProductTable;
