import React, { useState } from 'react';
import { DivisiFormData } from '../types';

interface DivisionFormProps {
    onSubmit: (data: DivisiFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const DivisionForm: React.FC<DivisionFormProps> = ({ onSubmit, onCancel, loading }) => {
    const [namaDivisi, setNamaDivisi] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ nama_divisi: namaDivisi });
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
                    {loading ? 'Menyimpan...' : 'Tambah Divisi'}
                </button>
            </div>
        </form>
    );
};

export default DivisionForm;
