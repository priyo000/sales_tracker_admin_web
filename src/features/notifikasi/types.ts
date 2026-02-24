import { Karyawan } from "@/features/karyawan/types";

export interface Notifikasi {
    id: number;
    id_karyawan: number;
    judul: string;
    pesan: string;
    jenis: string;
    is_read: boolean;
    related_id?: string;
    created_at: string;
    updated_at: string;
    karyawan?: Karyawan;
}

export interface NotifikasiFormData {
    target_type: 'specific' | 'all' | 'division';
    id_karyawan?: number;
    id_divisi?: number;
    judul: string;
    pesan: string;
    jenis: string;
}
