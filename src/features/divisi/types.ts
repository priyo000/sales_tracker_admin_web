export interface Divisi {
    id: number;
    id_perusahaan: number;
    nama_divisi: string;
    created_at?: string;
    updated_at?: string;
}

export interface DivisiFormData {
    nama_divisi: string;
}
