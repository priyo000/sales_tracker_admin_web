export interface MonitoringStats {
    planned_visited: number;
    planned_total: number;
    unplanned: number;
    out_of_range: number; // Kunjungan dengan jarak checkin yang tidak valid / terlalu jauh
    with_order: number; // Jumlah kunjungan yang menghasilkan pesanan
    sales_total: number; // Total nominal sales order (omset)
}

export interface KaryawanInfo {
    id: number;
    nama_lengkap: string;
    kode_karyawan: string;
}

export interface MonitoringEmployee {
    karyawan: KaryawanInfo;
    stats: MonitoringStats;
    color: string;
}

export interface VisitPoint {
    type: 'planned' | 'planned_visited' | 'unplanned';
    pelanggan: {
        id: number;
        nama_toko: string;
        kode_pelanggan: string;
        alamat: string;
        latitude: string | number;
        longitude: string | number;
        no_telp?: string;
    };
    visit?: {
        id: number;
        waktu_check_in: string; // ISO string
        waktu_check_out?: string;
        durasi_detik?: number;
        jarak_validasi?: number; // meters
        status_kunjungan: string;
        status_transaksi: boolean;
        catatan?: string;
        foto_1_url?: string;
        foto_2_url?: string;
        foto_3_url?: string;
        foto_4_url?: string;
        pesanan?: {
            id: number;
            total_tagihan: number;
            items_count: number;
        };
    };
    status: 'pending' | 'visited' | 'skipped' | 'unplanned';
    employee?: {
        id: number;
        nama_lengkap: string;
        color: string;
    };
}
