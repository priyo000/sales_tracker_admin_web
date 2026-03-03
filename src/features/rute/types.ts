export interface Rute {
  id: number;
  id_divisi?: number;
  nama_rute: string;
  deskripsi: string;
  details_count: number;
  divisi?: {
    id: number;
    nama_divisi: string;
  };
  details?: { id: number; id_pelanggan: number; pelanggan?: { id: number } }[];
  created_at?: string;
  updated_at?: string;
}

export interface RuteFormData {
  nama_rute: string;
  deskripsi: string;
  customer_ids: number[];
  id_divisi?: number;
}
