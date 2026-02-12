import React, { useState } from 'react';
import { Store, MapPin, User, CreditCard, Landmark, Phone, LucideIcon, Upload, Image, X, Shield, Briefcase } from 'lucide-react';
import { Pelanggan, PelangganFormData } from '../types';
import MapPicker from './MapPicker';
import { cn } from '@/lib/utils';
import { usePelanggan } from '../hooks/usePelanggan';

interface CustomerFormProps {
    initialData?: Pelanggan | null;
    onSubmit: (data: PelangganFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ icon: Icon, title }) => (
    <div className="flex items-center space-x-2 border-b border-gray-200 pb-2 mb-4">
        <Icon className="h-5 w-5 text-indigo-600" />
        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">{title}</h3>
    </div>
);

const FormField = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
    <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {children}
    </div>
);

const CustomerForm: React.FC<CustomerFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [activeTab, setActiveTab] = useState<'pemilik' | 'usaha' | 'pembayaran'>('pemilik');
    const [imagePreview, setImagePreview] = useState<string | null>(initialData?.foto_toko_url || null);
    
    const [formData, setFormData] = useState<PelangganFormData>({
        nama_toko: initialData?.nama_toko || '',
        kode_pelanggan: initialData?.kode_pelanggan || '',
        nama_pemilik: initialData?.nama_pemilik || '',
        no_hp_pribadi: initialData?.no_hp_pribadi || '',
        alamat_usaha: initialData?.alamat_usaha || '',
        id_divisi: initialData?.id_divisi || 0,
        latitude: initialData?.latitude ? Number(initialData.latitude) : -6.200000,
        longitude: initialData?.longitude ? Number(initialData.longitude) : 106.816666,
        status: initialData?.status || 'active',
        no_ktp_pemilik: initialData?.no_ktp_pemilik || '',
        no_npwp_pribadi: initialData?.no_npwp_pribadi || '',
        alamat_rumah_pemilik: initialData?.alamat_rumah_pemilik || '',
        tempat_lahir_pemilik: initialData?.tempat_lahir_pemilik || '',
        tanggal_lahir_pemilik: initialData?.tanggal_lahir_pemilik || '',
        kode_pos_rumah: initialData?.kode_pos_rumah || '',
        kota_rumah: initialData?.kota_rumah || '',
        kota_usaha: initialData?.kota_usaha || '',
        kecamatan_usaha: initialData?.kecamatan_usaha || '',
        nama_kontak_person: initialData?.nama_kontak_person || '',
        no_hp_kontak: initialData?.no_hp_kontak || '',
        cara_pembayaran: initialData?.cara_pembayaran || 'Tunai',
        nama_bank: initialData?.nama_bank || '',
        cabang_bank: initialData?.cabang_bank || '',
        no_rekening: initialData?.no_rekening || '',
        atas_nama_rekening: initialData?.atas_nama_rekening || '',
        top_hari: initialData?.top_hari || 0,
        limit_kredit_awal: initialData?.limit_kredit_awal || 0,
        no_npwp_usaha: initialData?.no_npwp_usaha || '',
        nama_npwp_usaha: initialData?.nama_npwp_usaha || '',
        klasifikasi_outlet: initialData?.klasifikasi_outlet || '',
        jenis_produk_industri: initialData?.jenis_produk_industri || '',
        tahun_berdiri: initialData?.tahun_berdiri || undefined,
        alamat_gudang: initialData?.alamat_gudang || '',
        kota_gudang: initialData?.kota_gudang || '',
        no_telp_gudang: initialData?.no_telp_gudang || '',
        sistem_pembayaran: initialData?.sistem_pembayaran || '',
        catatan_lain: initialData?.catatan_lain || '',
        foto_toko: null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: (name === 'id_divisi' || name === 'top_hari' || name === 'limit_kredit_awal' || name === 'tahun_berdiri') 
                ? parseFloat(value) || 0 
                : value
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({ ...prev, foto_toko: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    interface FilterOption {
        id: number;
        nama_lengkap: string;
        jabatan?: string;
        has_account: boolean;
        has_data: boolean;
    }

    const { fetchFilterOptions } = usePelanggan();
    const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);

    React.useEffect(() => {
        const loadOptions = async () => {
            const options = await fetchFilterOptions();
            setFilterOptions(options);
        };
        loadOptions();
    }, [fetchFilterOptions]);

    const handleSalesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const karyawanId = Number(e.target.value);
        // Find selection in options to maybe show more info, but ID is enough for state
        
        setFormData(prev => ({
            ...prev,
            id_sales_pembuat: karyawanId,
        }));
    };

    const handleLocationChange = (lat: number, lng: number, address?: string, city?: string, district?: string) => {
        setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng,
            alamat_usaha: address || prev.alamat_usaha,
            kota_usaha: city || prev.kota_usaha,
            kecamatan_usaha: district || prev.kecamatan_usaha
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const inputClasses = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-white text-gray-900";

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-[80vh] bg-white">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 px-6 pt-2 bg-gray-50 shrink-0">
                {(['pemilik', 'usaha', 'pembayaran'] as const).map((id) => {
                    const tab = {
                        pemilik: { label: 'Informasi Pemilik', icon: User },
                        usaha: { label: 'Informasi Usaha', icon: Store },
                        pembayaran: { label: 'Pembayaran', icon: CreditCard },
                    }[id];
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setActiveTab(id)}
                            className={cn(
                                "flex items-center space-x-2 px-6 py-3 text-sm font-semibold border-b-2 transition-colors",
                                activeTab === id
                                    ? "border-indigo-600 text-indigo-600"
                                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            )}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Form Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
                {activeTab === 'pemilik' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                        <div className="space-y-6">

                            <div>
                                <SectionHeader icon={User} title="Data Pemilik" />
                                <div className="space-y-4">
                                    <FormField label="Nama Lengkap Pemilik" required>
                                        <input name="nama_pemilik" required value={formData.nama_pemilik} onChange={handleChange} className={inputClasses} placeholder="Sesuai KTP" />
                                    </FormField>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="No HP / WhatsApp" required>
                                            <input name="no_hp_pribadi" required value={formData.no_hp_pribadi} onChange={handleChange} className={inputClasses} placeholder="08xxx" />
                                        </FormField>
                                        <FormField label="No KTP">
                                            <input name="no_ktp_pemilik" value={formData.no_ktp_pemilik} onChange={handleChange} className={inputClasses} placeholder="320..." />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Tempat Lahir">
                                            <input name="tempat_lahir_pemilik" value={formData.tempat_lahir_pemilik} onChange={handleChange} className={inputClasses} placeholder="Jakarta" />
                                        </FormField>
                                        <FormField label="Tanggal Lahir">
                                            <input type="date" name="tanggal_lahir_pemilik" value={formData.tanggal_lahir_pemilik} onChange={handleChange} className={inputClasses} />
                                        </FormField>
                                    </div>

                                    <FormField label="NPWP Pribadi">
                                        <input name="no_npwp_pribadi" value={formData.no_npwp_pribadi} onChange={handleChange} className={inputClasses} placeholder="00.000..." />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <SectionHeader icon={MapPin} title="Alamat Rumah Pemilik" />
                                <div className="space-y-4">
                                    <FormField label="Alamat Rumah">
                                        <textarea name="alamat_rumah_pemilik" rows={3} value={formData.alamat_rumah_pemilik} onChange={handleChange} className={inputClasses} placeholder="Alamat rumah pemilik..." />
                                    </FormField>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField label="Kota">
                                            <input name="kota_rumah" value={formData.kota_rumah} onChange={handleChange} className={inputClasses} placeholder="Jakarta" />
                                        </FormField>
                                        <FormField label="Kode Pos">
                                            <input name="kode_pos_rumah" value={formData.kode_pos_rumah} onChange={handleChange} className={inputClasses} placeholder="12345" />
                                        </FormField>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <SectionHeader icon={Phone} title="Kontak Person (PIC)" />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField label="Nama PIC">
                                        <input name="nama_kontak_person" value={formData.nama_kontak_person} onChange={handleChange} className={inputClasses} placeholder="PIC Gudang" />
                                    </FormField>
                                    <FormField label="No HP PIC">
                                        <input name="no_hp_kontak" value={formData.no_hp_kontak} onChange={handleChange} className={inputClasses} placeholder="08xxx" />
                                    </FormField>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'usaha' && (
                    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
                        {/* Row 1: Data Toko (Left) + Foto Toko (Right) */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Data Toko */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="flex items-center space-x-2 mb-5 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Store className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Data Toko</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Nama Toko" required>
                                            <input name="nama_toko" required value={formData.nama_toko} onChange={handleChange} className={inputClasses} placeholder="Toko Berkah Jaya" />
                                        </FormField>
                                        <FormField label="Kode Pelanggan">
                                            <input 
                                                name="kode_pelanggan" 
                                                value={formData.kode_pelanggan} 
                                                onChange={handleChange} 
                                                className={cn(inputClasses, "bg-gray-50 font-mono")} 
                                                placeholder="Auto-generated if empty" 
                                            />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="NPWP Usaha">
                                            <input name="no_npwp_usaha" value={formData.no_npwp_usaha} onChange={handleChange} className={inputClasses} placeholder="00.000.000.0-000.000" />
                                        </FormField>
                                        <FormField label="Tahun Berdiri">
                                            <input type="number" name="tahun_berdiri" value={formData.tahun_berdiri || ''} onChange={handleChange} className={inputClasses} placeholder="2020" />
                                        </FormField>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Status">
                                            <select name="status" value={formData.status} onChange={handleChange} className={inputClasses}>
                                                <option value="active">Aktif</option>
                                                <option value="pending">Pending</option>
                                                <option value="prospect">Prospek</option>
                                                <option value="nonactive">Non-Active</option>
                                                <option value="rejected">Ditolak</option>
                                            </select>
                                        </FormField>
                                        <FormField label="Klasifikasi Outlet">
                                            <select name="klasifikasi_outlet" value={formData.klasifikasi_outlet} onChange={handleChange} className={inputClasses}>
                                                <option value="">Pilih Klasifikasi...</option>
                                                <option value="Modern Bakery">Modern Bakery</option>
                                                <option value="Big Industry">Big Industry</option>
                                                <option value="Medium Industry">Medium Industry</option>
                                                <option value="Home Industry">Home Industry</option>
                                                <option value="P & D">P & D</option>
                                                <option value="Toko Bahan Kue">Toko Bahan Kue</option>
                                                <option value="Grosir">Grosir</option>
                                                <option value="Retailer">Retailer</option>
                                                <option value="Mini Market">Mini Market</option>
                                                <option value="Supermarket">Supermarket</option>
                                                <option value="Restoran">Restoran</option>
                                                <option value="Hotel">Hotel</option>
                                                <option value="Kafe">Kafe</option>
                                                <option value="Catering">Catering</option>
                                                <option value="Lain-lain">Lain-lain</option>
                                            </select>
                                        </FormField>
                                    </div>
                                </div>
                            </div>

                            {/* Foto Toko */}
                            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                                <div className="flex items-center space-x-2 mb-5 pb-4 border-b border-gray-200">
                                    <div className="p-2 bg-indigo-100 rounded-lg">
                                        <Image className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900">Foto Toko</h3>
                                </div>
                                
                                <div className="space-y-4">
                                    {imagePreview && (
                                        <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200 shadow-sm group">
                                            <img src={imagePreview} alt="Preview Toko" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setImagePreview(null);
                                                    setFormData({ ...formData, foto_toko: null });
                                                }}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100"
                                                title="Hapus foto"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    )}
                                    {!imagePreview && (
                                        <label className="flex flex-col items-center justify-center w-full h-64 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all hover:border-indigo-400">
                                            <Upload className="w-12 h-12 mb-3 text-indigo-600" />
                                            <span className="text-indigo-600 font-semibold text-base">Upload Foto Toko</span>
                                            <span className="text-xs text-gray-500 mt-1">JPG, PNG - Maksimal 5MB</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                        </label>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Row 2: Alamat Usaha & Gudang (Map Left + Form Right) */}
                        <div className="grid grid-cols-1 gap-6">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                            <div className="flex items-center space-x-2 mb-5 pb-4 border-b border-gray-200">
                                <div className="p-2 bg-indigo-100 rounded-lg">
                                    <MapPin className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Alamat Usaha & Gudang</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Map - Left */}
                                <div>
                                    <MapPicker lat={formData.latitude} lng={formData.longitude} onChange={handleLocationChange} height="h-96" />
                                </div>

                                {/* Form Fields - Right */}
                                <div className="space-y-6">
                                    {/* Alamat Usaha Section */}
                                    <div className="space-y-4">
                                        {/* Koordinat GPS */}
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-500 mb-1">Latitude</span>
                                                <span className="font-mono text-indigo-600 font-semibold">{formData.latitude.toFixed(6)}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-500 mb-1">Longitude</span>
                                                <span className="font-mono text-indigo-600 font-semibold">{formData.longitude.toFixed(6)}</span>
                                            </div>
                                        </div>
                                        
                                        <FormField label="Alamat Lengkap" required>
                                            <textarea name="alamat_usaha" required rows={3} value={formData.alamat_usaha} onChange={handleChange} className={inputClasses} placeholder="Jalan, Nomor, RT/RW, Kelurahan..." />
                                        </FormField>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Kecamatan">
                                                <input name="kecamatan_usaha" value={formData.kecamatan_usaha} onChange={handleChange} className={inputClasses} placeholder="Tegalsari" />
                                            </FormField>
                                            <FormField label="Kota">
                                                <input name="kota_usaha" value={formData.kota_usaha} onChange={handleChange} className={inputClasses} placeholder="Surabaya" />
                                            </FormField>
                                        </div>
                                    </div>

                                    {/* Alamat Gudang Section */}
                                    <div className="space-y-4 pt-4 border-t border-gray-200">
                                        {/* <div className="flex items-center space-x-2 pb-2 border-b border-gray-200">
                                            <div className="h-2 w-2 bg-gray-400 rounded-full"></div>
                                            <h4 className="text-sm font-semibold text-gray-900">Alamat Gudang</h4>
                                            <span className="text-xs text-gray-500 italic">(Opsional)</span>
                                        </div> */}
                                        
                                        <FormField label="Alamat Gudang (Opsional)">
                                            <textarea name="alamat_gudang" rows={2} value={formData.alamat_gudang} onChange={handleChange} className={inputClasses} placeholder="Kosongkan jika sama dengan alamat usaha..." />
                                        </FormField>
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Kota">
                                                <input name="kota_gudang" value={formData.kota_gudang} onChange={handleChange} className={inputClasses} placeholder="Kota" />
                                            </FormField>
                                            <FormField label="Telepon">
                                                <input name="no_telp_gudang" value={formData.no_telp_gudang} onChange={handleChange} className={inputClasses} placeholder="021-xxx-xxxx" />
                                            </FormField>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pembayaran' && (
                    <div className="space-y-8 animate-in fade-in duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                        {/* Left Column: Payment Config */}
                        <div className="space-y-6">

                            <SectionHeader icon={Landmark} title="Metode Pembayaran" />
                            <div className="space-y-5">
                                {/* Payment Methods Section */}
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                                    <FormField label="Metode Pembayaran">
                                        <select 
                                            name="cara_pembayaran" 
                                            value={formData.cara_pembayaran} 
                                            onChange={handleChange} 
                                            className={inputClasses}
                                        >
                                            <option value="Tunai">Tunai</option>
                                            <option value="Transfer">Transfer</option>
                                            <option value="Giro">Giro</option>
                                        </select>
                                    </FormField>
                                </div>

                                {/* Conditional Bank Details */}
                                {(formData.cara_pembayaran === 'Transfer' || formData.cara_pembayaran === 'Giro') && (
                                    <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <h4 className="text-sm font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                            <Landmark className="h-4 w-4" />
                                            Detail Rekening Bank
                                        </h4>
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="Nama Bank">
                                                    <input name="nama_bank" value={formData.nama_bank} onChange={handleChange} className={inputClasses} placeholder="Cth: BCA" />
                                                </FormField>
                                                <FormField label="Cabang Bank">
                                                    <input name="cabang_bank" value={formData.cabang_bank} onChange={handleChange} className={inputClasses} placeholder="Cth: KCP Surabaya" />
                                                </FormField>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <FormField label="No Rekening">
                                                    <input name="no_rekening" value={formData.no_rekening} onChange={handleChange} className={inputClasses} placeholder="000-000..." />
                                                </FormField>
                                                <FormField label="Atas Nama">
                                                    <input name="atas_nama_rekening" value={formData.atas_nama_rekening} onChange={handleChange} className={inputClasses} placeholder="Nama Pemilik" />
                                                </FormField>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column: Credit & Notes */}
                        <div className="space-y-6">
                            <SectionHeader icon={CreditCard} title="Sistem & Kredit" />
                            <div className="space-y-5">
                                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                    <FormField label="Sistem Pembayaran">
                                        <select 
                                            name="sistem_pembayaran" 
                                            value={formData.sistem_pembayaran} 
                                            onChange={handleChange} 
                                            className={inputClasses}
                                        >
                                            <option value="">Pilih Sistem...</option>
                                            <option value="Cash">Cash (Tunai)</option>
                                            <option value="Kredit">Kredit (Tempo)</option>
                                        </select>
                                    </FormField>
                                </div>

                                {/* Conditional Credit Settings */}
                                {formData.sistem_pembayaran === 'Kredit' ? (
                                    <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-200 animate-in slide-in-from-top-2 fade-in duration-300">
                                        <h4 className="text-sm font-semibold text-yellow-800 mb-4 flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Limit Kredit & Term of Payment
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField label="Limit Kredit Awal">
                                                <div className="relative">
                                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500 sm:text-sm font-medium">Rp</span>
                                                    <input 
                                                        type="number" 
                                                        name="limit_kredit_awal" 
                                                        value={formData.limit_kredit_awal} 
                                                        onChange={handleChange} 
                                                        className={`${inputClasses} pl-10`} 
                                                        placeholder="0" 
                                                    />
                                                </div>
                                            </FormField>
                                            <FormField label="Term (TOP)">
                                                <div className="relative">
                                                    <input 
                                                        type="number" 
                                                        name="top_hari" 
                                                        value={formData.top_hari} 
                                                        onChange={handleChange} 
                                                        className={`${inputClasses} pr-12`} 
                                                        placeholder="0" 
                                                    />
                                                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 sm:text-sm font-medium">Hari</span>
                                                </div>
                                            </FormField>
                                        </div>
                                        <p className="text-xs text-yellow-700 mt-3 leading-relaxed bg-yellow-100/50 p-2 rounded">
                                            <span className="font-semibold">Note:</span> Limit dan TOP ini adalah pengajuan awal. Approval final dilakukan oleh Admin Keuangan.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-green-100 rounded-lg shrink-0">
                                                <Shield className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-semibold text-green-900">Pembayaran Cash / Tunai</h4>
                                                <p className="text-xs text-green-700 mt-1">
                                                    Pelanggan dengan sistem pembayaran Cash tidak memerlukan pengaturan Limit Kredit dan Term of Payment (TOP).
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <FormField label="Catatan Tambahan">
                                        <textarea 
                                            name="catatan_lain" 
                                            rows={4} 
                                            value={formData.catatan_lain} 
                                            onChange={handleChange} 
                                            className={inputClasses} 
                                            placeholder="Catatan khusus untuk pelanggan ini (misal: jam pengiriman khusus, preferensi kontak, dll)..." 
                                        />
                                    </FormField>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sales Section Full Width at Bottom */}
                    <div className="border-t border-gray-200 pt-8">
                        <SectionHeader icon={Briefcase} title="Data Sales & Penugasan" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                            <FormField label="Sales / Penanggung Jawab">
                                <select 
                                    name="id_sales_pembuat" 
                                    value={formData.id_sales_pembuat || ''} 
                                    onChange={handleSalesChange} 
                                    className={inputClasses}
                                >
                                    <option value="">-- Pilih Sales Representative --</option>
                                    {filterOptions.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.nama_lengkap} 
                                            {!opt.has_account ? ' (No Account)' : ''}
                                            {opt.jabatan ? ` - ${opt.jabatan}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </FormField>

                            <FormField label="Info Karyawan">
                                <div className="mt-1 px-4 py-2 bg-white/60 border border-indigo-200 rounded-md text-indigo-700 font-medium">
                                    {filterOptions.find(o => o.id === formData.id_sales_pembuat)?.jabatan || 'Pilih sales untuk melihat detail'}
                                </div>
                            </FormField>
                        </div>
                    </div>
                </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end border-t border-gray-200 p-6 space-x-3 bg-gray-50 shrink-0">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-400 flex items-center"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Menyimpan...
                        </>
                    ) : (
                        'Simpan Pelanggan'
                    )}
                </button>
            </div>
        </form>
    );
};

export default CustomerForm;
