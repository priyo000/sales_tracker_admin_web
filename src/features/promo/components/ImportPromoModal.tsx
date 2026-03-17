import React, { useState, useEffect } from "react";
import ImportDataModal, { ImportResult } from "@/components/ui/ImportDataModal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { useAuth } from "@/hooks/useAuth";
import api from "@/services/api";
import { downloadCsvTemplate } from "@/lib/downloadTemplate";

type ImportType = "cluster" | "aturan_harga" | "grosir";

interface ImportPromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  importType: ImportType;
  onSuccess?: () => void;
}

const TEMPLATE_DATA: Record<ImportType, { headers: string[]; rows: string[][] }> = {
  cluster: {
    headers: ['nama_cluster', 'kode_pelanggan', 'deskripsi', 'is_aktif'],
    rows: [
      ['Cluster VIP', 'KP-001', 'Pelanggan VIP Area Barat', 'true'],
      ['Cluster VIP', 'KP-002', '', ''],
      ['Cluster Regular', 'KP-003', 'Pelanggan Regular', 'true'],
    ],
  },
  aturan_harga: {
    headers: ['nama_promo', 'kode_produk', 'harga_manual', 'diskon_persen', 'tanggal_mulai', 'tanggal_akhir', 'nama_cluster'],
    rows: [
      ['Promo Lebaran 2026', 'PRD-001', '15000', '', '2026-04-01', '2026-04-30', 'Cluster VIP'],
      ['Promo Lebaran 2026', 'PRD-002', '', '10', '2026-04-01', '2026-04-30', 'Cluster VIP'],
      ['Diskon Reguler', 'PRD-003', '', '5', '2026-03-01', '2026-03-31', ''],
    ],
  },
  grosir: {
    headers: ['nama_promo', 'kode_produk', 'min_qty', 'harga_spesial', 'diskon_persen', 'tanggal_mulai', 'tanggal_akhir', 'nama_cluster'],
    rows: [
      ['Grosir Maret 2026', 'PRD-001', '10', '12000', '', '2026-03-01', '2026-03-31', ''],
      ['Grosir Maret 2026', 'PRD-001', '50', '10000', '', '2026-03-01', '2026-03-31', ''],
      ['Grosir Maret 2026', 'PRD-002', '20', '', '8', '2026-03-01', '2026-03-31', 'Cluster VIP'],
    ],
  },
};

const IMPORT_CONFIG: Record<
  ImportType,
  {
    title: string;
    endpoint: string;
    columns: string[];
    notes: string[];
  }
> = {
  cluster: {
    title: "Import Promo Cluster",
    endpoint: "/promo-cluster/import",
    columns: [
      "nama_cluster (wajib)",
      "kode_pelanggan (wajib - satu baris per pelanggan)",
      "deskripsi (opsional, cukup isi di baris pertama cluster)",
      "is_aktif (opsional - true/false, default: true)",
    ],
    notes: [
      "Satu baris = satu pelanggan. Untuk cluster dengan banyak anggota, tulis nama_cluster yang sama di setiap baris.",
      "Jika nama_cluster sudah ada, cluster diperbarui dan pelanggan ditambahkan.",
      "Pelanggan yang sudah ada di cluster tidak akan diduplikasi.",
      "kode_pelanggan dicocokkan ke kode pelanggan yang sudah terdaftar.",
    ],
  },
  aturan_harga: {
    title: "Import Aturan Harga & Diskon",
    endpoint: "/promo/aturan-harga/import",
    columns: [
      "nama_promo (wajib)",
      "kode_produk (wajib - kode_barang atau sku)",
      "harga_manual",
      "diskon_persen",
      "tanggal_mulai (wajib)",
      "tanggal_akhir (wajib)",
      "nama_cluster (opsional)",
    ],
    notes: [
      "Baris dengan nama_promo + tanggal yang sama akan dijadikan satu campaign.",
      "Isi salah satu: harga_manual atau diskon_persen.",
      "kode_produk dicocokkan ke kode_barang atau SKU produk.",
      "Format tanggal: YYYY-MM-DD, DD/MM/YYYY, atau gunakan format Date di Excel.",
    ],
  },
  grosir: {
    title: "Import Harga Grosir",
    endpoint: "/promo/grosir/import",
    columns: [
      "nama_promo (wajib)",
      "kode_produk (wajib - kode_barang atau sku)",
      "min_qty (wajib)",
      "harga_spesial",
      "diskon_persen",
      "tanggal_mulai (wajib)",
      "tanggal_akhir (wajib)",
      "nama_cluster (opsional)",
    ],
    notes: [
      "Baris dengan nama_promo + tanggal yang sama dijadikan satu campaign.",
      "Tiap baris = satu tier. Bisa banyak tier per produk per promo.",
      "Isi salah satu: harga_spesial atau diskon_persen.",
      "Format tanggal: YYYY-MM-DD, DD/MM/YYYY, atau gunakan format Date di Excel.",
    ],
  },
};

const ImportPromoModal: React.FC<ImportPromoModalProps> = ({
  isOpen,
  onClose,
  importType,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { divisis, fetchDivisis } = useDivisi();
  const [selectedDivisi, setSelectedDivisi] = useState<string>("");

  const showDivisiSelector =
    user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const config = IMPORT_CONFIG[importType];
  const template = TEMPLATE_DATA[importType];

  const handleDownloadTemplate = () => {
    downloadCsvTemplate(`template_${importType}.csv`, template.headers, template.rows);
  };

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

    const formData = new FormData();
    formData.append("file", file);
    if (selectedDivisi) {
      formData.append("id_divisi", selectedDivisi);
    }

    try {
      const response = await api.post(config.endpoint, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onSuccess?.();
      return {
        success: true,
        message: response.data.message,
        data: response.data,
      };
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      return {
        success: false,
        message: e.response?.data?.message || "Gagal mengimport data.",
      };
    }
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
      title={config.title}
      uploadLabel={`Upload File ${config.title}`}
      accept=".xlsx, .xls, .csv"
      onDownloadTemplate={handleDownloadTemplate}
      failureLabelFn={(fail) =>
        (fail as { nama?: string }).nama || ""
      }
      extraContent={
        showDivisiSelector ? (
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1">
              Divisi Target
            </label>
            <Select value={selectedDivisi} onValueChange={setSelectedDivisi}>
              <SelectTrigger className="w-full bg-card border border-border h-9 rounded-lg shadow-sm">
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
              * Seluruh data dalam file akan dimasukkan ke divisi ini.
            </p>
          </div>
        ) : undefined
      }
      instructions={
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Kolom yang dibutuhkan:
            </p>
            <ul className="text-[10px] text-muted-foreground font-semibold list-none space-y-1">
              {config.columns.map((col, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1 shrink-0" />
                  {col}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Catatan:
            </p>
            <ul className="text-[10px] text-muted-foreground list-none space-y-1">
              {config.notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1 shrink-0" />
                  {note}
                </li>
              ))}
            </ul>
          </div>
        </div>
      }
    />
  );
};

export default ImportPromoModal;
