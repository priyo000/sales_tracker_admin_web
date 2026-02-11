export interface Perusahaan {
    id: number;
    nama_perusahaan: string;
    alamat: string | null;
    email_kontak: string | null;
    no_telp: string | null;
    logo_url: string | null;
    status_langganan: 'aktif' | 'non_aktif';
    tanggal_bergabung: string | null;
    created_at: string;
    updated_at: string;
}

export interface PerusahaanFormData {
    nama_perusahaan: string;
    alamat?: string;
    email_kontak?: string;
    no_telp?: string;
    status_langganan: 'aktif' | 'non_aktif';
    tanggal_bergabung?: string;
}
