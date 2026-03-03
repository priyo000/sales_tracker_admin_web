import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "@/components/ui/button";

interface ImportEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File) => Promise<{ success: boolean; message?: string }>;
}

const ImportEmployeeModal: React.FC<ImportEmployeeModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();

    if (
      validTypes.includes(file.type) ||
      validExtensions.includes(fileExtension)
    ) {
      setFile(file);
      setError(null);
      setSuccess(false);
    } else {
      setFile(null);
      setError(
        "Format file tidak didukung. Harap gunakan format .xlsx, .xls, atau .csv",
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
      const result = await onImport(file);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          handleClose();
        }, 1500);
      } else {
        setError(result.message || "Gagal mengimport data.");
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
    setSuccess(false);
    setLoading(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Import Database Karyawan"
      size="lg"
    >
      <div className="space-y-6">
        {/* Instructions */}
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
              Gunakan format excel (.xlsx / .xls) / .csv
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
              Pastikan kolom header sesuai dengan template sistem.
            </li>
            <li className="flex items-start gap-2 text-foreground font-black">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
              Kolom Wajib: Nama Lengkap.
            </li>
            <li className="flex items-start gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
              Opsional: Kode Karyawan, Jabatan, WA, Alamat, Divisi.
            </li>
          </ul>
        </div>

        {/* Dropzone */}
        {!file && !success ? (
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
              Upload File Excel
            </p>
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic opacity-50 text-center">
              Drag & Drop file disini atau klik untuk memilih file
            </p>
            <input
              type="file"
              className="hidden"
              ref={fileInputRef}
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
            />
          </div>
        ) : null}

        {/* Selected File State */}
        {file && !success && (
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

        {/* Success State */}
        {success && (
          <div className="bg-green-500/5 border-2 border-green-500/20 rounded-2xl p-8 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 shadow-xl shadow-green-500/5">
            <div className="bg-green-500 text-white p-4 rounded-2xl mb-4 shadow-lg shadow-green-500/30">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-green-700 uppercase tracking-tight">
              Berhasil!
            </h3>
            <p className="text-[11px] font-bold text-green-600/80 uppercase mt-1">
              Data master karyawan telah diimport ke server.
            </p>
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
        {!success && (
          <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
            <Button
              type="button"
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

export default ImportEmployeeModal;
