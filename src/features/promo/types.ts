import { Pelanggan } from "../pelanggan/types";
import { Produk } from "../produk/types";

export interface PromoCluster {
  id: number;
  id_perusahaan: number;
  id_divisi: number | null;
  nama_cluster: string;
  deskripsi: string | null;
  is_aktif: boolean;
  pelanggan_assignments_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PromoClusterPelanggan {
  id: number;
  id_pelanggan: number;
  id_promo_cluster: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  pelanggan?: Pelanggan;
  cluster?: PromoCluster;
}

export interface PromoAturanHarga {
  id: number;
  id_produk: number;
  id_divisi: number | null;
  id_promo_cluster: number | null;
  harga_manual: string | null;
  diskon_persen: string | null;
  tanggal_mulai: string;
  tanggal_akhir: string;
  produk?: Produk;
  cluster?: PromoCluster;
}

export interface PromoGrosir {
  id: number;
  id_produk: number;
  id_divisi: number | null;
  id_promo_cluster: number | null;
  min_qty: number;
  harga_spesial: string | null;
  diskon_persen: string | null;
  tanggal_mulai: string;
  tanggal_akhir: string;
  produk?: Produk;
  cluster?: PromoCluster;
}

export interface PromoHadiah {
  id: number;
  id_divisi: number | null;
  nama_promo: string;
  jenis_pemicu: 'produk' | 'total_nota';
  id_produk_pemicu: number | null;
  min_qty_pemicu: number | null;
  min_amount_pemicu: string | null;
  id_produk_hadiah: number;
  qty_hadiah: number;
  harga_tebus: string;
  tanggal_mulai: string;
  tanggal_akhir: string;
  pemicu?: Produk;
  hadiah?: Produk;
}
