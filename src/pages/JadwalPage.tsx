import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon, Search, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useJadwal } from '../features/jadwal/hooks/useJadwal';
import JadwalForm from '../features/jadwal/components/JadwalForm';
import MasterSchedule from '../features/jadwal/components/MasterSchedule';
import { Modal, ConfirmModal } from '../components/ui/Modal';
import { Jadwal, JadwalFormData } from '../features/jadwal/types';

const formatDateDisplay = (dateString: string) => {
    if (!dateString) return '-';
    // Format: "Sen, 12-03-2024"
    const date = new Date(dateString);
    const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${dayName}, ${day}-${month}-${year}`;
};

const JadwalPage: React.FC = () => {
    const { 
        jadwals, 
        loading, 
        error: hookError, 
        karyawanOptions, 
        ruteOptions, 
        fetchJadwals, 
        fetchOptions, 
        createJadwal,
        updateJadwal,
        deleteJadwal
    } = useJadwal();

    const [activeTab, setActiveTab] = useState<'daily' | 'recurring'>('daily');
    
    // Default date to Today
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const [startDate, setStartDate] = useState(todayStr);
    const [endDate, setEndDate] = useState(todayStr);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    // Initial Load & Date Change
    // Initial Load & Filter Change
    // Initial Load & Filter Change
    useEffect(() => {
        fetchOptions();
    }, [fetchOptions]);

    useEffect(() => {
        if (activeTab === 'daily') {
            const timer = setTimeout(() => {
                const params: { start_date?: string; end_date?: string; search?: string } = {};
                if (startDate) params.start_date = startDate;
                if (endDate) params.end_date = endDate;
                if (searchTerm) params.search = searchTerm;
                fetchJadwals(params);
            }, 500); // Debounce search
            return () => clearTimeout(timer);
        }
    }, [startDate, endDate, searchTerm, activeTab, fetchJadwals]);

    const handleOpenModal = () => {
        setEditingJadwal(null);
        setIsModalOpen(true);
    };

    const handleEditJadwal = (jadwal: Jadwal) => {
        setEditingJadwal(jadwal);
        setIsModalOpen(true);
    };

    const handleCreateOrUpdateJadwal = async (data: JadwalFormData) => {
        let result;
        if (editingJadwal) {
            result = await updateJadwal(editingJadwal.id, data);
        } else {
            result = await createJadwal(data);
        }

        if (result.success) {
            toast.success(editingJadwal ? 'Jadwal berhasil diperbarui' : 'Jadwal harian berhasil dibuat');
            setIsModalOpen(false);
            setEditingJadwal(null);
            refreshData();
        } else {
            toast.error(result.message || 'Gagal menyimpan jadwal');
        }
    };

    const handleDeleteJadwal = (id: number) => {
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (deletingId) {
            const result = await deleteJadwal(deletingId);
            if (result.success) {
                toast.success('Jadwal berhasil dihapus');
                setDeletingId(null);
                refreshData();
            } else {
                toast.error(result.message || 'Gagal menghapus jadwal');
            }
        }
    };

    const refreshData = () => {
        if (!startDate && !endDate && !searchTerm) {
            fetchJadwals({});
        } else {
            const params: { start_date?: string; end_date?: string; search?: string } = {};
            if (startDate) params.start_date = startDate;
            if (endDate) params.end_date = endDate;
            if (searchTerm) params.search = searchTerm;
            fetchJadwals(params);
        }
    };

    const combinedError = hookError;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Penjadwalan</h1>
                    <p className="text-sm text-gray-500">
                        Atur jadwal kunjungan sales. Gunakan tab <b>Master Jadwal</b> untuk pengaturan pola mingguan otomatis, 
                        dan tab <b>Jadwal Harian</b> untuk melihat jadwal hari ini atau menambahkan perubahan manual.
                    </p>
                </div>
                
                {activeTab === 'daily' && (
                    <button 
                        onClick={handleOpenModal}
                        className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Tambah Jadwal Manual
                    </button>
                )}
            </div>

            {/* Tabs Sidebar-like or Top Tabs */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('daily')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all border-b-2 outline-none",
                        activeTab === 'daily' 
                            ? "border-indigo-600 text-indigo-600 bg-indigo-50/10" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                >
                    Jadwal Harian
                </button>
                <button
                    onClick={() => setActiveTab('recurring')}
                    className={cn(
                        "px-6 py-3 text-sm font-bold transition-all border-b-2 outline-none",
                        activeTab === 'recurring' 
                            ? "border-indigo-600 text-indigo-600 bg-indigo-50/10" 
                            : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    )}
                >
                    Master Jadwal (Recurring)
                </button>
            </div>

            {activeTab === 'daily' ? (
                <div className="space-y-6 animate-in fade-in duration-300">

            {/* Improved Filter UI */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap items-center gap-4">
                {/* Search Field */}
                <div className="relative flex-1 min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                        placeholder="Cari Sales, Kode, atau Rute..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Date Filter */}
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
                    {/* <CalendarIcon className="h-4 w-4 text-gray-500" /> */}
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-sm focus:ring-0 text-gray-600 w-32"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Dari"
                    />
                    <span className="text-gray-400">-</span>
                    <input 
                        type="date" 
                        className="bg-transparent border-none p-0 text-sm focus:ring-0 text-gray-600 w-32"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Sampai"
                    />
                </div>

                {/* Reset Button */}
                {(startDate || endDate || searchTerm) && (
                    <button 
                        onClick={() => { setStartDate(''); setEndDate(''); setSearchTerm(''); }}
                        className="px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                    >
                        Reset Filter
                    </button>
                )}
            </div>

            {/* Error Message */}
            {combinedError && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700">{combinedError}</div>
                </div>
            )}

            {/* Table Content */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sales</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rute</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jumlah Toko</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading && jadwals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 animate-pulse">
                                        Memuat data jadwal...
                                    </td>
                                </tr>
                            ) : jadwals.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center justify-center">
                                            <CalendarIcon className="h-10 w-10 text-gray-300 mb-2" />
                                            <p className="text-gray-500 text-sm">Tidak ada data jadwal ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                jadwals.map((jadwal) => (
                                    <tr key={jadwal.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium font-mono">
                                            {formatDateDisplay(jadwal.tanggal)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">{jadwal.karyawan?.nama_lengkap}</div>
                                            <div className="text-xs text-gray-500">{jadwal.karyawan?.kode_karyawan}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {jadwal.rute?.nama_rute}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {jadwal.rute?.details_count || jadwal.rute?.details?.length || '-'} Toko
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleEditJadwal(jadwal)}
                                                    className="text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 p-2 rounded-full transition-colors"
                                                    title="Edit Jadwal"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteJadwal(jadwal.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                    title="Hapus / Batalkan Jadwal"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

                </div>
            ) : (
                <div className="animate-in fade-in duration-300">
                    <MasterSchedule 
                        karyawanOptions={karyawanOptions}
                        ruteOptions={ruteOptions}
                    />
                </div>
            )}

            {/* Create Schedule Modal (Exceptions) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingJadwal ? "Edit Jadwal" : "Tambah Jadwal Manual"}
                size="md"
            >
               <JadwalForm 
                    key={editingJadwal ? editingJadwal.id : 'create'}
                    initialData={editingJadwal || undefined}
                    existingJadwals={jadwals}
                    onSubmit={handleCreateOrUpdateJadwal}
                    onCancel={() => setIsModalOpen(false)}
                    karyawanOptions={karyawanOptions}
                    ruteOptions={ruteOptions}
                    initialDate={new Date().toISOString().slice(0, 10)}
                    loading={loading}
               />
                {hookError && (
                    <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                        {hookError}
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deletingId}
                onClose={() => setDeletingId(null)}
                onConfirm={confirmDelete}
                title="Hapus Jadwal"
                message="Apakah Anda yakin ingin menghapus/membatalkan jadwal ini?"
                type="danger"
                confirmText="Hapus"
            />
        </div>
    );
};

export default JadwalPage;
