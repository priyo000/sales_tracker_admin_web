import React from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";

interface ImportCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      message: string;
      summary: { success: number; failed: number; total: number };
      failures: Array<{ row: number; nama_toko: string; error: string }>;
    };
  }>;
}

const ImportCustomerModal: React.FC<ImportCustomerModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => (
  <ImportDataModal
    isOpen={isOpen}
    onClose={onClose}
    onImport={onImport as (file: File) => Promise<ImportResult>}
    title="Import Database Pelanggan"
    uploadLabel="Upload File Pelanggan"
    failureLabelFn={(fail) => (fail as { nama_toko?: string }).nama_toko || ""}
    instructions={
      <ul className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight list-none space-y-1.5">
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Gunakan format excel (.xlsx / .xls) / .csv
        </li>
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Pastikan kolom header sesuai template.
        </li>
        <li className="flex items-start gap-2 text-foreground/80">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Kolom Wajib: nama_toko.
        </li>
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Update otomatis jika kode_pelanggan sudah ada.
        </li>
      </ul>
    }
  />
);

export default ImportCustomerModal;
