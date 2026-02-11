export interface Rute {
    id: number;
    nama_rute: string;
    deskripsi: string;
    details_count: number;
    details?: { id: number; id_pelanggan: number; pelanggan?: { id: number } }[];
    created_at?: string;
    updated_at?: string;
}

export interface RuteFormData {
    nama_rute: string;
    deskripsi: string;
    customer_ids: number[];
}
