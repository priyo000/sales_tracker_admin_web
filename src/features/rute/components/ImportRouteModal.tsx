import React, { useState, useEffect } from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { useAuth } from "@/hooks/useAuth";

interface ImportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    file: File,
    id_divisi?: number,
  ) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      message: string;
      summary: { success: number; failed: number; total: number };
      failures: Array<{ row: number; nama_rute: string; error: string }>;
    };
  }>;
}

const ImportRouteModal: React.FC<ImportRouteModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const { user } = useAuth();
  const { divisis, fetchDivisis } = useDivisi();
  const [selectedDivisi, setSelectedDivisi] = useState<string>("");

  const showDivisiSelector =
    user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  useEffect(() => {
    if (isOpen && showDivisiSelector) {
      fetchDivisis();
    }
  }, [isOpen, showDivisiSelector, fetchDivisis]);

  const handleImport = async (file: File): Promise<ImportResult> => {
    if (showDivisiSelector && !selectedDivisi) {
      return {
        success: false,
        message: "Silakan pilih divisi target terlebih dahulu.",
      };
    }
    const res = await onImport(
      file,
      selectedDivisi ? Number(selectedDivisi) : undefined,
    );
    return res as ImportResult;
  };

  const handleClose = () => {
    setSelectedDivisi("");
    onClose();
  };

  return (
    <ImportDataModal
      isOpen={isOpen}
      onClose={handleClose}
      onImport={handleImport}
      title="Import Database Rute"
      uploadLabel="Upload Data Rute"
      accept=".xlsx, .xls, .csv"
      onDownloadTemplate={() => downloadCsvTemplate(
        'template_rute.csv',
        ['nama_rute', 'kode_pelanggan', 'deskripsi'],
        [
          ['Rute Senin Barat', 'KP-001', 'Rute area barat'],
          ['Rute Senin Barat', 'KP-002', ''],
          ['Rute Selasa Timur', 'KP-003', 'Rute area timur'],
        ]
      )}
      failureLabelFn={(fail) =>
        (fail as { nama_rute?: string }).nama_rute || ""
      }
      extraContent={
        showDivisiSelector ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Divisi Kerja Target
            </label>
            <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
              <SelectTrigger className="w-full bg-card border border-border h-9 rounded-lg shadow-sm focus:ring-primary/20">
                <SelectValue placeholder="Pilih Divisi Target Import" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border shadow-xl">
                {divisis.map((div) => (
                  <SelectItem
                    key={div.id}
                    value={div.id.toString()}
                    className="rounded-lg text-xs"
                  >
                    {div.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[9px] text-muted-foreground font-medium italic ml-1 opacity-70">
              * Seluruh rute dalam file akan dimasukkan ke divisi ini.
            </p>
          </div>
        ) : undefined
      }
      instructions={
        <ul className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight list-none space-y-1.5">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
            Gunakan format excel (.xlsx / .xls).
          </li>
          <li className="flex items-start gap-2 text-foreground/80">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
            Kolom Wajib: nama_rute, kode_pelanggan.
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
            Sistem akan menghubungkan kode_pelanggan ke rute.
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
            Pembuatan rute baru secara otomatis jika belum ada.
          </li>
        </ul>
      }
    />
  );
};

export default ImportRouteModal;
