export interface KaryawanOption {
    id: number;
    nama_lengkap: string;
    jabatan?: string;
}

export interface RuteOption {
    id: number;
    nama_rute: string;
    details_count?: number;
}

export interface Jadwal {
    id: number;
    tanggal: string;
    id_karyawan: number;
    id_rute: number;
    status: 'pending' | 'ongoing' | 'selesai' | 'dibatalkan';
    karyawan: KaryawanOption;
    rute: RuteOption;
    created_at?: string;
    updated_at?: string;
}

export interface JadwalFormData {
    id_karyawan: string; // Form values are often strings
    id_rute: string;
    tanggal: string;
}
