import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { usePesanan } from '../features/pesanan/hooks/usePesanan';
import OrderTable from '../features/pesanan/components/OrderTable';
import OrderDetail from '../features/pesanan/components/OrderDetail';
import { Modal } from '../components/ui/Modal';
import { Pesanan, UpdatePesananData } from '../features/pesanan/types';

const PesananPage: React.FC = () => {
    const { 
        pesanans, 
        loading, 
        error, 
        fetchPesanans, 
        getPesananDetail, 
        updateStatus,
        updatePesanan
    } = usePesanan();

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Initial Fetch & Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPesanans({ search, status: statusFilter });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, statusFilter, fetchPesanans]);

    const handleViewDetail = async (id: number) => {
        const result = await getPesananDetail(id);
        if (result.success && result.data) {
            setSelectedPesanan(result.data);
            setIsDetailOpen(true);
        } else {
            toast.error(result.message || 'Gagal memuat detail pesanan');
        }
    };

    const handleUpdatePesanan = async (id: number, data: UpdatePesananData) => {
        const result = await updatePesanan(id, data);
        if (result.success) {
            toast.success('Pesanan berhasil diperbarui');
            if (selectedPesanan && selectedPesanan.id === id) {
                // Fetch fresh detail to show updated items
                const fresh = await getPesananDetail(id);
                if (fresh.success) setSelectedPesanan(fresh.data || null);
            }
        } else {
            toast.error(result.message || 'Gagal memperbarui pesanan');
        }
        return result;
    };

    const handleStatusChange = async (id: number, newStatus: string) => {
        const result = await updateStatus(id, newStatus);
        if (result.success) {
            toast.success('Status pesanan berhasil diperbarui');
            if (selectedPesanan && selectedPesanan.id === id) {
                setSelectedPesanan({ ...selectedPesanan, status: newStatus });
            }
        } else {
            toast.error(result.message || 'Gagal mengubah status');
        }
    };

    const handleCloseDetail = () => {
        setIsDetailOpen(false);
        setSelectedPesanan(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h1>
                <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
                    {['', 'PENDING', 'PROSES', 'DIKIRIM', 'SUKSES', 'BATAL'].map(s => (
                        <button
                            key={s || 'ALL'}
                            onClick={() => setStatusFilter(s)}
                            className={cn(
                                "rounded-md px-3 py-1.5 text-xs font-medium uppercase transition-colors border whitespace-nowrap",
                                statusFilter === s 
                                    ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm" 
                                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                            )}
                        >
                            {s || 'Semua'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Helper Text */}
             <p className="text-sm text-gray-500">
                Pantau dan kelola pesanan masuk dari sales lapangan secara real-time.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm transition-shadow"
                    placeholder="Cari No Pesanan / Toko..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            )}

            {/* Table */}
            <OrderTable 
                data={pesanans} 
                loading={loading} 
                onViewDetail={handleViewDetail} 
            />

            {/* Detail Modal */}
            <Modal
                isOpen={isDetailOpen && !!selectedPesanan}
                onClose={handleCloseDetail}
                title={`Detail Pesanan: ${selectedPesanan?.no_pesanan || ''}`}
                size="4xl"
            >
                {selectedPesanan && (
                    <OrderDetail 
                        pesanan={selectedPesanan}
                        onStatusChange={handleStatusChange}
                        onUpdatePesanan={handleUpdatePesanan}
                        onClose={handleCloseDetail}
                    />
                )}
            </Modal>
        </div>
    );
};

export default PesananPage;
