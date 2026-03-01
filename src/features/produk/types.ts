export interface KategoriProduk {
  id: number;
  nama_kategori: string;
  deskripsi?: string;
}

export interface Produk {
  id: number;
  kode_barang: string;
  sku: string;
  nama_produk: string;
  id_kategori?: number | null;
  kategori?: KategoriProduk | null;
  harga_jual: string;
  stok_tersedia: number;
  satuan: string;
  gambar_url?: string;
  status?: "aktif" | "non_aktif";
}

export interface ProductFormData {
  kode_barang: string;
  sku: string;
  nama_produk: string;
  id_kategori: string;
  harga_jual: string;
  stok_tersedia: string;
  satuan: string;
}
