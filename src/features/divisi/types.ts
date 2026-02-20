export interface Divisi {
    id: number;
    id_perusahaan: number;
    nama_divisi: string;
    radius_toleransi?: number;
    view_scope?: 'SELF' | 'DIVISION' | 'COMPANY';
    created_at?: string;
    updated_at?: string;
}

export interface DivisiFormData {
    nama_divisi: string;
    radius_toleransi?: number;
    view_scope?: 'SELF' | 'DIVISION' | 'COMPANY';
}
