import React, { useState } from 'react';
import { User, UserFormData } from '../types';
import { Karyawan } from '../../karyawan/types';
import { Key, Shield, User as UserIcon } from 'lucide-react';

interface UserFormProps {
    initialData?: User | null;
    availableEmployees: Karyawan[];
    onSubmit: (data: UserFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ initialData, availableEmployees, onSubmit, onCancel, loading }) => {
    const [formData, setFormData] = useState<UserFormData>({
        id_karyawan: initialData?.id_karyawan || 0,
        username: initialData?.username || '',
        password: '',
        peran: initialData?.peran || 'sales',
    });

    const isEdit = !!initialData;

    const handleEmployeeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = parseInt(e.target.value);
        setFormData(prev => {
            const newState = { ...prev, id_karyawan: value };
            
            // Auto-fill username if employee is selected and username is currently empty
            if (!isEdit && value !== 0 && prev.username === '') {
                const emp = availableEmployees.find(emp => emp.id === value);
                if (emp) {
                    // Create a simple username from name: "john.doe"
                    const suggestedUsername = emp.nama_lengkap
                        .toLowerCase()
                        .replace(/\s+/g, '.')
                        .replace(/[^a-z0-0.]/g, '');
                    newState.username = suggestedUsername;
                }
            }
            return newState;
        });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {!isEdit && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 flex items-center">
                        <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                        Pilih Karyawan
                    </label>
                    <select
                        name="id_karyawan"
                        required
                        className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={formData.id_karyawan}
                        onChange={handleEmployeeChange}
                    >
                        <option value="">Pilih Karyawan yang belum punya akun</option>
                        {availableEmployees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.nama_lengkap} ({emp.kode_karyawan || emp.jabatan})
                            </option>
                        ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500 italic">
                        * Hanya karyawan aktif yang belum memiliki akun yang muncul di sini.
                    </p>
                </div>
            )}

            {isEdit && (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                    <label className="block text-xs font-bold text-gray-500 uppercase">Akses Karyawan</label>
                    <div className="text-sm font-medium text-gray-900 mt-1">
                        {initialData.karyawan?.nama_lengkap}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <UserIcon className="w-4 h-4 mr-2 text-gray-400" />
                    Username
                </label>
                <input
                    name="username"
                    type="text"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="contoh: john.doe"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Key className="w-4 h-4 mr-2 text-gray-400" />
                    Password {isEdit && '(Kosongkan jika tidak ingin diubah)'}
                </label>
                <input
                    name="password"
                    type="password"
                    required={!isEdit}
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={isEdit ? '********' : 'Minimal 6 karakter'}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-gray-400" />
                    Role / Peran
                </label>
                <select
                    name="peran"
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    value={formData.peran}
                    onChange={handleChange}
                >
                    <option value="sales">Sales</option>
                    <option value="admin_perusahaan">Admin Perusahaan</option>
                    <option value="admin_divisi">Admin Divisi</option>
                    <option value="manager">Manager</option>
                </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
                    disabled={loading}
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
                    disabled={loading}
                >
                    {loading ? 'Menyimpan...' : (isEdit ? 'Update Akses' : 'Buat Akun User')}
                </button>
            </div>
        </form>
    );
};

export default UserForm;
