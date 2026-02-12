import React from 'react';
import { Edit, Trash, User, Mail, Phone, MapPin } from 'lucide-react';
import { Karyawan } from '../types';

interface EmployeeTableProps {
    data: Karyawan[];
    loading: boolean;
    onEdit: (karyawan: Karyawan) => void;
    onDelete: (id: number) => void;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ data, loading, onEdit, onDelete }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nama & Jabatan
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Kontak
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Divisi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Alamat
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                    Memuat data...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                Belum ada data karyawan.
                            </td>
                        </tr>
                    ) : (
                        data.map((k) => (
                            <tr key={k.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{k.nama_lengkap}</div>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                                                    {k.jabatan}
                                                </div>
                                                {k.kode_karyawan && (
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                                                        KODE: {k.kode_karyawan}
                                                    </div>
                                                )}
                                                {k.nik && (
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                                        NIK: {k.nik}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-900 flex items-center">
                                        <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                                        {k.no_hp}
                                    </div>
                                    {k.email && (
                                        <div className="text-xs text-gray-500 flex items-center mt-1">
                                            <Mail className="h-3 w-3 mr-1.5 text-gray-400" />
                                            {k.email}
                                        </div>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {k.divisi?.nama_divisi || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start text-sm text-gray-500 max-w-xs">
                                        <MapPin className="h-3 w-3 mr-1.5 mt-0.5 text-gray-400 shrink-0" />
                                        <span className="truncate" title={k.alamat_domisili}>
                                            {k.alamat_domisili || '-'}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                     <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                        k.status_karyawan === 'aktif'
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-red-100 text-red-800'
                                     }`}>
                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${k.status_karyawan === 'aktif' ? 'bg-green-600' : 'bg-red-600'}`}></span>
                                        {k.status_karyawan === 'aktif' ? 'Aktif' : 'Non-Aktif'}
                                     </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(k)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors p-1 hover:bg-indigo-50 rounded"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(k.id)}
                                        className="text-red-600 hover:text-red-900 transition-colors p-1 hover:bg-red-50 rounded"
                                        title="Hapus"
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

export default EmployeeTable;
