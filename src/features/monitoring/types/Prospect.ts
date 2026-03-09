export interface ProspectSummary {
  tanggal: string;
  raw_tanggal: string;
  id_karyawan: number;
  nama: string;
  total_prospect: number;
}

export interface ProspectDetail {
  id: number;
  nama_toko: string;
  nama_pemilik: string;
  alamat_usaha: string;
  kecamatan_usaha?: string;
  kota_usaha?: string;
  provinsi_usaha?: string;
  catatan_lain?: string;
  created_at: string;
}
