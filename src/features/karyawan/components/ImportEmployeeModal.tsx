import React from "react";
import ImportDataModal from "@/components/ui/ImportDataModal";

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
