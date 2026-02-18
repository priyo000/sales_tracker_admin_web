import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useProduk } from '../features/produk/hooks/useProduk';
import ProductTable from '../features/produk/components/ProductTable';
import ProductForm from '../features/produk/components/ProductForm';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Produk } from '../features/produk/types';

const ProdukPage: React.FC = () => {
    const { 
        produks, loading, error, 
        fetchProduks, createProduk, updateProduk, deleteProduk 
    } = useProduk();

    const [search, setSearch] = useState('');
    const [selectedKategori, setSelectedKategori] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Initial Fetch & Filter Debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProduks({ search, kategori: selectedKategori });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, selectedKategori, fetchProduks]);

    const handleCreate = () => {
        setEditingProduct(null);
        setIsFormOpen(true);
    };

    const handleEdit = (produk: Produk) => {
        setEditingProduct(produk);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            const result = await deleteProduk(deletingId);
            if (result && result.success) {
                 toast.success('Produk berhasil dihapus');
                 setDeletingId(null);
            } else {
                 toast.error(result?.message || 'Gagal menghapus produk');
            }
        }
    };

    const handleFormSubmit = async (data: FormData) => {
        let result;
        if (editingProduct) {
            result = await updateProduk(editingProduct.id, data);
        } else {
            result = await createProduk(data);
        }

        if (result.success) {
            toast.success(editingProduct ? 'Produk berhasil diperbarui' : 'Produk berhasil ditambahkan');
            setIsFormOpen(false);
        } else {
            toast.error(result.message || 'Gagal menyimpan produk');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">Master Produk</h1>
                <button 
                    onClick={handleCreate}
                    className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 shadow-sm transition-transform active:scale-95"
                >
                    <Plus className="mr-2 h-4 w-4" /> Tambah Produk
                </button>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500">
                Kelola data produk yang akan dijual oleh sales.
            </p>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm transition-shadow"
                        placeholder="Cari produk (Nama, Kode, SKU)..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-64">
                    <select
                        className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 leading-5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
                        value={selectedKategori}
                        onChange={(e) => setSelectedKategori(e.target.value)}
                    >
                        <option value="">Semua Kategori</option>
                        {/* 
                            Kita bisa mengambil list kategori unik dari 'produks' 
                            atau idealnya ada API terpisah. Untuk sekarang kita ambil dari data yang ada.
                        */}
                        {Array.from(new Set(produks.map(p => p.kategori).filter(Boolean))).map(kat => (
                            <option key={kat} value={kat}>{kat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="flex">
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table Component */}
            <ProductTable 
                produks={produks} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
            />

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                size="lg"
            >
                <ProductForm
                    key={editingProduct ? editingProduct.id : 'create'}
                    initialData={editingProduct}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={loading}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Hapus Produk"
                message="Apakah Anda yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan."
                confirmText="Hapus"
                type="danger"
            />
        </div>
    );
};

export default ProdukPage;

