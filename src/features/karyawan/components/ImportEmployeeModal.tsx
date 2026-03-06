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
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-3.5 w-3.5 text-primary" />
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-primary">
              Panduan Import:
            </h3>
          </div>
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
        </div>

        {/* Dropzone */}
        {!file && !success ? (
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
              Upload File Excel
            </p>
            <p className="text-muted-foreground text-[9px] font-semibold uppercase tracking-widest opacity-60 text-center">
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

        {/* Success State */}
        {success && (
          <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-6 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in-95 shadow-md">
            <div className="bg-green-500 text-white p-3 rounded-xl mb-3 shadow-md">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-green-700 uppercase tracking-tight">
              Berhasil!
            </h3>
            <p className="text-[10px] font-semibold text-green-600/80 uppercase mt-1">
              Data master karyawan telah diimport.
            </p>
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
        {!success && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
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

export default ImportEmployeeModal;
