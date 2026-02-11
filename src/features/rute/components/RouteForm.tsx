import React, { useState } from 'react';
import { Rute, RuteFormData } from '../types';

interface RouteFormProps {
    initialData?: Rute | null;
    onSubmit: (data: RuteFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<RuteFormData>({
        nama_rute: initialData?.nama_rute || '',
        deskripsi: initialData?.deskripsi || '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Nama Rute</label>
                <input
                    name="nama_rute"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.nama_rute}
                    onChange={handleChange}
                    placeholder="Contoh: Rute Senin Barat"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                    name="deskripsi"
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    rows={3}
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Deskripsi wilayah rute..."
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
                    {loading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Buat Rute')}
                </button>
            </div>
        </form>
    );
};

export default RouteForm;
