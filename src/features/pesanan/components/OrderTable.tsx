import React from 'react';
import { Eye, Clock } from 'lucide-react';
import { Pesanan } from '../types';

interface OrderTableProps {
    data: Pesanan[];
    loading: boolean;
    onViewDetail: (id: number) => void;
}

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'sukses': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'batal': return 'bg-red-100 text-red-800';
        case 'proses': return 'bg-blue-100 text-blue-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const OrderTable: React.FC<OrderTableProps> = ({ data, loading, onViewDetail }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Pesanan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            Toko & Sales
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Total
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                            Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                    {loading ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                <div className="flex flex-col items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-2"></div>
                                    Memuat pesanan...
                                </div>
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                                Belum ada pesanan.
                            </td>
                        </tr>
                    ) : (
                        data.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-sm font-bold text-gray-900">{p.no_pesanan}</div>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <Clock className="mr-1 h-3 w-3" /> {p.tanggal}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{p.nama_toko}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{p.sales}</div>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <div className="text-sm font-bold text-gray-900">
                                        Rp {p.total_harga.toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center whitespace-nowrap">
                                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(p.status)}`}>
                                        <span className={`w-1.5 h-1.5 mr-1.5 rounded-full ${
                                            p.status.toLowerCase() === 'sukses' ? 'bg-green-500' :
                                            p.status.toLowerCase() === 'batal' ? 'bg-red-500' :
                                            p.status.toLowerCase() === 'proses' ? 'bg-blue-500' : 'bg-yellow-500'
                                        }`}></span>
                                        {p.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right whitespace-nowrap">
                                    <button 
                                        onClick={() => onViewDetail(p.id)}
                                        className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded transition-colors"
                                        title="Lihat Detail"
                                    >
                                        <Eye className="h-5 w-5" />
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

export default OrderTable;
