import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Search, Check, X, Store, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Pelanggan {
    id: number;
    nama_toko: string;
    nama_pemilik: string;
    alamat_toko: string;
    no_hp_pemilik: string;
    status: string;
    foto_toko?: string;
}

const PelangganPage: React.FC = () => {
    const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('pending'); // pending, active, rejected

    const fetchPelanggan = React.useCallback(async () => {
        setLoading(true);
        try {
            // We can filter by status if the API supports it, assuming it does or we filter client side
            // Ideally backend supports ?status=...
            const response = await api.get('/pelanggan', { params: { search, status: filterStatus } });
            setPelanggans(response.data.data);
        } catch (error) {
            console.error("Failed to fetch customers", error);
        } finally {
            setLoading(false);
        }
    }, [search, filterStatus]);

    useEffect(() => {
        fetchPelanggan();
    }, [fetchPelanggan]);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        if (!confirm(`Apakah anda yakin ingin ${action} pelanggan ini?`)) return;
        
        try {
            await api.post(`/pelanggan/${id}/${action}`);
            fetchPelanggan();
        } catch (error) {
            console.error(`Failed to ${action} customer`, error);
            alert(`Gagal memproses pelanggan.`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Verifikasi Pelanggan</h1>
                {/* Tabs */}
                <div className="flex space-x-2 rounded-lg bg-gray-100 p-1">
                    {['pending', 'active', 'rejected'].map(status => (
                         <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={cn(
                                "capitalize rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                                filterStatus === status 
                                    ? "bg-white text-gray-900 shadow" 
                                    : "text-gray-500 hover:text-gray-900"
                            )}
                         >
                            {status}
                         </button>
                    ))}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Cari toko / pemilik..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Grid List */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                 {loading ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Loading customers...</div>
                ) : pelanggans.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-gray-500">Tidak ada data pelanggan dengan status {filterStatus}.</div>
                ) : (
                    pelanggans.map((p) => (
                        <div key={p.id} className="overflow-hidden rounded-lg bg-white shadow">
                            <div className="h-32 bg-gray-200">
                                {/* Placeholder for Shop Photo */}
                                {p.foto_toko ? (
                                    <img src={p.foto_toko} alt={p.nama_toko} className="h-full w-full object-cover" />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                                        <Store className="h-12 w-12" />
                                    </div>
                                )}
                            </div>
                            <div className="p-5">
                                <h3 className="text-lg font-bold text-gray-900">{p.nama_toko}</h3>
                                <p className="text-sm text-gray-500">{p.nama_pemilik}</p>
                                
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-start text-sm text-gray-600">
                                        <MapPin className="mr-2 h-4 w-4 mt-0.5" />
                                        <span>{p.alamat_toko}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="mr-2 h-4 w-4" />
                                        <span>{p.no_hp_pemilik}</span>
                                    </div>
                                </div>

                                {/* Actions for Pending */}
                                {filterStatus === 'pending' && (
                                    <div className="mt-5 flex space-x-2 border-t pt-4">
                                        <button 
                                            onClick={() => handleAction(p.id, 'approve')}
                                            className="flex flex-1 items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                                        >
                                            <Check className="mr-2 h-4 w-4" /> Approve
                                        </button>
                                        <button 
                                            onClick={() => handleAction(p.id, 'reject')}
                                            className="flex flex-1 items-center justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                                        >
                                            <X className="mr-2 h-4 w-4" /> Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default PelangganPage;
