import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Calendar as CalendarIcon, User } from 'lucide-react';

interface Jadwal {
    id: number;
    tanggal: string;
    karyawan: { nama_lengkap: string; jabatan: string };
    rute: { nama_rute: string; details_count: number };
    status: string;
}

interface RuteOption { id: number; nama_rute: string; }
interface KaryawanOption { id: number; nama_lengkap: string; }

const JadwalPage: React.FC = () => {
    const [jadwals, setJadwals] = useState<Jadwal[]>([]);
    const [loading, setLoading] = useState(true);
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Form Data
    const [formData, setFormData] = useState({ id_karyawan: '', id_rute: '', tanggal: '' });
    const [ruteOptions, setRuteOptions] = useState<RuteOption[]>([]);
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([]); // Should fetch from API

    const fetchJadwals = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/jadwal-sales', { params: { date } });
            setJadwals(response.data.data);
        } catch (error) {
            console.error("Failed to fetch schedules", error);
        } finally {
            setLoading(false);
        }
    }, [date]);

    useEffect(() => {
        fetchJadwals();
    }, [fetchJadwals]);

    // Fetch Options when modal opens
    useEffect(() => {
        if (isModalOpen) {
            // Load Rutes
            api.get('/rute').then(res => setRuteOptions(res.data.data));
            // Load Karyawan
            api.get('/karyawan', { params: { role: 'Sales' } })
               .then(res => setKaryawanOptions(res.data.data))
               .catch(err => console.error("Failed fetching sales", err));
        }
    }, [isModalOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/jadwal-sales', formData);
            setIsModalOpen(false);
            setFormData({ id_karyawan: '', id_rute: '', tanggal: '' });
            fetchJadwals();
        } catch (error) {
            console.error("Failed to create schedule", error);
            alert("Gagal membuat jadwal.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Jadwal Kunjungan Sales</h1>
                <button 
                    onClick={() => {
                        setFormData({ ...formData, tanggal: date });
                        setIsModalOpen(true);
                    }}
                    className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" /> Buat Jadwal
                </button>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <input 
                    type="date" 
                    className="rounded-md border border-gray-300 p-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            {/* Grid/List */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Loading schedules...</div>
                ) : jadwals.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Tidak ada jadwal untuk tanggal ini.</div>
                ) : (
                    jadwals.map((jadwal) => (
                        <div key={jadwal.id} className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md">
                            <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                <div className="flex items-center">
                                    <User className="mr-2 h-5 w-5 text-indigo-500" />
                                    <h3 className="font-medium text-gray-900">{jadwal.karyawan?.nama_lengkap || 'Unknown Sales'}</h3>
                                </div>
                                <p className="ml-7 text-xs text-gray-500">{jadwal.karyawan?.jabatan}</p>
                            </div>
                            <div className="p-4">
                                <div className="mb-2 flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Rute:</span>
                                    <span className="text-sm font-semibold text-gray-900">{jadwal.rute?.nama_rute}</span>
                                </div>
                                <div className="mb-4 flex justify-between">
                                    <span className="text-sm font-medium text-gray-500">Status:</span>
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                                        jadwal.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {jadwal.status || 'Belum Mulai'}
                                    </span>
                                </div>
                                <button className="w-full rounded border border-indigo-600 px-3 py-1 text-sm text-indigo-600 hover:bg-indigo-50">
                                    Lihat Detail
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-bold">Assign Jadwal</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Tanggal</label>
                                <input
                                    type="date"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.tanggal}
                                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                                />
                            </div>
                            
                            {/* NOTE: Need Karyawan List here. Using text input ID for now as placeholder if list empty */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Pilih Sales</label>
                                <select
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.id_karyawan}
                                    onChange={(e) => setFormData({ ...formData, id_karyawan: e.target.value })}
                                >
                                    <option value="">-- Pilih Sales --</option>
                                    {karyawanOptions.map(k => (
                                        <option key={k.id} value={k.id}>{k.nama_lengkap}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Pilih Rute</label>
                                <select
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.id_rute}
                                    onChange={(e) => setFormData({ ...formData, id_rute: e.target.value })}
                                >
                                    <option value="">-- Pilih Rute --</option>
                                    {ruteOptions.map(r => (
                                        <option key={r.id} value={r.id}>{r.nama_rute}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JadwalPage;
