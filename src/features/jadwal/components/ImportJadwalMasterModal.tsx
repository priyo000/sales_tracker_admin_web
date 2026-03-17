import React from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";

interface ImportJadwalMasterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      message: string;
      summary: {
        success: number;
        failed: number;
        total: number;
        failures: Array<{
          sheet: string;
          row: number;
          name: string;
          error: string;
        }>;
      };
    };
  }>;
}

const ImportJadwalMasterModal: React.FC<ImportJadwalMasterModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  // Normalize the response: move summary.failures to top-level failures
  const handleImport = async (file: File): Promise<ImportResult> => {
    const res = await onImport(file);
    if (res.success && res.data) {
      return {
        success: true,
        data: {
          message: res.data.message,
          summary: {
            success: res.data.summary.success,
            failed: res.data.summary.failed,
            total: res.data.summary.total,
          },
          failures: res.data.summary.failures?.map((f) => ({
            row: f.row,
            error: f.error,
            sheet: f.sheet,
            name: f.name,
          })),
        },
      };
    }
    return res;
  };

  return (
    <ImportDataModal
      isOpen={isOpen}
      onClose={onClose}
      onImport={handleImport}
      title="Import Master Jadwal"
      uploadLabel="Upload Master Jadwal"
      accept=".xlsx, .xls"
      onDownloadTemplate={() => downloadCsvTemplate(
        'template_jadwal_master_RuteMingguan.csv',
        ['nama_per_minggu', '1', '2', '3', '4', '5', '6', '7'],
        [
          ['Template Minggu A', 'Rute Senin', 'Rute Selasa', 'Rute Rabu', 'Rute Kamis', 'Rute Jumat', '', ''],
          ['Template Minggu B', 'Rute Barat', '', 'Rute Timur', '', 'Rute Selatan', '', ''],
        ]
      )}
      failureLabelFn={(fail) => {
        const f = fail as { sheet?: string; name?: string };
        return `[${f.sheet}] ${f.name}`;
      }}
      instructions={
        <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight space-y-3">
          <div>
            <p className="text-primary font-bold mb-1">
              Sheet 1: RuteMingguan
            </p>
            <ul className="list-none space-y-1">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Kolom Wajib:{" "}
                <span className="text-foreground/80">nama_per_minggu</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Kolom Hari:{" "}
                <span className="font-mono text-[9px] bg-primary/10 px-1 rounded">
                  1..7
                </span>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-primary font-bold mb-1">
              Sheet 2: MingguanKaryawan
            </p>
            <ul className="list-none space-y-1">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Kolom Wajib:{" "}
                <span className="text-foreground/80">kode_karyawan</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Kolom Minggu:{" "}
                <span className="font-mono text-[9px] bg-primary/10 px-1 rounded">
                  Minggu 1..4
                </span>
              </li>
            </ul>
          </div>
        </div>
      }
    />
  );
};

export default ImportJadwalMasterModal;
