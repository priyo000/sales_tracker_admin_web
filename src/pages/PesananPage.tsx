import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ItemPesanan {
    id: number;
    nama_barang: string;
    jumlah: number;
    harga_satuan: number;
    subtotal: number;
}

interface Pesanan {
    id: number;
    no_pesanan: string;
    tanggal: string;
    nama_toko: string;
    sales: string;
    total_harga: number;
    status: string;
    items?: ItemPesanan[];
}

const PesananPage: React.FC = () => {
    const [pesanans, setPesanans] = useState<Pesanan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const fetchPesanan = React.useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/pesanan', { params: { search, status: statusFilter } });
            setPesanans(response.data.data);
        } catch (error) {
            console.error("Failed to fetch orders", error);
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => {
        fetchPesanan();
    }, [fetchPesanan]);

    const handleStatusChange = async (id: number, newStatus: string) => {
        if (!confirm(`Ubah status pesanan menjadi ${newStatus}?`)) return;
        try {
            // Assuming endpoint exists for status update. 
            // Often separate endpoint or PUT /pesanan/:id
            await api.put(`/pesanan/${id}/status`, { status: newStatus });
            fetchPesanan();
            if (selectedPesanan?.id === id) setIsDetailOpen(false);
        } catch (error) {
            console.error("Failed to update status", error);
            alert("Gagal update status.");
        }
    };

    const openDetail = async (id: number) => {
        try {
            const response = await api.get(`/pesanan/${id}`);
            setSelectedPesanan(response.data.data);
            setIsDetailOpen(true);
        } catch (error) {
            console.error("Failed to fetch detail", error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'sukses': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'batal': return 'bg-red-100 text-red-800';
            case 'proses': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h1>
                <div className="flex space-x-2">
                    {['', 'PENDING', 'PROSES', 'SUKSES', 'BATAL'].map(s => (
                        <button
                            key={s || 'ALL'}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-xs font-medium uppercase transition-colors border",
                                statusFilter === s 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {s || 'Semua'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Cari No Pesanan / Toko..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Pesanan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Toko & Sales</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Total</th>
                            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                         {loading ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Loading orders...</td></tr>
                        ) : pesanans.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">Belum ada pesanan.</td></tr>
                        ) : (
                            pesanans.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{p.no_pesanan}</div>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="mr-1 h-3 w-3" /> {p.tanggal}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-gray-900">{p.nama_toko}</div>
                                        <div className="text-xs text-gray-500">{p.sales}</div>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm font-bold text-gray-900">
                                        Rp {p.total_harga.toLocaleString('id-ID')}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${getStatusColor(p.status)}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <button 
                                            onClick={() => openDetail(p.id)}
                                            className="text-indigo-600 hover:text-indigo-900"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail */}
            {isDetailOpen && selectedPesanan && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b bg-gray-50 px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Detail Pesanan: {selectedPesanan.no_pesanan}</h3>
                            <button onClick={() => setIsDetailOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <span className="sr-only">Close</span>
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="px-6 py-4">
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Pelanggan</p>
                                    <p className="font-medium">{selectedPesanan.nama_toko}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Sales</p>
                                    <p className="font-medium">{selectedPesanan.sales}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Tanggal</p>
                                    <p className="font-medium">{selectedPesanan.tanggal}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Status</p>
                                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold ${getStatusColor(selectedPesanan.status)}`}>
                                        {selectedPesanan.status}
                                    </span>
                                </div>
                            </div>

                            <h4 className="mb-2 font-medium text-gray-900">Item Pesanan</h4>
                            <div className="overflow-hidden rounded border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Barang</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Harga</th>
                                            <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Qty</th>
                                            <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {selectedPesanan.items?.map((item) => (
                                            <tr key={item.id}>
                                                <td className="px-4 py-2 text-sm text-gray-900">{item.nama_barang}</td>
                                                <td className="px-4 py-2 text-right text-sm text-gray-500">
                                                    {item.harga_satuan.toLocaleString('id-ID')}
                                                </td>
                                                <td className="px-4 py-2 text-center text-sm text-gray-500">{item.jumlah}</td>
                                                <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                                    {item.subtotal.toLocaleString('id-ID')}
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50">
                                            <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-gray-900">Total</td>
                                            <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">
                                                Rp {selectedPesanan.total_harga.toLocaleString('id-ID')}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 bg-gray-50 px-6 py-4">
                            {selectedPesanan.status === 'PENDING' && (
                                <>
                                    <button 
                                        onClick={() => handleStatusChange(selectedPesanan.id, 'BATAL')}
                                        className="flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                                    >
                                        <XCircle className="mr-2 h-4 w-4 text-red-500" /> Tolak
                                    </button>
                                    <button 
                                        onClick={() => handleStatusChange(selectedPesanan.id, 'PROSES')}
                                        className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                    >
                                        <CheckCircle className="mr-2 h-4 w-4" /> Proses
                                    </button>
                                </>
                            )}
                             {selectedPesanan.status === 'PROSES' && (
                                <button 
                                    onClick={() => handleStatusChange(selectedPesanan.id, 'SUKSES')}
                                    className="flex items-center rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                                >
                                    <CheckCircle className="mr-2 h-4 w-4" /> Selesaikan
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PesananPage;
