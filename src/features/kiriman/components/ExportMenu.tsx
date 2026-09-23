import React, { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import api from "@/services/api";
import type { KirimanDetail, MyMapsCsvRow } from "../types";

interface ExportMenuProps {
  tanggal: string;
  /** Detail yang sudah tersedia di memori (mis. saat builder terbuka). */
  details?: KirimanDetail[];
  /** Bila details tidak diset: muat sendiri dari backend (butuh id kiriman). */
  kirimanId?: number;
  disabled?: boolean;
}

/**
 * Escape nilai untuk CSV: bungkus dengan kutip bila mengandung
 * koma/kutip/baris baru, dan gandakan kutip di dalamnya.
 */
const csvEscape = (v: string | number | null | undefined): string => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const alamatLengkap = (d: KirimanDetail): string =>
  [
    d.pelanggan?.alamat_usaha,
    d.pelanggan?.kecamatan_usaha,
    d.pelanggan?.kota_usaha,
  ]
    .filter(Boolean)
    .join(", ");

const barisCsv = (data: KirimanDetail[]): MyMapsCsvRow[] => {
  const baris: MyMapsCsvRow[] = [];
  let urut = 0;
  for (const d of data) {
    const p = d.pelanggan;
    if (!p) continue;
    urut++;
    const adaKoordinat = p.latitude != null && p.longitude != null;
    baris.push({
      No: String(urut),
      Nama: p.nama_toko || p.nama_pemilik || `Pelanggan ${p.id}`,
      Alamat: alamatLengkap(d),
      // Kosong (bukan 0) bila tanpa koordinat — 0,0 jatuh di laut;
      // kosong membuat My Maps menawarkan geocode dari kolom Alamat.
      Latitude: adaKoordinat ? String(p.latitude) : "",
      Longitude: adaKoordinat ? String(p.longitude) : "",
      "Kode Pelanggan": p.kode_pelanggan ?? "",
      "No HP": p.no_hp_pribadi ?? "",
    });
  }
  return baris;
};

const downloadCsv = (baris: MyMapsCsvRow[], tanggal: string) => {
  const header = Object.keys(baris[0]);
  const csv = [
    header.join(","),
    ...baris.map((row) =>
      header.map((k) => csvEscape(row[k as keyof MyMapsCsvRow])).join(","),
    ),
  ].join("\r\n");

  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `kiriman-${tanggal}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Menu export (icon ⋮): CSV untuk Google My Maps dan XLSX dari backend.
 * Panduan import ada di dialog "Cara Pakai", bukan menempel di tombol.
 */
const ExportMenu: React.FC<ExportMenuProps> = ({
  tanggal,
  details: detailsProp,
  kirimanId,
  disabled,
}) => {
  const [showCaraPakai, setShowCaraPakai] = useState(false);
  const [memuat, setMemuat] = useState<"csv" | "xlsx" | null>(null);

  const details = detailsProp ?? [];

  const jumlahKoordinat = useMemo(
    () =>
      details.filter(
        (d) => d.pelanggan?.latitude != null && d.pelanggan?.longitude != null,
      ).length,
    [details],
  );

  /** Ambil detail dari backend bila dipanggil dari tabel list. */
  const muatDetail = async (): Promise<KirimanDetail[] | null> => {
    if (detailsProp) return details;
    if (!kirimanId) return null;
    try {
      const res = await api.get(`/kiriman/${kirimanId}`);
      return res.data?.details ?? res.data?.data?.details ?? [];
    } catch {
      return null;
    }
  };

  const handleExportCsv = async () => {
    setMemuat("csv");
    const data = await muatDetail();
    setMemuat(null);
    if (!data || data.length === 0) return;
    const baris = barisCsv(data);
    if (baris.length === 0) return;
    downloadCsv(baris, tanggal);
  };

  const handleExportXlsx = async () => {
    if (!kirimanId) return;
    setMemuat("xlsx");
    try {
      const response = await api.get(`/kiriman/${kirimanId}/export`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `kiriman-${tanggal}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      // biarkan tombol kembali normal; error terlihat di network tab
    } finally {
      setMemuat(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            title="Export daftar kiriman"
            disabled={disabled || (!detailsProp && !kirimanId) || memuat !== null}
          >
            {memuat ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem onClick={handleExportXlsx} disabled={!kirimanId}>
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>Excel</span>
              <span className="text-[10px] text-muted-foreground">
                daftar + rute asal
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportCsv}>
            <FileText className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>CSV</span>
              <span className="text-[10px] text-muted-foreground">
                untuk Google My Maps{detailsProp ? ` (${jumlahKoordinat} pin)` : ""}
              </span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowCaraPakai(true)}>
            <FileDown className="h-4 w-4 mr-2" />
            Cara pakai
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCaraPakai} onOpenChange={setShowCaraPakai}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cara pakai export kiriman</DialogTitle>
            <DialogDescription>
              Kirim daftar kiriman ke supir lewat Google My Maps.
            </DialogDescription>
          </DialogHeader>
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>
              <b>Export CSV</b> → buka{" "}
              <a
                href="https://www.google.com/mymaps"
                target="_blank"
                rel="noreferrer"
                className="underline text-foreground"
              >
                Google My Maps
              </a>{" "}
              → Create map → <b>Add layer → Import</b> → pilih file CSV.
            </li>
            <li>
              Di wizard: pilih kolom <b>Latitude</b> lalu <b>Longitude</b>{" "}
              sebagai lokasi, kolom <b>Nama</b> sebagai judul pin.
            </li>
            <li>
              Share peta → <b>Anyone with the link can view</b> → kirim link ke
              supir (buka via browser HP).
            </li>
          </ol>
          <div className="text-xs text-muted-foreground border-t pt-2 space-y-1">
            <p>
              <b>Export Excel</b> dipakai untuk arsip/cetak — berisi daftar
              lengkap beserta rute asal tiap pelanggan.
            </p>
            <p>
              Catatan: pin hasil import My Maps tampil di browser, bukan di app
              My Maps mobile.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportMenu;
