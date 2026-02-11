import React, { useEffect, useState } from 'react';
import { Building2, Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePerusahaan } from '../features/perusahaan/hooks/usePerusahaan';
import PerusahaanTable from '../features/perusahaan/components/PerusahaanTable';
import PerusahaanForm from '../features/perusahaan/components/PerusahaanForm';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Perusahaan, PerusahaanFormData } from '../features/perusahaan/types';

const PerusahaanPage: React.FC = () => {
    const { perusahaans, loading, fetchPerusahaans, createPerusahaan, updatePerusahaan, deletePerusahaan } = usePerusahaan();
    
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Perusahaan | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    useEffect(() => {
        fetchPerusahaans();
    }, [fetchPerusahaans]);

    const filteredData = perusahaans.filter(p => 
        p.nama_perusahaan.toLowerCase().includes(search.toLowerCase()) ||
        p.email_kontak?.toLowerCase().includes(search.toLowerCase())
    );

    const handleOpenAdd = () => {
        setSelectedItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (item: Perusahaan) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: PerusahaanFormData) => {
        let result;
        if (selectedItem) {
            result = await updatePerusahaan(selectedItem.id, data);
        } else {
            result = await createPerusahaan(data);
        }

        if (result.success) {
            toast.success(selectedItem ? 'Perusahaan diperbarui' : 'Perusahaan ditambahkan');
            setIsModalOpen(false);
            fetchPerusahaans();
        } else {
            toast.error(result.message || 'Gagal menyimpan data');
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        const result = await deletePerusahaan(deleteId);
        if (result.success) {
            toast.success('Perusahaan dihapus');
            setDeleteId(null);
            fetchPerusahaans();
        } else {
            toast.error(result.message || 'Gagal menghapus data');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-200">
                        <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Manajemen Perusahaan</h1>
                        <p className="text-sm text-gray-500">Kelola Tenant / Perusahaan yang terdaftar.</p>
                    </div>
                </div>

                <button
                    onClick={handleOpenAdd}
                    className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Perusahaan
                </button>
            </div>

            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    placeholder="Cari perusahaan..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <PerusahaanTable 
                data={filteredData}
                loading={loading}
                onEdit={handleOpenEdit}
                onDelete={setDeleteId}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={selectedItem ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
            >
                <PerusahaanForm 
                    initialData={selectedItem}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    isLoading={loading}
                />
            </Modal>

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Hapus Perusahaan"
                message="Menghapus perusahaan akan menghapus seluruh data terkait (Pelanggan, Produk, Transaksi). Lanjutkan?"
                type="danger"
            />
        </div>
    );
};

export default PerusahaanPage;
