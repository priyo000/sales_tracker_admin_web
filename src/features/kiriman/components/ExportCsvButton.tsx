import React, { useMemo, useState } from "react";
import { FileDown, Info, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import api from "@/services/api";
import type { KirimanDetail, MyMapsCsvRow } from "../types";

interface ExportCsvButtonProps {
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

/**
 * Export daftar kiriman sebagai CSV yang bisa diimport ke Google My Maps
 * (mymaps.google.com): tiap baris jadi pin berdasarkan kolom Latitude/Longitude,
 * atau alamat bila koordinat kosong (geocode My Maps).
 */
const ExportCsvButton: React.FC<ExportCsvButtonProps> = ({
  tanggal,
  details: detailsProp,
  kirimanId,
  disabled,
}) => {
  const [sertakanTanpaKoordinat, setSertakanTanpaKoordinat] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [memuat, setMemuat] = useState(false);

  const details = detailsProp ?? [];

  const jumlahKoordinat = useMemo(
    () => details.filter((d) => d.pelanggan?.latitude != null && d.pelanggan?.longitude != null).length,
    [details],
  );

  const handleExport = async () => {
    // Dipakai dari tabel list: detail belum dimuat → fetch dulu.
    let data = details;
    if (!detailsProp && kirimanId) {
      setMemuat(true);
      try {
        const res = await api.get(`/kiriman/${kirimanId}`);
        data = res.data?.details ?? res.data?.data?.details ?? [];
      } catch {
        setMemuat(false);
        return;
      }
      setMemuat(false);
    }
    const baris: MyMapsCsvRow[] = [];
    for (const d of data) {
      const p = d.pelanggan;
      if (!p) continue;
      const adaKoordinat = p.latitude != null && p.longitude != null;
      if (!adaKoordinat && !sertakanTanpaKoordinat) continue;
      baris.push({
        Nama: p.nama_toko || p.nama_pemilik || `Pelanggan ${p.id}`,
        Alamat: alamatLengkap(d),
        Latitude: adaKoordinat ? (p.latitude as number) : 0,
        Longitude: adaKoordinat ? (p.longitude as number) : 0,
        "Kode Pelanggan": p.kode_pelanggan ?? "",
        "No HP": p.no_hp_pribadi ?? "",
      });
    }

    if (baris.length === 0) {
      return;
    }

    const header = Object.keys(baris[0]);
    const csv = [
      header.join(","),
      ...baris.map((row) => header.map((k) => csvEscape(row[k as keyof MyMapsCsvRow])).join(",")),
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

  const tanpaKoordinat = details.length - jumlahKoordinat;

  return (
    <div className="flex flex-col gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled || (!detailsProp && !kirimanId) || memuat}
        onClick={handleExport}
        className="gap-2"
      >
        {memuat ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="h-4 w-4" />
        )}
        Export CSV{detailsProp ? ` (${jumlahKoordinat} pin)` : ""}
      </Button>

      <button
        type="button"
        onClick={() => setShowHint((s) => !s)}
        className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground w-fit"
      >
        <Info className="h-3 w-3" />
        cara pakai
      </button>
      {showHint && (
        <div className="text-[10px] text-muted-foreground space-y-1 max-w-[240px]">
          <p>
            1. Download CSV → import ke{" "}
            <a
              href="https://www.google.com/mymaps"
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Google My Maps
            </a>{" "}
            (Add layer → Import → pilih kolom Latitude &amp; Longitude).
          </p>
          <p>2. Share peta: &ldquo;Anyone with the link can view&rdquo; → kirim link ke supir.</p>
          <p>
            3. Catatan: pin hasil import tampil di <b>browser</b>, bukan di app
            My Maps mobile.
          </p>
          {tanpaKoordinat > 0 && (
            <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
              <Checkbox
                checked={sertakanTanpaKoordinat}
                onCheckedChange={(v) => setSertakanTanpaKoordinat(v === true)}
              />
              <span>
                Sertakan {tanpaKoordinat} pelanggan tanpa koordinat (di-geocode
                dari alamat)
              </span>
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportCsvButton;
