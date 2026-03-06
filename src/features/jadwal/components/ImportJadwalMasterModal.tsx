import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
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
  } | null>(null);
  const [showFailures, setShowFailures] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validExtensions = [".xlsx", ".xls"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (validExtensions.includes(fileExtension)) {
      setFile(file);
      setError(null);
      setResult(null);
    } else {
      setFile(null);
      setError(
        "Format file tidak didukung. Harap gunakan format .xlsx atau .xls",
      );
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const res = await onImport(file);
      if (res.success && res.data) {
        setResult(res.data);
        if (res.data.summary.failed === 0) {
          setTimeout(() => {
            handleClose();
          }, 3000);
        }
      } else {
        setError(res.message || "Gagal mengimport data.");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat mengupload file.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setLoading(false);
    setShowFailures(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Master Jadwal"
      size="lg"
    >
      <div className="space-y-4">
        {/* Instructions */}
        {!result && (
          <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Info className="h-3.5 w-3.5 text-primary" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Panduan Import:
              </h3>
            </div>
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight space-y-3">
              <div>
                <p className="text-primary font-bold mb-1">
                  Sheet 1: RuteMingguan
                </p>
                <ul className="list-none space-y-1">
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Kolom Wajib: <span className="text-foreground/80">nama_per_minggu</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Kolom Hari: <span className="font-mono text-[9px] bg-primary/10 px-1 rounded">1..7</span>
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
                    Kolom Wajib: <span className="text-foreground/80">kode_karyawan</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                    Kolom Minggu: <span className="font-mono text-[9px] bg-primary/10 px-1 rounded">Minggu 1..4</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Dropzone */}
        {!file && !result ? (
          <div
            className="border-2 border-dashed border-border rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group bg-card shadow-sm"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="bg-primary/10 p-4 rounded-xl mb-3 group-hover:scale-105 group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
              <Upload className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs font-bold uppercase tracking-tight text-foreground mb-1">
              Upload Master Jadwal
            </p>
            <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest opacity-60 text-center">
              Drag & Drop file disini atau klik untuk memilih file
            </p>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".xlsx, .xls"
              onChange={handleFileChange}
            />
          </div>
        ) : null}

        {/* Selected File State */}
        {file && !result && (
          <div className="bg-card border border-primary/20 rounded-xl p-4 flex items-center justify-between shadow-md shadow-primary/5 animate-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="bg-primary/10 p-2.5 rounded-lg border border-primary/10">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground uppercase tracking-tight leading-none mb-1">
                  {file.name}
                </p>
                <p className="text-[9px] font-semibold text-muted-foreground uppercase opacity-60">
                  {(file.size / 1024).toFixed(2)} KB • Siap Import
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-9 w-9 rounded-lg"
              disabled={loading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div
              className={`rounded-2xl p-6 border-2 flex flex-col items-center text-center shadow-md ${result.summary.failed > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-green-500/5 border-green-500/20"}`}
            >
              <div
                className={`p-3 rounded-xl mb-3 shadow-md ${result.summary.failed > 0 ? "bg-amber-500 text-white shadow-amber-500/20" : "bg-green-500 text-white shadow-green-500/20"}`}
              >
                {result.summary.failed > 0 ? (
                  <AlertCircle className="w-6 h-6" />
                ) : (
                  <CheckCircle className="w-6 h-6" />
                )}
              </div>
              <h3
                className={`text-base font-bold uppercase tracking-tight ${result.summary.failed > 0 ? "text-amber-700" : "text-green-700"}`}
              >
                {result.summary.failed > 0
                  ? "Import Selesai dengan Catatan"
                  : "Import Berhasil Sempurna!"}
              </h3>

              <div className="grid grid-cols-3 gap-3 mt-6 w-full">
                <div className="bg-card p-3 rounded-xl border border-border shadow-sm">
                  <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider mb-1">
                    Total
                  </p>
                  <p className="text-xl font-bold text-foreground uppercase tracking-tighter leading-none">
                    {result.summary.total}
                  </p>
                </div>
                <div className="bg-green-500/5 p-3 rounded-xl border border-green-500/20 shadow-sm">
                  <p className="text-[9px] text-green-600 font-bold uppercase tracking-wider mb-1">
                    Berhasil
                  </p>
                  <p className="text-xl font-bold text-green-600 uppercase tracking-tighter leading-none">
                    {result.summary.success}
                  </p>
                </div>
                <div className="bg-destructive/5 p-3 rounded-xl border border-destructive/20 shadow-sm">
                  <p className="text-[9px] text-destructive font-bold uppercase tracking-wider mb-1">
                    Gagal
                  </p>
                  <p className="text-xl font-bold text-destructive uppercase tracking-tighter leading-none">
                    {result.summary.failed}
                  </p>
                </div>
              </div>
            </div>

            {/* Failures List */}
            {result.summary.failures.length > 0 && (
              <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-sm">
                <button
                  onClick={() => setShowFailures(!showFailures)}
                  className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive" />
                    Detail Kegagalan ({result.summary.failures.length})
                  </div>
                  {showFailures ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>

                {showFailures && (
                  <ScrollArea className="h-[200px]">
                    <div className="divide-y divide-border/50 border-t border-border/50">
                      {result.summary.failures.map((fail, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-foreground uppercase tracking-tight">
                              [{fail.sheet}] Baris {fail.row}: {fail.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-destructive font-medium uppercase tracking-tight leading-relaxed opacity-90">
                            {fail.error}
                          </p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            <div className="flex justify-center pt-2">
              <Button
                onClick={handleClose}
                className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-black/5 bg-foreground text-background hover:bg-foreground/90 rounded-lg"
              >
                Tutup Panel
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4 flex items-start space-x-3 animate-in slide-in-from-top-2 shadow-md">
            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
            <span className="text-xs text-destructive font-semibold uppercase tracking-tight">
              {error}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!result && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
              disabled={loading}
            >
              <X className="mr-2 h-3.5 w-3.5" /> Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all"
            >
              {loading ? (
                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-3.5 h-3.5" /> Import Data
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportJadwalMasterModal;
