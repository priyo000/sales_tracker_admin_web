import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRute } from '../features/rute/hooks/useRute';
import RouteTable from '../features/rute/components/RouteTable';
import RouteForm from '../features/rute/components/RouteForm';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Rute, RuteFormData } from '../features/rute/types';

const RutePage: React.FC = () => {
    const { 
        rutes, 
        loading, 
        error, 
        fetchRutes, 
        createRute, 
        updateRute, 
        deleteRute 
    } = useRute();

    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Rute | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Initial Fetch & Search Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRutes({ search });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchRutes]);

    const handleCreate = () => {
        setEditingRoute(null);
        setIsFormOpen(true);
    };

    const handleEdit = (rute: Rute) => {
        setEditingRoute(rute);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            const result = await deleteRute(deletingId);
            if (result && result.success) { // adjust if return is different
                toast.success('Rute berhasil dihapus');
                setDeletingId(null);
            } else {
                 toast.error(result?.message || 'Gagal menghapus rute');
            }
        }
    };

    const handleFormSubmit = async (data: RuteFormData) => {
        let result;
        if (editingRoute) {
            result = await updateRute(editingRoute.id, data);
        } else {
            result = await createRute(data);
        }

        if (result.success) {
            toast.success(editingRoute ? 'Rute berhasil diperbarui' : 'Rute berhasil dibuat');
            setIsFormOpen(false);
        } else {
            toast.error(result.message || 'Gagal menyimpan rute');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Rute</h1>
                <button 
                    onClick={handleCreate}
                    className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 shadow-sm transition-transform active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Rute
                </button>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500">
                Kelola data rute perjalanan sales untuk pengelompokan pelanggan.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm transition-shadow"
                    placeholder="Cari rute..."
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
            <RouteTable 
                data={rutes} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
            />

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingRoute ? 'Edit Data Rute' : 'Buat Rute Baru'}
                size="md"
            >
                <RouteForm 
                    key={editingRoute ? editingRoute.id : 'create'}
                    initialData={editingRoute}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    loading={loading}
                />
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Hapus Rute"
                message="Apakah Anda yakin ingin menghapus rute ini? Data pelanggan yang terhubung mungkin akan kehilangan referensi rute."
                type="danger"
                confirmText="Hapus"
            />
        </div>
    );
};

export default RutePage;
