import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Plus, Search, Package, Edit, Trash } from 'lucide-react';

interface Produk {
    id: number;
    kode_barang: string;
    sku: string;
    nama_barang: string;
    harga_jual: string;
    stok: number;
    satuan: string;
}

const ProdukPage: React.FC = () => {
    const [produks, setProduks] = useState<Produk[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        kode_barang: '',
        sku: '',
        nama_barang: '',
        harga_jual: '',
        stok: '0',
        satuan: 'pcs'
    });

    const fetchProduk = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/produk', { params: { search } });
            setProduks(response.data.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => {
        fetchProduk();
    }, [fetchProduk]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/produk', formData);
            setIsModalOpen(false);
            setFormData({
                kode_barang: '',
                sku: '',
                nama_barang: '',
                harga_jual: '',
                stok: '0',
                satuan: 'pcs'
            });
            fetchProduk();
        } catch (error) {
            console.error("Failed to create product", error);
            alert("Gagal menambah produk.");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Master Produk</h1>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Produk
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
                    placeholder="Cari produk (Nama, Kode, SKU)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Info Barang</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Kode / SKU</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Harga</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Stok</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading...</td>
                            </tr>
                        ) : produks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada data produk.</td>
                            </tr>
                        ) : (
                            produks.map((produk) => (
                                <tr key={produk.id}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 flex-shrink-0 rounded bg-indigo-100 flex items-center justify-center text-indigo-500">
                                                <Package className="h-6 w-6" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{produk.nama_barang}</div>
                                                <div className="text-sm text-gray-500">{produk.satuan}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-900">{produk.kode_barang}</div>
                                        <div className="text-xs text-gray-500">{produk.sku}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500">
                                        Rp {parseFloat(produk.harga_jual).toLocaleString('id-ID')}
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-900">
                                        {produk.stok}
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
                        <h2 className="mb-4 text-lg font-bold">Tambah Produk Baru</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Kode Barang</label>
                                    <input
                                        type="text"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.kode_barang}
                                        onChange={(e) => setFormData({ ...formData, kode_barang: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">SKU (Opsional)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nama Barang</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.nama_barang}
                                    onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Harga Jual</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.harga_jual}
                                        onChange={(e) => setFormData({ ...formData, harga_jual: e.target.value })}
                                    />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Stok Awal</label>
                                    <input
                                        type="number"
                                        required
                                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                        value={formData.stok}
                                        onChange={(e) => setFormData({ ...formData, stok: e.target.value })}
                                    />
                                </div>
                            </div>

                             <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Satuan</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                                    value={formData.satuan}
                                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
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

export default ProdukPage;
