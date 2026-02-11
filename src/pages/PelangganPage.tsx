import React, { useEffect, useState } from 'react';
import { Search, Store, Plus, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePelanggan } from '../features/pelanggan/hooks/usePelanggan';
import CustomerTable from '../features/pelanggan/components/CustomerTable';
import CustomerForm from '../features/pelanggan/components/CustomerForm';
import ImportCustomerModal from '../features/pelanggan/components/ImportCustomerModal';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { cn } from '@/lib/utils';
import { PelangganStatus, PelangganFormData, Pelanggan } from '../features/pelanggan/types';

const PelangganPage: React.FC = () => {
    const { pelanggans, loading: loadingData, error, fetchPelanggans, updateStatus, createPelanggan, updatePelanggan, importPelanggan } = usePelanggan();
    
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<PelangganStatus | 'all'>('all');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    
    // Confirmation State
    const [confirmAction, setConfirmAction] = useState<{ id: number, type: 'approve' | 'reject' } | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPelanggans({ search, status: filterStatus });
        }, 300); // Debounce search
        return () => clearTimeout(timer);
    }, [search, filterStatus, fetchPelanggans]);


    const handleAction = async () => {
        if (!confirmAction) return;
        
        const result = await updateStatus(confirmAction.id, confirmAction.type);
        if (result.success) {
            toast.success(`Pelanggan berhasil ${confirmAction.type === 'approve' ? 'disetujui' : 'ditolak'}`);
            fetchPelanggans({ search, status: filterStatus }); // Refresh list
            setConfirmAction(null);
        } else {
            toast.error(result.message || 'Gagal memproses pelanggan');
        }
    };

    const handleCreatePelanggan = async (data: PelangganFormData) => {
        setIsSubmitting(true);
        const result = await createPelanggan(data);
        setIsSubmitting(false);
        if (result.success) {
            toast.success('Pelanggan berhasil ditambahkan');
            setIsAddModalOpen(false);
            fetchPelanggans({ search, status: filterStatus });
        } else {
            toast.error(result.message || 'Gagal menambahkan pelanggan');
        }
    };

    const handleUpdatePelanggan = async (data: PelangganFormData) => {
        if (!editingPelanggan) return;
        setIsSubmitting(true);
        const result = await updatePelanggan(editingPelanggan.id, data);
        setIsSubmitting(false);
        if (result.success) {
            toast.success('Data pelanggan berhasil diperbarui');
            setEditingPelanggan(null);
            fetchPelanggans({ search, status: filterStatus });
        } else {
            toast.error(result.message || 'Gagal memperbarui pelanggan');
        }
    };
    
    

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                        <Store className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Pelanggan</h1>
                        <p className="text-sm text-gray-500">Kelola dan verifikasi data pelanggan toko.</p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 shadow-sm transition-all active:scale-95"
                    >
                        <Upload className="mr-2 h-4 w-4" /> Import Excel
                    </button>

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Pelanggan
                    </button>
                    
                    {/* Status Tabs */}
                    <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 border border-gray-200">
                        {(['all', 'pending', 'active', 'rejected', 'prospect'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "capitalize rounded-lg px-4 py-2 text-xs font-bold transition-all duration-200",
                                    filterStatus === status 
                                        ? "bg-indigo-600 text-white shadow-md" 
                                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-200"
                                )}
                            >
                                {status === 'all' ? 'Semua' : status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 leading-5 placeholder-gray-400 focus:border-indigo-500 focus:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm transition-all"
                    placeholder="Cari toko, pemilik, atau nomor HP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
            )}

            {/* Table Component */}
            <CustomerTable 
                data={pelanggans}
                loading={loadingData}
                onApprove={(id) => setConfirmAction({ id, type: 'approve' })}
                onReject={(id) => setConfirmAction({ id, type: 'reject' })}
                onEdit={(p) => setEditingPelanggan(p)}
            />

            {/* Add Pelanggan Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Tambah Pelanggan Baru"
                size="3xl"
                noPadding
            >
                <CustomerForm 
                    onSubmit={handleCreatePelanggan}
                    onCancel={() => setIsAddModalOpen(false)}
                    loading={isSubmitting}
                />
            </Modal>

            {/* Edit Pelanggan Modal */}
            <Modal
                isOpen={!!editingPelanggan}
                onClose={() => setEditingPelanggan(null)}
                title={`Edit Pelanggan: ${editingPelanggan?.nama_toko}`}
                size="3xl"
                noPadding
            >
                <CustomerForm 
                    initialData={editingPelanggan}
                    onSubmit={handleUpdatePelanggan}
                    onCancel={() => setEditingPelanggan(null)}
                    loading={isSubmitting}
                />
            </Modal>

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={handleAction}
                title={confirmAction?.type === 'approve' ? 'Setujui Pelanggan' : 'Tolak Pelanggan'}
                message={`Apakah Anda yakin ingin ${confirmAction?.type === 'approve' ? 'menyetujui' : 'menolak'} pendaftaran pelanggan ini?`}
                type={confirmAction?.type === 'approve' ? 'warning' : 'danger'}
                confirmText={confirmAction?.type === 'approve' ? 'Approve' : 'Reject'}
            />

            {/* Import Modal */}
            <ImportCustomerModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={importPelanggan}
            />
        </div>
    );
};

export default PelangganPage;
