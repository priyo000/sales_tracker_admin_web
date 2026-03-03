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

interface ImportRouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{
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
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    message: string;
    summary: { success: number; failed: number; total: number };
    failures: Array<{ row: number; nama_rute: string; error: string }>;
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
      title="Import Database Rute"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
        {!result && (
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 shadow-inner">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-black uppercase tracking-widest text-primary">
                Panduan Import:
              </h3>
            </div>
            <ul className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight list-none space-y-2">
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Gunakan format excel (.xlsx / .xls).
              </li>
              <li className="flex items-start gap-2 text-foreground font-black">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Kolom Wajib: nama_rute, kode_pelanggan.
              </li>
              <li className="flex items-start gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Sistem akan mencari kode_pelanggan dan menghubungkannya ke rute.
              </li>
              <li className="flex items-start gap-2 italic">
                <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                Jika nama_rute belum ada, rute baru akan dibuat otomatis.
              </li>
            </ul>
          </div>
        )}

        {/* Dropzone */}
        {!file && !result ? (
          <div
            className="border-2 border-dashed border-border/50 rounded-3xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all group bg-card shadow-inner"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <div className="bg-primary/10 p-5 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all shadow-lg shadow-primary/5">
              <Upload className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
            </div>
            <p className="text-sm font-black uppercase tracking-tight text-foreground mb-1">
              Upload Data Rute
            </p>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic opacity-50 text-center">
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
          <div className="bg-card border-2 border-primary/20 rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-primary/5 animate-in zoom-in-95">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-xl border border-primary/10">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground uppercase tracking-tight leading-none mb-1">
                  {file.name}
                </p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">
                  {(file.size / 1024).toFixed(2)} KB • Siap Import
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setFile(null)}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors h-10 w-10 rounded-xl"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Result State */}
        {result && (
          <div className="space-y-4 animate-in fade-in zoom-in-95">
            <div
              className={`rounded-3xl p-8 border-2 flex flex-col items-center text-center shadow-xl ${result.summary.failed > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-green-500/5 border-green-500/20 shadow-green-500/5"}`}
            >
              <div
                className={`p-4 rounded-2xl mb-4 shadow-lg ${result.summary.failed > 0 ? "bg-amber-500 text-white shadow-amber-500/30" : "bg-green-500 text-white shadow-green-500/30"}`}
              >
                {result.summary.failed > 0 ? (
                  <AlertCircle className="w-8 h-8" />
                ) : (
                  <CheckCircle className="w-8 h-8" />
                )}
              </div>
              <h3
                className={`text-xl font-black uppercase tracking-tight ${result.summary.failed > 0 ? "text-amber-700" : "text-green-700"}`}
              >
                {result.summary.failed > 0
                  ? "Import Selesai dengan Catatan"
                  : "Import Berhasil Sempurna!"}
              </h3>

              <div className="grid grid-cols-3 gap-4 mt-8 w-full">
                <div className="bg-card p-4 rounded-2xl border-2 border-border/50 shadow-sm">
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">
                    Total
                  </p>
                  <p className="text-2xl font-black text-foreground uppercase tracking-tighter leading-none">
                    {result.summary.total}
                  </p>
                </div>
                <div className="bg-green-500/5 p-4 rounded-2xl border-2 border-green-500/20 shadow-sm">
                  <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">
                    Berhasil
                  </p>
                  <p className="text-2xl font-black text-green-600 uppercase tracking-tighter leading-none">
                    {result.summary.success}
                  </p>
                </div>
                <div className="bg-destructive/5 p-4 rounded-2xl border-2 border-destructive/20 shadow-sm">
                  <p className="text-[10px] text-destructive font-black uppercase tracking-widest mb-1">
                    Gagal
                  </p>
                  <p className="text-2xl font-black text-destructive uppercase tracking-tighter leading-none">
                    {result.summary.failed}
                  </p>
                </div>
              </div>
            </div>

            {/* Failures List */}
            {result.failures.length > 0 && (
              <div className="border-2 border-border/50 rounded-2xl overflow-hidden bg-card shadow-sm">
                <button
                  onClick={() => setShowFailures(!showFailures)}
                  className="w-full flex items-center justify-between p-4 bg-muted/30 hover:bg-muted/50 transition-colors text-[11px] font-black uppercase tracking-widest text-muted-foreground"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-destructive" />
                    Detail Kegagalan ({result.failures.length})
                  </div>
                  {showFailures ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {showFailures && (
                  <ScrollArea className="h-[250px]">
                    <div className="divide-y divide-border/50 border-t border-border/50">
                      {result.failures.map((fail, idx) => (
                        <div
                          key={idx}
                          className="p-4 hover:bg-muted/10 transition-colors"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-black text-foreground uppercase tracking-tight">
                              Baris {fail.row}: {fail.nama_rute}
                            </span>
                          </div>
                          <p className="text-[11px] text-destructive font-bold uppercase tracking-tight leading-relaxed">
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
                className="h-12 px-12 text-xs font-black uppercase tracking-widest shadow-xl shadow-foreground/10 bg-foreground text-background hover:bg-foreground/90"
              >
                Tutup Panel
              </Button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-destructive/5 border-2 border-destructive/20 rounded-2xl p-5 flex items-start space-x-3 animate-in slide-in-from-top-2 shadow-xl shadow-destructive/5">
            <AlertCircle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <span className="text-xs text-destructive font-black uppercase tracking-tight">
              {error}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        {!result && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
            <Button
              variant="ghost"
              onClick={handleClose}
              className="h-12 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
              disabled={loading}
            >
              <X className="mr-2 h-4 w-4" /> Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file || loading}
              className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" /> Import Sekarang
                </span>
              )}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ImportRouteModal;
