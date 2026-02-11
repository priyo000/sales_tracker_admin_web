import React, { useState, useEffect } from 'react';
import { Plus, Search, Users } from 'lucide-react';
import { useUser } from '../features/users/hooks/useUser';
import UserTable from '../features/users/components/UserTable';
import UserForm from '../features/users/components/UserForm';
import { User, UserFormData } from '../features/users/types';
import { Modal } from '../components/ui/Modal';
import { Karyawan } from '../features/karyawan/types';

const UserPage: React.FC = () => {
    const { 
        users, 
        loading, 
        fetchUsers, 
        fetchAvailableEmployees, 
        createUser, 
        updateUser, 
        deleteUser 
    } = useUser();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterPeran, setFilterPeran] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialData, setInitialData] = useState<User | null>(null);
    const [availableEmployees, setAvailableEmployees] = useState<Karyawan[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchUsers({ search: searchTerm, peran: filterPeran === 'all' ? '' : filterPeran });
    }, [fetchUsers, searchTerm, filterPeran]);

    const handleAdd = async () => {
        setInitialData(null);
        setIsSubmitting(true);
        const employees = await fetchAvailableEmployees();
        setAvailableEmployees(employees);
        setIsSubmitting(false);
        setIsModalOpen(true);
    };

    const handleEdit = (user: User) => {
        setInitialData(user);
        setIsModalOpen(true);
    };

    const handleSubmit = async (data: UserFormData) => {
        setIsSubmitting(true);
        let result;
        if (initialData) {
            result = await updateUser(initialData.id, data);
        } else {
            result = await createUser(data);
        }
        
        if (result.success) {
            setIsModalOpen(false);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="w-8 h-8 mr-3 text-indigo-600" />
                        Manajemen Pengguna
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Atur akses login aplikasi untuk setiap karyawan.
                    </p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95"
                >
                    <Plus className="-ml-0.5 mr-2 h-4 w-4" />
                    Tambah Pengguna
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                            placeholder="Cari berdasarkan username, nama, atau kode karyawan..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-48">
                        <select
                            className="block w-full rounded-lg border border-gray-300 py-2.5 px-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-gray-50/50"
                            value={filterPeran}
                            onChange={(e) => setFilterPeran(e.target.value)}
                        >
                            <option value="all">Semua Peran</option>
                            <option value="admin_perusahaan">Admin Perusahaan</option>
                            <option value="admin_divisi">Admin Divisi</option>
                            <option value="sales">Sales</option>
                            <option value="manager">Manager</option>
                        </select>
                    </div>
                </div>
            </div>

            <UserTable 
                data={users} 
                loading={loading} 
                onEdit={handleEdit} 
                onDelete={deleteUser} 
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={initialData ? 'Edit Akses Pengguna' : 'Tambah Pengguna Baru'}
                size="md"
            >
                <UserForm
                    initialData={initialData}
                    availableEmployees={availableEmployees}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsModalOpen(false)}
                    loading={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default UserPage;
