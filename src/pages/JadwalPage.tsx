import React, { useEffect, useState } from 'react';
import { Plus, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useJadwal } from '../features/jadwal/hooks/useJadwal';
import JadwalCard from '../features/jadwal/components/JadwalCard';
import JadwalForm from '../features/jadwal/components/JadwalForm';
import { Modal } from '../components/ui/Modal';
import { JadwalFormData } from '../features/jadwal/types';

const JadwalPage: React.FC = () => {
    const { 
        jadwals, 
        loading, 
        error: hookError, 
        karyawanOptions, 
        ruteOptions, 
        fetchJadwals, 
        fetchOptions, 
        createJadwal 
    } = useJadwal();

    const [date, setDate] = useState(new Date().toISOString().slice(0, 10)); // YYYY-MM-DD
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Initial Load & Date Change
    useEffect(() => {
        fetchJadwals(date);
    }, [date, fetchJadwals]);

    // Handle Open Modal
    const handleOpenModal = () => {
        fetchOptions(); // Refresh options when opening
        setIsModalOpen(true);
    };

    const handleCreateJadwal = async (data: JadwalFormData) => {
        const result = await createJadwal(data);
        if (result.success) {
            toast.success('Jadwal berhasil dibuat');
            setIsModalOpen(false);
            if (data.tanggal === date) {
                fetchJadwals(date); // Refresh list if same date
            }
        } else {
            toast.error(result.message || 'Gagal membuat jadwal');
        }
    };

    const combinedError = hookError;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">Jadwal Kunjungan Sales</h1>
                <button 
                    onClick={handleOpenModal}
                    className="flex items-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 shadow-sm transition-colors"
                >
                    <Plus className="mr-2 h-4 w-4" /> Buat Jadwal
                </button>
            </div>

            {/* Date Filter */}
            <div className="flex items-center space-x-3 bg-white p-3 rounded-lg shadow-sm border border-gray-100 max-w-xs">
                <CalendarIcon className="h-5 w-5 text-gray-500" />
                <input 
                    type="date" 
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />
            </div>

            {/* Error Message */}
            {combinedError && (
                <div className="rounded-md bg-red-50 p-4 border border-red-200">
                    <div className="text-sm text-red-700">{combinedError}</div>
                </div>
            )}

            {/* Content */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading && jadwals.length === 0 ? (
                    // Skeleton Loading
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-lg bg-gray-100 h-40"></div>
                    ))
                ) : jadwals.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-white rounded-lg border border-dashed border-gray-300">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-2 text-sm font-semibold text-gray-900">Tidak ada jadwal</h3>
                        <p className="mt-1 text-sm text-gray-500">Belum ada kunjungan dijadwalkan untuk tanggal ini.</p>
                        <div className="mt-6">
                            <button
                                onClick={handleOpenModal}
                                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                                Buat Jadwal Sekarang
                            </button>
                        </div>
                    </div>
                ) : (
                    jadwals.map((jadwal) => (
                        <JadwalCard key={jadwal.id} jadwal={jadwal} />
                    ))
                )}
            </div>

            {/* Create Schedule Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Buat Jadwal Kunjungan"
                size="md"
            >
               {/* Pass form props */}
               <JadwalForm 
                    onSubmit={handleCreateJadwal}
                    onCancel={() => setIsModalOpen(false)}
                    karyawanOptions={karyawanOptions}
                    ruteOptions={ruteOptions}
                    initialDate={date} // Pre-fill with selected filter date
                    loading={loading} // Use hook loading state
               />
                {/* Error inside modal if any specific to creating */}
                {hookError && (
                    <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded">
                        {hookError}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default JadwalPage;
