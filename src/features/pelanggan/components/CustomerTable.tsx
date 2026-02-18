import React from 'react';
import { Store, User, Phone, MapPin, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Pelanggan } from '../types';
import { getImageUrl } from '@/lib/utils';

interface CustomerTableProps {
    data: Pelanggan[];
    loading: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
    onEdit: (pelanggan: Pelanggan) => void;
    pagination?: {
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    };
    onPageChange?: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
}

const CustomerTable: React.FC<CustomerTableProps> = ({ 
    data, loading, onApprove, onReject, onEdit, 
    pagination, onPageChange, onPerPageChange 
}) => {
    return (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                Toko & Pemilik
                            </th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-500">
                                Kontak & Alamat
                            </th>
                            <th scope="col" className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-500">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-lg bg-gray-100"></div>
                                            <div className="ml-4 space-y-2">
                                                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                                <div className="h-3 w-24 bg-gray-100 rounded"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="h-3 w-40 bg-gray-100 rounded"></div>
                                            <div className="h-3 w-56 bg-gray-100 rounded"></div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="mx-auto h-6 w-16 bg-gray-100 rounded-full"></div></td>
                                    <td className="px-6 py-4"><div className="ml-auto h-8 w-20 bg-gray-100 rounded-lg"></div></td>
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                    Tidak ada data pelanggan ditemukan.
                                </td>
                            </tr>
                        ) : (
                            data.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition-all group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 shrink-0 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 overflow-hidden">
                                                {p.foto_toko_url ? (
                                                    <img src={getImageUrl(p.foto_toko_url)} alt="" className="h-full w-full object-cover" />
                                                ) : (
                                                    <Store className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="text-sm font-semibold text-gray-900">{p.nama_toko}</div>
                                                    {p.kode_pelanggan && (
                                                        <span className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-mono font-bold border border-gray-200">
                                                            {p.kode_pelanggan}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500 flex items-center mt-0.5">
                                                    <User className="h-3 w-3 mr-1" />
                                                    {p.nama_pemilik}
                                                </div>
                                                <div className="text-[10px] text-gray-400 flex items-center mt-1 font-medium">
                                                    <span className="font-bold text-[9px] bg-slate-100 text-slate-500 px-1 py-0.5 rounded-sm mr-1.5 leading-none">CREATOR</span>
                                                    {p.creator?.nama_lengkap || 'System'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs text-gray-900 flex items-center font-medium">
                                            <Phone className="h-3 w-3 mr-1.5 text-gray-400" />
                                            {p.no_hp_pribadi}
                                        </div>
                                        <div className="text-xs text-gray-500 flex items-start mt-1 max-w-xs sm:max-w-sm">
                                            <MapPin className="h-3 w-3 mr-1.5 mt-0.5 text-gray-400 shrink-0" />
                                            <span className="line-clamp-1 truncate" title={p.alamat_usaha}>
                                                {p.alamat_usaha}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                                            p.status === 'active' ? 'bg-green-100 text-green-700' :
                                            p.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                            p.status === 'nonactive' ? 'bg-gray-100 text-gray-700' :
                                            'bg-amber-100 text-amber-700'
                                        }`}>
                                            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
                                                p.status === 'active' ? 'bg-green-600' :
                                                p.status === 'rejected' ? 'bg-red-600' :
                                                p.status === 'nonactive' ? 'bg-gray-500' :
                                                'bg-amber-600'
                                            }`}></span>
                                            {p.status === 'nonactive' ? 'Non-Active' : p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                onClick={() => onEdit(p)}
                                                className="inline-flex items-center rounded-lg bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-all hover:scale-105 active:scale-95"
                                            >
                                                Edit
                                            </button>
                                            {p.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => onApprove(p.id)}
                                                        className="inline-flex items-center rounded-lg bg-green-50 px-2 py-1 text-xs font-bold text-green-700 hover:bg-green-100 border border-green-200 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <Check className="mr-1 h-3 w-3" /> Approve
                                                    </button>
                                                    <button
                                                        onClick={() => onReject(p.id)}
                                                        className="inline-flex items-center rounded-lg bg-red-50 px-2 py-1 text-xs font-bold text-red-700 hover:bg-red-100 border border-red-200 transition-all hover:scale-105 active:scale-95"
                                                    >
                                                        <X className="mr-1 h-3 w-3" /> Reject
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.lastPage > 1 && (
                <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange?.(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.lastPage}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center gap-6">
                            <p className="text-sm text-gray-600">
                                Menampilkan <span className="font-bold text-gray-900">{data.length}</span> dari{' '}
                                <span className="font-bold text-gray-900">{pagination.total}</span> total data
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-500">Tampilkan:</span>
                                <div className="relative">
                                    <select 
                                        className="appearance-none block w-full pl-3 pr-8 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-400"
                                        value={pagination.perPage}
                                        onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                                    >
                                        <option value={10}>10 Baris</option>
                                        <option value={20}>20 Baris</option>
                                        <option value={50}>50 Baris</option>
                                        <option value={100}>100 Baris</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange?.(pagination.currentPage - 1)}
                                    disabled={pagination.currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                
                                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                                    .filter(p => {
                                        if (pagination.lastPage <= 7) return true;
                                        return Math.abs(p - pagination.currentPage) <= 1 || p === 1 || p === pagination.lastPage;
                                    })
                                    .map((p, i, arr) => (
                                        <React.Fragment key={p}>
                                            {i > 0 && arr[i-1] !== p - 1 && (
                                                <span className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-700 font-mono tracking-tighter">...</span>
                                            )}
                                            <button
                                                onClick={() => onPageChange?.(p)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold transition-all ${
                                                    pagination.currentPage === p
                                                        ? 'z-10 bg-indigo-600 border-indigo-600 text-white'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    ))}

                                <button
                                    onClick={() => onPageChange?.(pagination.currentPage + 1)}
                                    disabled={pagination.currentPage === pagination.lastPage}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerTable;
