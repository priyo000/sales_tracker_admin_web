import React from 'react';
import { Edit, Trash, Map, MapPin } from 'lucide-react';
import { Rute } from '../types';

interface RouteTableProps {
    data: Rute[];
    loading: boolean;
    onEdit: (rute: Rute) => void;
    onDelete: (id: number) => void;
}

const RouteTable: React.FC<RouteTableProps> = ({ data, loading, onEdit, onDelete }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Nama Rute
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Deskripsi
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Jumlah Pelanggan
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
                                    Memuat data rute...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                Belum ada data rute.
                            </td>
                        </tr>
                    ) : (
                        data.map((rute) => (
                            <tr key={rute.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 shrink-0 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <Map className="h-5 w-5" />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900">{rute.nama_rute}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-500 max-w-xs truncate" title={rute.deskripsi}>
                                        {rute.deskripsi || '-'}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                        <MapPin className="mr-1.5 h-3 w-3" />
                                        {rute.details_count} Pelanggan
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => onEdit(rute)}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4 transition-colors p-1 hover:bg-indigo-50 rounded"
                                        title="Edit"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(rute.id)}
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

export default RouteTable;
