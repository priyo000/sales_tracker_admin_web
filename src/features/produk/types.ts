export interface Produk {
    id: number;
    kode_barang: string;
    sku: string;
    nama_produk: string;
    kategori?: string;
    harga_jual: string;
    stok_tersedia: number;
    satuan: string;
    gambar_url?: string;
}

export interface ProductFormData {
    kode_barang: string;
    sku: string;
    nama_produk: string;
    kategori: string;
    harga_jual: string;
    stok_tersedia: string;
    satuan: string;
}
