import React, { useEffect, useState } from 'react';
import { Plus, Search, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useKaryawan } from '../features/karyawan/hooks/useKaryawan';
import EmployeeTable from '../features/karyawan/components/EmployeeTable';
import EmployeeForm from '../features/karyawan/components/EmployeeForm';
import ImportEmployeeModal from '../features/karyawan/components/ImportEmployeeModal';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Karyawan, KaryawanFormData } from '../features/karyawan/types';

const KaryawanPage: React.FC = () => {
    const { 
        karyawans, 
        divisiOptions,
        loading, 
        error, 
        fetchKaryawans, 
        fetchDivisiOptions,
        createKaryawan, 
        updateKaryawan, 
        deleteKaryawan,
        importKaryawan
    } = useKaryawan();

    const [search, setSearch] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<Karyawan | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Initial Fetch (Divisions & Employees)
    useEffect(() => {
        fetchDivisiOptions();
    }, [fetchDivisiOptions]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchKaryawans({ search });
        }, 300);
        return () => clearTimeout(timer);
    }, [search, fetchKaryawans]);

    const handleCreate = () => {
        setEditingEmployee(null);
        setIsFormOpen(true);
    };

    const handleEdit = (karyawan: Karyawan) => {
        setEditingEmployee(karyawan);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            const result = await deleteKaryawan(deletingId);
            if (result.success) {
                toast.success('Karyawan berhasil dihapus');
                setDeletingId(null);
            } else {
                toast.error(result.message || 'Gagal menghapus karyawan');
            }
        }
    };

    const handleFormSubmit = async (data: KaryawanFormData) => {
        let result;
        if (editingEmployee) {
            result = await updateKaryawan(editingEmployee.id, data);
        } else {
            result = await createKaryawan(data);
        }

        if (result.success) {
            toast.success(editingEmployee ? 'Karyawan berhasil diperbarui' : 'Karyawan berhasil ditambahkan');
            setIsFormOpen(false);
        } else {
            toast.error(result.message || 'Gagal menyimpan data karyawan');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Karyawan</h1>
                <div className="flex gap-2">
                    <button 
                         onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center justify-center rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700 shadow-sm transition-all active:scale-95"
                    >
                         <Upload className="mr-2 h-4 w-4" /> Import Excel
                    </button>
                    <button 
                        onClick={handleCreate}
                        className="flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all active:scale-95"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Karyawan
                    </button>
                </div>
            </div>

            {/* Helper Text */}
            <p className="text-sm text-gray-500 max-w-2xl">
                Halaman ini digunakan untuk mengelola data seluruh karyawan. Anda dapat menambah, mengubah, atau menonaktifkan akun karyawan sesuai dengan divisi dan jabatan masing-masing.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    className="block w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-3 leading-5 placeholder-gray-400 focus:border-indigo-500 focus:placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm transition-all"
                    placeholder="Cari berdasarkan Nama atau No HP..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700 font-medium">{error}</div>
                </div>
            )}

            {/* Table */}
            <EmployeeTable 
                data={karyawans} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={handleDeleteClick} 
            />

            {/* Form Modal */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title={editingEmployee ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
                size="lg"
            >
                <EmployeeForm 
                    key={editingEmployee ? editingEmployee.id : 'create'}
                    initialData={editingEmployee}
                    divisiOptions={divisiOptions}
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
                title="Hapus Karyawan"
                message="Apakah Anda yakin ingin menghapus data karyawan ini? Tindakan ini tidak dapat dibatalkan."
                type="danger"
                confirmText="Hapus"
            />

            {/* Import Modal */}
            <ImportEmployeeModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={importKaryawan}
            />
        </div>
    );
};

export default KaryawanPage;
