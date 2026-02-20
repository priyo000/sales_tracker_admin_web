import React from 'react';
import { Trash, Layout, Edit2 } from 'lucide-react';
import { Divisi } from '../types';

interface DivisionTableProps {
    data: Divisi[];
    loading: boolean;
    onDelete: (id: number) => void;
    onEdit: (divisi: Divisi) => void;
}

const DivisionTable: React.FC<DivisionTableProps> = ({ data, loading, onDelete, onEdit }) => {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                    <tr>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Nama Divisi
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Jarak Toleransi
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Jangkauan Data
                        </th>
                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                            Dibuat Pada
                        </th>
                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                    Memuat data...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                Belum ada data divisi.
                            </td>
                        </tr>
                    ) : (
                        data.map((d) => (
                            <tr key={d.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-9 w-9 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
                                            <Layout className="h-4 w-4" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-semibold text-gray-900">{d.nama_divisi}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                        {d.radius_toleransi ? `${d.radius_toleransi} m` : 'Default'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {d.view_scope === 'COMPANY' && (
                                        <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                            Satu Perusahaan
                                        </span>
                                    )}
                                    {d.view_scope === 'DIVISION' && (
                                        <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                            Satu Divisi
                                        </span>
                                    )}
                                    {(!d.view_scope || d.view_scope === 'SELF') && (
                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-700/10">
                                            Diri Sendiri (Default)
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        {d.created_at ? new Date(d.created_at).toLocaleDateString('id-ID', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        }) : '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(d)}
                                        className="text-gray-400 hover:text-indigo-600 transition-all p-2 hover:bg-indigo-50 rounded-lg active:scale-90 mr-2"
                                        title="Edit Divisi"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(d.id)}
                                        className="text-gray-400 hover:text-red-600 transition-all p-2 hover:bg-red-50 rounded-lg active:scale-90"
                                        title="Hapus Divisi"
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

export default DivisionTable;
