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
  divisi?: {
    id: number;
    nama_divisi: string;
  };
  created_at: string;
  updated_at: string;
}

export interface PromoClusterPelanggan {
  id: number;
  id_pelanggan: number;
  id_promo_cluster: number;
  pelanggan?: Pelanggan;
  cluster?: PromoCluster;
}

export interface PromoCampaign {
  id: number;
  nama_promo: string;
  tipe_promo: 'aturan_harga' | 'grosir' | 'hadiah';
  tanggal_mulai: string;
  tanggal_akhir: string;
  id_promo_cluster: number | null;
  status?: 'PENDING' | 'BERLANGSUNG' | 'BATAL' | 'SELESAI';
  items_count?: number;
  products_summary?: string;
  pemicu_summary?: string;
  cluster?: PromoCluster;
  hadiah?: Produk;
  qty_hadiah?: number;
  min_qty?: number;
  diskon_persen?: string | null;
  harga_spesial?: string | null;
  harga_tebus?: string;
  min_amount_pemicu?: string | null;
  min_qty_pemicu?: number | null;
  jenis_pemicu?: string;
  items?: (PromoAturanHarga | PromoGrosir | PromoHadiah)[];
  jenis_promo?: string;
  is_campaign?: boolean;
  is_multi_tier?: boolean;
  divisi?: {
    id: number;
    nama_divisi: string;
  };
}

export interface PromoAturanHarga {
  id: number;
  nama_promo?: string;
  id_promo_campaign: number | null;
  id_produk: number;
  id_divisi: number | null;
  id_promo_cluster: number | null;
  harga_manual: string | null;
  diskon_persen: string | null;
  tanggal_mulai: string;
  tanggal_akhir: string;
  produk?: Produk;
  cluster?: PromoCluster;
  divisi?: {
    id: number;
    nama_divisi: string;
  };
}

export interface PromoGrosir {
  id: number;
  nama_promo?: string;
  id_promo_campaign: number | null;
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
  divisi?: {
    id: number;
    nama_divisi: string;
  };
}

export interface PromoHadiah {
  id: number;
  id_promo_campaign: number | null;
  id_divisi: number | null;
  id_promo_cluster: number | null;
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
  cluster?: PromoCluster;
  divisi?: {
    id: number;
    nama_divisi: string;
  };
}
