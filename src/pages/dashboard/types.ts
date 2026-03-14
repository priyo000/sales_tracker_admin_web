export interface SalesChartData {
    name: string;
    total: number;
}

export interface BestSellingProduct {
    id: number;
    nama_produk: string;
    kode_barang: string;
    total_terjual: number;
}

export interface TopSalesman {
    id: number;
    nama: string;
    total_penjualan: number;
    jumlah_pesanan: number;
}

export interface RecentOrder {
    id: number;
    no_pesanan: string;
    status: string;
    nama_toko: string;
    tanggal: string;
    total_tagihan?: number;
}

export interface DashboardStats {
    total_pesanan: number;
    pesanan_bulan_ini: number;
    orderan_pending_bulan_ini: number;
    total_omset: number;
    total_pelanggan: number;
    total_produk: number;
    total_sales: number;
    total_rute: number;
    pelanggan_baru_bulan_ini: number;
    recent_orders: RecentOrder[];
    sales_chart?: SalesChartData[];
    best_selling_products?: BestSellingProduct[];
    top_salesman?: TopSalesman[];
    omset_mom?: {
        percentage: number;
        is_up: boolean;
    };
    pesanan_mom?: {
        percentage: number;
        is_up: boolean;
    };
    pelanggan_baru_mom?: {
        percentage: number;
        is_up: boolean;
    };
}
