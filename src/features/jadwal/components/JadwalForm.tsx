import React, { useState } from 'react';
import { Jadwal, JadwalFormData, KaryawanOption, RuteOption } from '../types';
import toast from 'react-hot-toast';

interface JadwalFormProps {
    onSubmit: (data: JadwalFormData) => void;
    karyawanOptions: KaryawanOption[];
    ruteOptions: RuteOption[];
    initialDate?: string;
    onCancel: () => void;
    loading?: boolean;
    initialData?: Jadwal;
    existingJadwals?: Jadwal[];
} 

const JadwalForm: React.FC<JadwalFormProps> = ({ 
    onSubmit, 
    karyawanOptions, 
    ruteOptions, 
    initialDate, 
    onCancel,
    loading,
    initialData,
    existingJadwals = []
}) => {
    const [formData, setFormData] = useState<JadwalFormData>({
        id_karyawan: initialData?.id_karyawan.toString() || '',
        id_rute: initialData?.id_rute.toString() || '',
        tanggal: initialData?.tanggal || initialDate || new Date().toISOString().slice(0, 10),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Single Schedule Check
        // Check if there is already a schedule for this sales on this date
        // EXCLUDING the current schedule if we are editing
        const isDuplicate = existingJadwals.some(j => 
            j.id_karyawan === Number(formData.id_karyawan) && 
            j.tanggal === formData.tanggal && 
            j.id !== initialData?.id // Ignore self when editing
        );

        if (isDuplicate) {
            toast.error('Sales ini sudah memiliki jadwal pada tanggal tersebut.');
            return;
        }

        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                <input
                    type="date"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-shadow"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Sales</label>
                <select
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-shadow"
                    value={formData.id_karyawan}
                    onChange={(e) => setFormData({ ...formData, id_karyawan: e.target.value })}
                >
                    <option value="">-- Pilih Sales --</option>
                    {karyawanOptions.map(k => (
                        <option key={k.id} value={k.id}>{k.nama_lengkap}</option>
                    ))}
                </select>
                {karyawanOptions.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Pastikan ada karyawan dengan role 'Sales'.</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Pilih Rute</label>
                <select
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-shadow"
                    value={formData.id_rute}
                    onChange={(e) => setFormData({ ...formData, id_rute: e.target.value })}
                >
                    <option value="">-- Pilih Rute --</option>
                    {ruteOptions.map(r => (
                        <option key={r.id} value={r.id}>{r.nama_rute}</option>
                    ))}
                </select>
                {ruteOptions.length === 0 && (
                    <p className="text-xs text-amber-500 mt-1">Belum ada rute tersedia.</p>
                )}
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
                    {loading ? 'Menyimpan...' : (initialData ? 'Update Jadwal' : 'Simpan Jadwal')}
                </button>
            </div>
        </form>
    );
};

export default JadwalForm;
