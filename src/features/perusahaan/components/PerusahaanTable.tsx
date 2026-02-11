import React from 'react';
import { Perusahaan } from '../types';
import { Edit2, Trash2, Building2, Mail, Phone } from 'lucide-react';

interface PerusahaanTableProps {
    data: Perusahaan[];
    loading: boolean;
    onEdit: (item: Perusahaan) => void;
    onDelete: (id: number) => void;
}

const PerusahaanTable: React.FC<PerusahaanTableProps> = ({ data, loading, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                <Building2 className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">Belum ada data perusahaan.</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Perusahaan</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Kontak</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Tgl Bergabung</th>
                        <th className="px-6 py-3 text-right text-xs font-bold uppercase tracking-wider text-slate-500">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                    {data.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center">
                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Building2 className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-4">
                                        <div className="text-sm font-bold text-slate-900">{item.nama_perusahaan}</div>
                                        <div className="text-xs text-slate-500 line-clamp-1">{item.alamat || 'Tidak ada alamat'}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-col space-y-1">
                                    <div className="flex items-center text-xs text-slate-600">
                                        <Mail className="mr-1.5 h-3 w-3" />
                                        {item.email_kontak || '-'}
                                    </div>
                                    <div className="flex items-center text-xs text-slate-600">
                                        <Phone className="mr-1.5 h-3 w-3" />
                                        {item.no_telp || '-'}
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${
                                    item.status_langganan === 'aktif' 
                                        ? 'bg-emerald-100 text-emerald-700' 
                                        : 'bg-red-100 text-red-700'
                                }`}>
                                    {item.status_langganan}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-600">
                                {item.tanggal_bergabung ? new Date(item.tanggal_bergabung).toLocaleDateString('id-ID') : '-'}
                            </td>
                            <td className="px-6 py-4 text-right text-sm font-medium">
                                <div className="flex justify-end space-x-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(item.id)}
                                        className="rounded-lg p-2 text-red-600 hover:bg-red-50 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PerusahaanTable;
