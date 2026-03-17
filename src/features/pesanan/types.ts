export interface PesananPromo {
    id: number;
    id_pesanan: number;
    id_promo_campaign: number;
    nama_promo: string;
    jenis: 'aturan_harga' | 'grosir' | 'hadiah' | 'hadiah_nota';
    id_produk?: number | null;
    diskon_amount: number | string;
}

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
    promos?: PesananPromo[];
    items?: ItemPesanan[];
    created_at?: string;
    updated_at?: string;
}

export interface PromoAppliedPayload {
    id_campaign: number;
    nama_promo: string;
    jenis: 'aturan_harga' | 'grosir' | 'hadiah' | 'hadiah_nota';
    id_produk: number | null;
    diskon_amount: number;
}

export interface HadiahDitebusPayload {
    id_campaign: number;
    nama_promo: string;
    id_produk_hadiah: number;
    qty: number;
    harga_tebus: number;
}

export interface UpdatePesananData {
    items: {
        id_produk: number;
        jumlah: number;
        jumlah_pesanan?: number;
        harga_satuan: number;
    }[];
    catatan?: string;
    promos_applied?: PromoAppliedPayload[];
    hadiah_ditebus?: HadiahDitebusPayload[];
}

// Promo available per pelanggan (dari endpoint /promo/available)
export interface AvailablePromoItem {
    id_produk: number;
    nama_produk?: string;
    harga_normal: number;
    harga_manual?: number | null;
    diskon_persen?: number | null;
    tiers?: { min_qty: number; harga_spesial?: number | null; diskon_persen?: number | null; }[];
}

export interface AvailablePromo {
    id_campaign: number;
    nama_promo: string;
    jenis: 'aturan_harga' | 'grosir' | 'hadiah' | 'hadiah_nota';
    tanggal_mulai?: string;
    tanggal_akhir?: string;
    items: AvailablePromoItem[];
}

export interface AvailablePromos {
    synced_at: string;
    aturan_harga: AvailablePromo[];
    grosir: AvailablePromo[];
    hadiah: AvailablePromoHadiah[];
}

export interface AvailablePromoHadiah {
    id_campaign: number;
    nama_promo: string;
    jenis: 'hadiah';
    items: {
        id: number;
        jenis_pemicu: 'produk' | 'total_nota';
        id_produk_pemicu?: number | null;
        nama_produk_pemicu?: string | null;
        min_qty_pemicu?: number | null;
        min_amount_pemicu?: number | null;
        produk_hadiah: { id: number; nama_produk?: string; };
        qty_hadiah: number;
        harga_tebus: number;
    }[];
}
