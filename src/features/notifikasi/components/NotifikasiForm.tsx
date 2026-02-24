import React, { useState, useEffect } from 'react';
import { NotifikasiFormData } from '../types';
import { useKaryawan } from '@/features/karyawan/hooks/useKaryawan';
import { useDivisi } from '@/features/divisi/hooks/useDivisi';
import { Karyawan } from '@/features/karyawan/types';
import { Divisi } from '@/features/divisi/types';

interface NotifikasiFormProps {
    onSubmit: (data: NotifikasiFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const NotifikasiForm: React.FC<NotifikasiFormProps> = ({ onSubmit, onCancel, loading }) => {
    const { karyawans, fetchKaryawans } = useKaryawan();
    const { divisis, fetchDivisis } = useDivisi();

    const [targetType, setTargetType] = useState<'specific' | 'all' | 'division'>('all');
    const [idKaryawan, setIdKaryawan] = useState<number | undefined>(undefined);
    const [idDivisi, setIdDivisi] = useState<number | undefined>(undefined);
    const [judul, setJudul] = useState('');
    const [pesan, setPesan] = useState('');
    const [jenis, setJenis] = useState('info');

    useEffect(() => {
        fetchKaryawans();
        fetchDivisis();
    }, [fetchKaryawans, fetchDivisis]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            target_type: targetType,
            id_karyawan: targetType === 'specific' ? idKaryawan : undefined,
            id_divisi: targetType === 'division' ? idDivisi : undefined,
            judul,
            pesan,
            jenis,
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-left">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Target Penerima</label>
                    <div className="flex flex-wrap gap-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                value="all"
                                checked={targetType === 'all'}
                                onChange={() => setTargetType('all')}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-slate-700">Semua Karyawan</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                value="division"
                                checked={targetType === 'division'}
                                onChange={() => setTargetType('division')}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-slate-700">Per Divisi</span>
                        </label>
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="radio"
                                value="specific"
                                checked={targetType === 'specific'}
                                onChange={() => setTargetType('specific')}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                            />
                            <span className="text-sm font-medium text-slate-700">Karyawan Tertentu</span>
                        </label>
                    </div>
                </div>

                {targetType === 'division' && (
                    <div className="col-span-2 text-left">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Divisi</label>
                        <select
                            required
                            className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                            value={idDivisi || ''}
                            onChange={(e) => setIdDivisi(Number(e.target.value))}
                        >
                            <option value="">Pilih Divisi...</option>
                            {divisis.map((d: Divisi) => (
                                <option key={d.id} value={d.id}>{d.nama_divisi}</option>
                            ))}
                        </select>
                    </div>
                )}

                {targetType === 'specific' && (
                    <div className="col-span-2 text-left">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pilih Karyawan</label>
                        <select
                            required
                            className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                            value={idKaryawan || ''}
                            onChange={(e) => setIdKaryawan(Number(e.target.value))}
                        >
                            <option value="">Pilih Karyawan...</option>
                            {karyawans.map((k: Karyawan) => (
                                <option key={k.id} value={k.id}>{k.nama_lengkap} ({k.kode_karyawan})</option>
                            ))}
                        </select>
                    </div>
                )}

                <div className="col-span-2 text-left">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Tipe</label>
                    <select
                        className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                        value={jenis}
                        onChange={(e) => setJenis(e.target.value)}
                    >
                        <option value="info">Informasi</option>
                        <option value="broadcast">Pengumuman (Broadcast)</option>
                        <option value="reminder">Pengingat (Reminder)</option>
                        <option value="gamifikasi">Reward / Gamification</option>
                    </select>
                </div>

                <div className="col-span-2 text-left">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Judul</label>
                    <input
                        type="text"
                        required
                        maxLength={255}
                        className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                        placeholder="Contoh: Pengumuman Rapat Mingguan"
                        value={judul}
                        onChange={(e) => setJudul(e.target.value)}
                    />
                </div>

                <div className="col-span-2 text-left">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Pesan</label>
                    <textarea
                        required
                        rows={4}
                        className="block w-full rounded-lg border border-gray-300 p-2.5 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-all"
                        placeholder="Tulis detail pesan di sini..."
                        value={pesan}
                        onChange={(e) => setPesan(e.target.value)}
                    />
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
                    {loading ? 'Mengirim...' : 'Kirim Notifikasi'}
                </button>
            </div>
        </form>
    );
};

export default NotifikasiForm;
