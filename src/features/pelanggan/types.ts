export type PelangganStatus = 'prospect' | 'pending' | 'active' | 'rejected' | 'nonactive';

export interface Pelanggan {
    id: number;
    id_divisi: number;
    kode_pelanggan?: string;
    nama_toko: string;
    nama_pemilik: string;
    alamat_usaha: string;
    no_hp_pribadi: string;
    status: PelangganStatus;
    latitude: number | null;
    longitude: number | null;
    foto_toko_url?: string;
    
    // Additional fields
    no_ktp_pemilik?: string;
    no_npwp_pribadi?: string;
    alamat_rumah_pemilik?: string;
    kota_usaha?: string;
    kecamatan_usaha?: string;
    nama_kontak_person?: string;
    no_hp_kontak?: string;
    cara_pembayaran?: string;
    nama_bank?: string;
    no_rekening?: string;
    atas_nama_rekening?: string;
    top_hari?: number;
    limit_kredit_awal?: number;
    limit_kredit_berjalan?: number;
    sistem_pembayaran?: string;
    catatan_lain?: string;
    
    // Detailed fields
    tempat_lahir_pemilik?: string;
    tanggal_lahir_pemilik?: string;
    kode_pos_rumah?: string;
    kota_rumah?: string;
    
    no_npwp_usaha?: string;
    nama_npwp_usaha?: string;
    klasifikasi_outlet?: string;
    jenis_produk_industri?: string;
    tahun_berdiri?: number;
    
    alamat_gudang?: string;
    kota_gudang?: string;
    no_telp_gudang?: string;
    
    cabang_bank?: string;

    divisi?: {
        id: number;
        nama_divisi: string;
    };
    creator?: {
        id: number;
        nama_lengkap: string;
        kode_karyawan?: string;
    };
    created_at?: string;
    details_rute?: {
        id: number;
        id_rute: number;
        rute?: {
            id: number;
            nama_rute: string;
        }
    }[];
}

export interface PelangganFormData {
    id_sales_pembuat?: number;
    id_divisi: number;
    kode_pelanggan?: string;
    nama_toko: string;
    nama_pemilik: string;
    no_hp_pribadi: string;
    alamat_usaha: string;
    latitude: number;
    longitude: number;
    status: PelangganStatus;
    
    // New fields
    no_ktp_pemilik?: string;
    no_npwp_pribadi?: string;
    alamat_rumah_pemilik?: string;
    kota_usaha?: string;
    kecamatan_usaha?: string;
    nama_kontak_person?: string;
    no_hp_kontak?: string;
    cara_pembayaran?: string;
    nama_bank?: string;
    no_rekening?: string;
    atas_nama_rekening?: string;
    top_hari?: number;
    limit_kredit_awal?: number;
    limit_kredit_berjalan?: number;
    sistem_pembayaran?: string;
    catatan_lain?: string;
    
    // New fields
    tempat_lahir_pemilik?: string;
    tanggal_lahir_pemilik?: string;
    kode_pos_rumah?: string;
    kota_rumah?: string;
    
    no_npwp_usaha?: string;
    nama_npwp_usaha?: string;
    klasifikasi_outlet?: string;
    jenis_produk_industri?: string;
    tahun_berdiri?: number;
    
    alamat_gudang?: string;
    kota_gudang?: string;
    no_telp_gudang?: string;
    
    cabang_bank?: string;

    // File
    foto_toko?: File | null;
}
