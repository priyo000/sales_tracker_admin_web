import React from "react";
import ImportDataModal from "@/components/ui/ImportDataModal";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";

interface ImportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{ success: boolean; message?: string }>;
}

const ImportEmployeeModal: React.FC<ImportEmployeeModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => (
  <ImportDataModal
    isOpen={isOpen}
    onClose={onClose}
    onImport={onImport}
    title="Import Database Karyawan"
    uploadLabel="Upload File Excel"
    successMessage="Data master karyawan telah diimport."
    onDownloadTemplate={() => downloadCsvTemplate(
      'template_karyawan.csv',
      ['nama', 'kode_karyawan', 'jabatan', 'no_hp', 'alamat', 'divisi', 'status'],
      [
        ['Budi Santoso', 'KRY-001', 'SALES', '081234567890', 'Jl. Merdeka No.1', 'Divisi Barat', 'aktif'],
        ['Siti Rahayu', 'KRY-002', 'SALES', '082345678901', 'Jl. Sudirman No.2', 'Divisi Timur', 'aktif'],
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
          Kolom Wajib: Nama Lengkap.
        </li>
        <li className="flex items-start gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
          Opsional: Kode Karyawan, Jabatan, WA, Alamat, Divisi.
        </li>
      </ul>
    }
  />
);

export default ImportEmployeeModal;
