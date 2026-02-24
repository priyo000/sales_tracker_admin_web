import React, { useState, useEffect } from 'react';
import { useNotifikasi } from '@/features/notifikasi/hooks/useNotifikasi';
import NotifikasiForm from '@/features/notifikasi/components/NotifikasiForm';
import { Bell, Plus, Search, Trash2, Clock, CheckCircle2, AlertCircle, Info, Trophy, User as UserIcon } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';

const NotifikasiPage = () => {
    const { notifikasies, isLoading, pagination, fetchNotifikasies, sendNotifikasi, deleteNotifikasi } = useNotifikasi();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchNotifikasies();
    }, [fetchNotifikasies]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchNotifikasies(1, searchTerm);
    };

    const getIcon = (jenis: string) => {
        switch (jenis) {
            case 'order': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'gamifikasi': return <Trophy className="h-4 w-4 text-yellow-500" />;
            case 'reminder': return <AlertCircle className="h-4 w-4 text-orange-500" />;
            case 'broadcast': return <AlertCircle className="h-4 w-4 text-purple-500" />;
            default: return <Info className="h-4 w-4 text-blue-500" />;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Notifikasi Mobile</h1>
                    <p className="text-sm text-gray-500">Kelola notifikasi yang dikirim ke aplikasi mobile sales.</p>
                </div>
                <button
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all active:scale-95"
                >
                    <Plus className="h-4 w-4" />
                    <span>Kirim Notifikasi</span>
                </button>
            </div>

            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <form onSubmit={handleSearch} className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                        placeholder="Cari notifikasi atau karyawan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Karyawan</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Detail Pesan</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Waktu</th>
                            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-gray-500">Memuat data...</td>
                            </tr>
                        ) : notifikasies.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-gray-500">Tidak ada notifikasi ditemukan.</td>
                            </tr>
                        ) : (
                            notifikasies.map((notif) => (
                                <tr key={notif.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                                                <UserIcon className="h-4 w-4" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-sm font-semibold text-gray-900">{notif.karyawan?.nama_lengkap || 'Unknown'}</div>
                                                <div className="text-xs text-gray-500">{notif.karyawan?.kode_karyawan || '-'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            {getIcon(notif.jenis)}
                                            <span className="text-sm font-bold text-gray-900">{notif.judul}</span>
                                        </div>
                                        <div className="mt-1 text-sm text-gray-500 line-clamp-2">{notif.pesan}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                            notif.is_read ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {notif.is_read ? 'Sudah Dibaca' : 'Terkirim'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <Clock className="mr-1 h-3 w-3" />
                                            {new Date(notif.created_at).toLocaleString('id-ID', { 
                                                day: '2-digit', 
                                                month: 'short', 
                                                year: 'numeric', 
                                                hour: '2-digit', 
                                                minute: '2-digit' 
                                            })}
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteNotifikasi(notif.id)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Placeholder */}
            {pagination.last_page > 1 && (
                <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
                    <div className="flex flex-1 justify-between sm:hidden">
                        <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</button>
                        <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</button>
                    </div>
                </div>
            )}

            {/* Modal Form */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                title="Kirim Notifikasi Baru"
                size="2xl"
            >
                <div className="flex items-center space-x-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <Bell className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Push Notification</h3>
                        <p className="text-xs text-gray-500">Pesan akan langsung muncul di HP sales.</p>
                    </div>
                </div>
                <NotifikasiForm
                    onSubmit={async (data) => {
                        const success = await sendNotifikasi(data);
                        if (success) setIsFormOpen(false);
                    }}
                    onCancel={() => setIsFormOpen(false)}
                    loading={isLoading}
                />
            </Modal>
        </div>
    );
};

export default NotifikasiPage;
