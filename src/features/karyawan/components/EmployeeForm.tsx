import React, { useState } from 'react';
import { Karyawan, KaryawanFormData } from '../types';

interface EmployeeFormProps {
    initialData?: Karyawan | null;
    divisiOptions: { id: number, nama_divisi: string }[];
    onSubmit: (data: KaryawanFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ initialData, divisiOptions, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<KaryawanFormData>({
        kode_karyawan: initialData?.kode_karyawan || '',
        nik: initialData?.nik || '',
        nama_lengkap: initialData?.nama_lengkap || '',
        id_divisi: initialData?.id_divisi?.toString() || (divisiOptions[0]?.id.toString() || ''),
        jabatan: initialData?.jabatan || 'Sales',
        no_hp: initialData?.no_hp || '',
        email: initialData?.email || '',
        alamat_domisili: initialData?.alamat_domisili || '',
        tanggal_bergabung: initialData?.tanggal_bergabung || new Date().toISOString().split('T')[0],
        status_karyawan: initialData?.status_karyawan || 'aktif',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Kode Karyawan</label>
                    <input
                        name="kode_karyawan"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.kode_karyawan}
                        onChange={handleChange}
                        placeholder="Contoh: KYW001"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">NIK (KTP)</label>
                    <input
                        name="nik"
                        type="text"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.nik}
                        onChange={handleChange}
                        placeholder="16 digit NIK"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                    <input
                        name="nama_lengkap"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.nama_lengkap}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Divisi</label>
                    <select
                        name="id_divisi"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.id_divisi}
                        onChange={handleChange}
                    >
                        <option value="">Pilih Divisi</option>
                        {divisiOptions.map(option => (
                            <option key={option.id} value={option.id}>{option.nama_divisi}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                    <select
                        name="jabatan"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.jabatan}
                        onChange={handleChange}
                    >
                        <option value="Sales">Sales</option>
                        <option value="Driver">Driver</option>
                        <option value="Gudang">Gudang</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">No HP</label>
                    <input
                        name="no_hp"
                        type="text"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.no_hp}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                    <input
                        name="email"
                        type="email"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="email@perusahaan.com"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
                    <input
                        name="tanggal_bergabung"
                        type="date"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.tanggal_bergabung}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Status Karyawan</label>
                    <select
                        name="status_karyawan"
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.status_karyawan}
                        onChange={handleChange}
                    >
                        <option value="aktif">Aktif</option>
                        <option value="non_aktif">Non-Aktif</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Alamat Domisili</label>
                <textarea
                    name="alamat_domisili"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={2}
                    value={formData.alamat_domisili}
                    onChange={handleChange}
                />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Karyawan')}
                </button>
            </div>
        </form>
    );
};

export default EmployeeForm;
