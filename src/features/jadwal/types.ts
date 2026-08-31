export interface KaryawanOption {
    id: number;
    nama_lengkap: string;
    kode_karyawan?: string;
    jabatan?: string;
}

export interface RuteOption {
    id: number;
    nama_rute: string;
    details_count?: number;
    details?: RuteDetail[];
}

export interface RuteDetail {
    id: number;
    id_rute: number;
    id_pelanggan: number;
    pelanggan?: unknown;
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

export interface JadwalRecurring {
    id: number;
    id_karyawan: number;
    minggu_ke: number;
    hari: number;
    id_rute: number;
    rute?: RuteOption;
}

/**
 * Konteks minggu berjalan dari backend (GET /jadwal-recurring/week-context).
 *
 * Ditampilkan di UI supaya admin tahu pola mana yang aktif hari ini. Sebelum
 * ada ini, admin mengisi tab "MINGGU 1..4" tanpa cara memverifikasi minggu
 * berjalan — itulah sebabnya bug parity minggu lama tidak terlihat.
 */
export interface WeekContext {
    tanggal: string;
    minggu_ke: number;
    slot_pola: number;
    panjang_siklus: number;
    hari: number;
    nama_hari: string;
    /** 'kalender_kerja' = dari tabel kalender kerja | 'terhitung' = fallback */
    sumber: 'kalender_kerja' | 'terhitung';
    rentang_minggu: { mulai: string; akhir: string };
}

export interface RecurringBulkData {
    id_karyawan: number;
    patterns: {
        minggu_ke: number;
        hari: number;
        id_rute: number | null;
    }[];
}

export interface GroupRuteMingguanDetail {
    id: number;
    id_group: number;
    hari: number;
    id_rute: number;
    rute?: RuteOption;
}

export interface GroupRuteMingguan {
    id: number;
    nama_group: string;
    details: GroupRuteMingguanDetail[];
}

export interface KaryawanGroupRute {
    id: number;
    id_karyawan: number;
    minggu_ke: number;
    id_group_rute: number;
    group_rute?: GroupRuteMingguan;
}
