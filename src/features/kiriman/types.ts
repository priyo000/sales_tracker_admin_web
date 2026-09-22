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
  latitude: number | null;
  longitude: number | null;
  no_hp_pribadi?: string | null;
}

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

/** Payload export CSV kompatibel Google My Maps. */
export interface MyMapsCsvRow {
  Nama: string;
  Alamat: string;
  Latitude: number;
  Longitude: number;
  "Kode Pelanggan": string;
  "No HP": string;
}
