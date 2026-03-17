import React from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";

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
    onDownloadTemplate={() => downloadCsvTemplate(
      'template_pelanggan.csv',
      ['kode_pelanggan', 'nama_toko', 'nama_pemilik', 'no_hp_pelanggan', 'alamat_pelanggan', 'kecamatan', 'kota', 'provinsi', 'latitude', 'longitude', 'kode_karyawan', 'status'],
      [
        ['KP-001', 'Toko Maju Jaya', 'Budi', '081234567890', 'Jl. Merdeka No.1', 'Menteng', 'Jakarta Pusat', 'DKI Jakarta', '-6.186486', '106.834091', 'KRY-001', 'active'],
        ['KP-002', 'Toko Sejahtera', 'Siti', '082345678901', 'Jl. Sudirman No.5', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '-6.212728', '106.818040', 'KRY-001', 'active'],
      ]
    )}
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
