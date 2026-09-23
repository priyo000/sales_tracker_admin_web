/**
 * Fitur Rute Kiriman — daftar pelanggan yang dikirimi barang per hari (untuk supir).
 */

/** Data pelanggan ringkas yang dikirim backend untuk daftar supir + pin peta. */
export interface KirimanPelanggan {
  id: number;
  kode_pelanggan?: string | null;
  nama_toko: string;
  nama_pemilik?: string | null;
  alamat_usaha?: string | null;
  kecamatan_usaha?: string | null;
  kota_usaha?: string | null;
  /**
   * Postgres decimal tiba sebagai string via JSON ("−7.727…"), jadi
   * JANGAN menjumlah/membandingkan langsung — selalu Number() dulu.
   */
  latitude: number | string | null;
  longitude: number | string | null;
  no_hp_pribadi?: string | null;
}

/** Koordinat ter-normalisasi number (null bila tidak valid). */
export const koordinat = (
  p: { latitude: number | string | null; longitude: number | string | null },
): { lat: number; lng: number } | null => {
  const lat = typeof p.latitude === "string" ? Number(p.latitude) : p.latitude;
  const lng =
    typeof p.longitude === "string" ? Number(p.longitude) : p.longitude;
  if (lat == null || lng == null || Number.isNaN(lat) || Number.isNaN(lng))
    return null;
  return { lat, lng };
};

export interface KirimanDetail {
  id: number;
  id_kiriman: number;
  id_pelanggan: number;
  id_rute_asal: number | null;
  pelanggan?: KirimanPelanggan;
  rute_asal?: { id: number; nama_rute: string } | null;
}

/** Header sesi kiriman. */
export interface Kiriman {
  id: number;
  id_perusahaan: number;
  id_divisi: number;
  tanggal: string;
  keterangan: string | null;
  details_count?: number;
  divisi?: { id: number; nama_divisi: string };
  details?: KirimanDetail[];
}

export interface KirimanFormData {
  tanggal: string;
  keterangan?: string | null;
  rute_ids?: number[];
  pelanggan_ids?: number[];
}

/** Baris CSV export — kompatibel wizard import Google My Maps
 * (baris pertama header, kolom lokasi dipilih saat import: Latitude &
 * Longitude, atau Alamat untuk geocode bila koordinat kosong). */
export interface MyMapsCsvRow {
  No: string;
  Nama: string;
  Alamat: string;
  Latitude: string;
  Longitude: string;
  "Kode Pelanggan": string;
  "No HP": string;
}
