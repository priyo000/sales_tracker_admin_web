export interface Rute {
    id: number;
    nama_rute: string;
    deskripsi: string;
    details_count: number;
    created_at?: string;
    updated_at?: string;
}

export interface RuteFormData {
    nama_rute: string;
    deskripsi: string;
}
