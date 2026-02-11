export interface Karyawan {
    id: number;
    id_perusahaan: number;
    id_divisi: number;
    kode_karyawan?: string;
    nik: string;
    nama_lengkap: string;
    jabatan: string;
    no_hp: string;
    alamat_domisili: string;
    tanggal_bergabung: string;
    foto_profil_url: string;
    status_karyawan: 'aktif' | 'non_aktif';
    email?: string; // This might come from linked user
    divisi?: {
        id: number;
        nama_divisi: string;
    };
    created_at?: string;
    updated_at?: string;
}

export interface KaryawanFormData {
    id_divisi: string;
    kode_karyawan?: string;
    nik: string;
    nama_lengkap: string;
    jabatan: string;
    no_hp: string;
    alamat_domisili: string;
    tanggal_bergabung: string;
    status_karyawan: 'aktif' | 'non_aktif';
    email?: string; // Optional: used for creating user account if needed
}
