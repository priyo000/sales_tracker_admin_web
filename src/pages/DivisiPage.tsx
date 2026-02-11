import React, { useEffect, useState } from 'react';
import { Plus, Layout } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDivisi } from '../features/divisi/hooks/useDivisi';
import DivisionTable from '../features/divisi/components/DivisionTable';
import DivisionForm from '../features/divisi/components/DivisionForm';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { DivisiFormData } from '../features/divisi/types';

const DivisiPage: React.FC = () => {
    const { 
        divisis, 
        loading, 
        error, 
        fetchDivisis, 
        createDivisi, 
        deleteDivisi 
    } = useDivisi();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    useEffect(() => {
        fetchDivisis();
    }, [fetchDivisis]);

    const handleCreate = () => {
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            const result = await deleteDivisi(deletingId);
            if (result.success) {
                toast.success('Divisi berhasil dihapus');
                setDeletingId(null);
            } else {
                toast.error(result.message || 'Gagal menghapus divisi');
            }
        }
    };

    const handleFormSubmit = async (data: DivisiFormData) => {
        const result = await createDivisi(data);
        if (result.success) {
            toast.success('Divisi berhasil ditambahkan');
            setIsFormOpen(false);
        } else {
            toast.error(result.message || 'Gagal menyimpan divisi');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                        <Layout className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Divisi</h1>
                        <p className="text-sm text-gray-500">Kelola departemen atau kelompok kerja karyawan.</p>
                    </div>
                </div>
                <button 
                    onClick={handleCreate}
                    className="flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-700 shadow-md transition-all active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Divisi
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl bg-red-50 p-4 border border-red-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
            )}

            {/* Table */}
            <DivisionTable 
                data={divisis} 
                loading={loading} 
                onDelete={handleDeleteClick} 
            />

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Tambah Divisi Baru"
            >
                <DivisionForm 
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
                title="Hapus Divisi"
                message="Apakah Anda yakin ingin menghapus divisi ini? Pastikan tidak ada karyawan yang masih terdaftar di divisi ini."
                type="danger"
                confirmText="Hapus"
            />
        </div>
    );
};

export default DivisiPage;
