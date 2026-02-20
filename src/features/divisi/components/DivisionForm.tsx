import React, { useState, useEffect } from 'react';
import { DivisiFormData } from '../types';

interface DivisionFormProps {
    initialData?: DivisiFormData;
    onSubmit: (data: DivisiFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const DivisionForm: React.FC<DivisionFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const [namaDivisi, setNamaDivisi] = useState(initialData?.nama_divisi || '');
    const [radiusToleransi, setRadiusToleransi] = useState(initialData?.radius_toleransi || 100);
    const [viewScope, setViewScope] = useState<'SELF' | 'DIVISION' | 'COMPANY'>(initialData?.view_scope || 'SELF');

    useEffect(() => {
        if (initialData) {
            setNamaDivisi(initialData.nama_divisi);
            setRadiusToleransi(initialData.radius_toleransi || 100);
            setViewScope(initialData.view_scope || 'SELF');
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ 
            nama_divisi: namaDivisi,
            radius_toleransi: radiusToleransi,
            view_scope: viewScope
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Divisi</label>
                <input
                    type="text"
                    required
                    className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                    placeholder="Contoh: Sales & Marketing, Gudang, Logistik..."
                    value={namaDivisi}
                    onChange={(e) => setNamaDivisi(e.target.value)}
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jarak Toleransi Check-in (Meter)</label>
                <div className="relative">
                    <input
                        type="number"
                        min="0"
                        className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all pr-12"
                        placeholder="Contoh: 100"
                        value={radiusToleransi}
                        onChange={(e) => setRadiusToleransi(Number(e.target.value))}
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-500 sm:text-sm">meter</span>
                    </div>
                </div>
                <p className="mt-1 text-xs text-gray-500">Maksimal jarak yang diperbolehkan saat sales check-in di toko.</p>
            </div>

            <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Jangkauan Data Pelanggan</label>
                <div className="grid grid-cols-1 gap-2">
                    <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${viewScope === 'SELF' ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                        <input
                            type="radio"
                            name="view_scope"
                            value="SELF"
                            checked={viewScope === 'SELF'}
                            onChange={() => setViewScope('SELF')}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Hanya Diri Sendiri</span>
                            <span className="block text-xs text-gray-500">Sales hanya dapat melihat pelanggan yang dibuat oleh dirinya sendiri.</span>
                        </div>
                    </label>

                    <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${viewScope === 'DIVISION' ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                        <input
                            type="radio"
                            name="view_scope"
                            value="DIVISION"
                            checked={viewScope === 'DIVISION'}
                            onChange={() => setViewScope('DIVISION')}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Satu Divisi</span>
                            <span className="block text-xs text-gray-500">Sales dapat melihat pelanggan milik semua sales dalam satu divisi yang sama.</span>
                        </div>
                    </label>

                    <label className={`flex items-start p-3 border rounded-lg cursor-pointer transition-all ${viewScope === 'COMPANY' ? 'bg-indigo-50 border-indigo-500' : 'hover:bg-gray-50 border-gray-200'}`}>
                        <input
                            type="radio"
                            name="view_scope"
                            value="COMPANY"
                            checked={viewScope === 'COMPANY'}
                            onChange={() => setViewScope('COMPANY')}
                            className="mt-1 h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                        />
                        <div className="ml-3">
                            <span className="block text-sm font-medium text-gray-900">Satu Perusahaan</span>
                            <span className="block text-xs text-gray-500">Sales dapat melihat semua data pelanggan dalam perusahaan ini.</span>
                        </div>
                    </label>
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none transition-colors"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="flex justify-center rounded-lg border border-transparent bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none disabled:opacity-50 transition-all active:scale-95"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : (initialData ? 'Simpan Perubahan' : 'Tambah Divisi')}
                </button>
            </div>
        </form>
    );
};

export default DivisionForm;
