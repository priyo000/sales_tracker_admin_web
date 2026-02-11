export interface ItemPesanan {
    id: number;
    nama_barang: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
}

export interface Pesanan {
    id: number;
    no_pesanan: string;
    tanggal: string;
    nama_toko: string;
    sales: string;
    total_harga: number;
    status: string;
    items?: ItemPesanan[];
    created_at?: string;
    updated_at?: string;
}
