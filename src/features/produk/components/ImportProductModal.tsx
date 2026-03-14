import React from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";

interface ImportProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      message: string;
      summary: { success: number; failed: number; total: number };
      failures: Array<{ row: number; nama_produk: string; error: string }>;
    };
  }>;
  onSuccess?: () => void;
}

const ImportProductModal: React.FC<ImportProductModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onSuccess,
}) => (
  <ImportDataModal
    isOpen={isOpen}
    onClose={onClose}
    onImport={onImport as (file: File) => Promise<ImportResult>}
    onSuccess={onSuccess}
    title="Import Database Produk"
    uploadLabel="Upload Database Produk"
    failureLabelFn={(fail) => {
      const f = fail as { nama_produk?: string; nama_toko?: string };
      return f.nama_produk || f.nama_toko || "";
    }}
    instructions={
      <ul className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight list-none space-y-1.5">
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Gunakan format excel (.xlsx / .xls) / .csv
        </li>
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Kolom Header:{" "}
          <span className="font-mono text-[9px] bg-primary/10 px-1 rounded ml-1">
            kode_barang, nama_produk, kategori, harga, sku, stok_awal, satuan
          </span>
        </li>
        <li className="flex items-start gap-2 text-foreground/80">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Kolom Wajib: nama_produk atau kode_barang.
        </li>
      </ul>
    }
  />
);

export default ImportProductModal;
