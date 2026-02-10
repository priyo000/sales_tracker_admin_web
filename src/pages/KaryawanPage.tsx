import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Edit, Trash, User } from 'lucide-react';

interface Karyawan {
    id: number;
    nama_lengkap: string;
    no_hp: string;
    email: string;
    jabatan: string;
    alamat_domisili: string;
    status_aktif: boolean;
}

const KaryawanPage: React.FC = () => {
    const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        nama_lengkap: '',
        no_hp: '',
        email: '',
        jabatan: 'Sales',
        alamat_domisili: '',
    });

    const fetchKaryawan = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/karyawan', { params: { search } });
            setKaryawans(response.data.data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchKaryawan();
    }, [fetchKaryawan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/karyawan', formData);
            setIsModalOpen(false);
            setFormData({
                nama_lengkap: '',
                no_hp: '',
                email: '',
                jabatan: 'Sales',
                alamat_domisili: '',
            });
            fetchKaryawan();
        } catch (error) {
            console.error("Failed to create employee", error);
            alert("Gagal menambah karyawan.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Data Karyawan</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
                </button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Cari (Nama / No HP)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Nama & Jabatan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kontak</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Alamat</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td></tr>
                        ) : karyawans.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada data karyawan.</td></tr>
                        ) : (
                            karyawans.map((k) => (
                                <tr key={k.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                <User className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{k.nama_lengkap}</div>
                                                <div className="text-sm text-gray-500">{k.jabatan}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{k.no_hp}</div>
                                        <div className="text-xs text-gray-500">{k.email}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {k.alamat_domisili || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                         <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${k.status_aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {k.status_aktif ? 'Aktif' : 'Non-Aktif'}
                                         </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button className="mr-3 text-indigo-600 hover:text-indigo-900">
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button className="text-red-600 hover:text-red-900">
                                            <Trash className="h-4 w-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                        <h2 className="mb-4 text-lg font-bold">Tambah Karyawan</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.nama_lengkap}
                                    onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">No HP</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.no_hp}
                                        onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jabatan</label>
                                    <select
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.jabatan}
                                        onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                                    >
                                        <option value="Sales">Sales</option>
                                        <option value="Driver">Driver</option>
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Alamat Domisili</label>
                                <textarea
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    rows={2}
                                    value={formData.alamat_domisili}
                                    onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })}
                                />
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

export default KaryawanPage;
