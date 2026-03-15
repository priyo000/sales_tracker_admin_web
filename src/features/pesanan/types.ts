export interface ItemPesanan {
    id: number;
    id_produk: number;
    nama_barang?: string;
    produk?: {
        nama_produk: string;
        satuan: string;
        sku?: string;
    };
    jumlah: number;
    jumlah_pesanan?: number;
    harga_satuan: number;
    total_harga: number;
    is_hadiah?: boolean;
    harga_tebus?: number | string;
    keterangan?: string;
}

export interface Pesanan {
    id: number;
    no_pesanan: string;
    tanggal_transaksi: string;
    id_pelanggan: number;
    pelanggan?: {
        nama_toko: string;
        kode_pelanggan: string;
        alamat?: string;
        limit_kredit_berjalan?: number | string;
    };
    id_karyawan: number;
    karyawan?: {
        nama_lengkap: string;
    };
    total_tagihan: number | string;
    status: string;
    waktu_proses?: string;
    waktu_kirim?: string;
    waktu_selesai?: string;
    waktu_batal?: string;
    catatan?: string;
    id_promo_campaign?: number | null;
    nama_promo?: string | null;
    diskon_total?: number | string | null;
    items?: ItemPesanan[];
    created_at?: string;
    updated_at?: string;
}

export interface UpdatePesananData {
    items: {
        id_produk: number;
        jumlah: number;
        jumlah_pesanan?: number;
        harga_satuan: number;
    }[];
    catatan?: string;
}
