import React from 'react';
import { Edit, Trash, User as UserIcon, Shield, Smartphone } from 'lucide-react';
import { User } from '../types';

interface UserTableProps {
    data: User[];
    loading: boolean;
    onEdit: (user: User) => void;
    onDelete: (id: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({ data, loading, onEdit, onDelete }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nama Karyawan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Username & Akses
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Role
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                    Memuat data...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                Belum ada data pengguna.
                            </td>
                        </tr>
                    ) : (
                        data.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{u.karyawan?.nama_lengkap || 'Unknown'}</div>
                                            <div className="flex gap-1 mt-1">
                                                <div className="text-[10px] font-bold uppercase text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                                    ID: {u.karyawan?.kode_karyawan || '-'}
                                                </div>
                                                <div className="text-[10px] font-bold uppercase text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                    {u.karyawan?.divisi?.nama_divisi || '-'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <UserIcon className="h-3 w-3 mr-1.5 text-gray-400" />
                                        {u.username}
                                    </div>
                                    {u.karyawan?.no_hp && (
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                            <Smartphone className="h-3 w-3 mr-1.5 text-gray-400" />
                                            {u.karyawan.no_hp}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                     <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                        u.peran === 'admin_perusahaan' || u.peran === 'admin_divisi'
                                            ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                            : u.peran === 'sales'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-green-100 text-green-800 border border-green-200'
                                     }`}>
                                        <Shield className="w-3 h-3 mr-1.5" />
                                        {u.peran.replace('_', ' ')}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(u)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors p-1 hover:bg-indigo-50 rounded"
                                        title="Edit Akses"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(u.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                                        title="Hapus Pengguna"
                                    >
                                        <Trash className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default UserTable;
