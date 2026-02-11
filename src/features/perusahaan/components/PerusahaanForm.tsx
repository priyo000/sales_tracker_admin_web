import React, { useState } from 'react';
import { Perusahaan, PerusahaanFormData } from '../types';

interface PerusahaanFormProps {
    initialData?: Perusahaan | null;
    onSubmit: (data: PerusahaanFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
}

const PerusahaanForm: React.FC<PerusahaanFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState<PerusahaanFormData>({
        nama_perusahaan: initialData?.nama_perusahaan || '',
        alamat: initialData?.alamat || '',
        email_kontak: initialData?.email_kontak || '',
        no_telp: initialData?.no_telp || '',
        status_langganan: initialData?.status_langganan || 'aktif',
        tanggal_bergabung: initialData?.tanggal_bergabung || '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Perusahaan</label>
                <input
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.nama_perusahaan}
                    onChange={(e) => setFormData({ ...formData, nama_perusahaan: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Email Kontak</label>
                <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.email_kontak}
                    onChange={(e) => setFormData({ ...formData, email_kontak: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">No. Telepon</label>
                <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.no_telp}
                    onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Status Langganan</label>
                <select
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.status_langganan}
                    onChange={(e) => setFormData({ ...formData, status_langganan: e.target.value as 'aktif' | 'non_aktif' })}
                >
                    <option value="aktif">Aktif</option>
                    <option value="non_aktif">Non Aktif</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Bergabung</label>
                <input
                    type="date"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.tanggal_bergabung || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal_bergabung: e.target.value })}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Alamat</label>
                <textarea
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    disabled={isLoading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                    disabled={isLoading}
                >
                    {isLoading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
};

export default PerusahaanForm;
