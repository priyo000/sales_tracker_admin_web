import React, { useState, useEffect } from 'react';
import { Rute, RuteFormData } from '../types';
import { usePelanggan } from '../../pelanggan/hooks/usePelanggan';
import RouteCustomerMap from './RouteCustomerMap';
import { Search, Map as MapIcon, Route as RouteIcon, Info, CheckCircle2 } from 'lucide-react';
import api from '../../../services/api';
import { cn } from '@/lib/utils';

interface RouteFormProps {
    initialData?: Rute | null;
    onSubmit: (data: RuteFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const { pelanggans, fetchPelanggans, loading: pelanggansLoading } = usePelanggan();
    const [searchQuery, setSearchQuery] = useState('');
    const [detailsLoading, setDetailsLoading] = useState(false);
    
    const [formData, setFormData] = useState<RuteFormData>({
        nama_rute: initialData?.nama_rute || '',
        deskripsi: initialData?.deskripsi || '',
        customer_ids: []
    });

    // Fetch customers (active only)
    useEffect(() => {
        fetchPelanggans({ status: 'active' });
    }, [fetchPelanggans]);

    // Fetch existing route details if editing
    useEffect(() => {
        const fetchDetails = async () => {
            if (initialData?.id) {
                setDetailsLoading(true);
                try {
                    if (initialData.details && initialData.details.length > 0) {
                         const ids = initialData.details.map(d => d.pelanggan?.id || d.id_pelanggan);
                         setFormData(prev => ({ ...prev, customer_ids: ids }));
                    } else {
                        const response = await api.get(`/rute/${initialData.id}`);
                        const details = response.data.details || [];
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const ids = details.map((d: any) => d.pelanggan?.id || d.id_pelanggan);
                        setFormData(prev => ({ ...prev, customer_ids: ids }));
                    }
                } catch (error) {
                    console.error("Failed to fetch route details:", error);
                } finally {
                    setDetailsLoading(false);
                }
            }
        };

        if (initialData) {
            fetchDetails();
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleCustomer = (id: number) => {
        setFormData(prev => {
            const currentIds = prev.customer_ids || [];
            if (currentIds.includes(id)) {
                return { ...prev, customer_ids: currentIds.filter(cid => cid !== id) };
            } else {
                return { ...prev, customer_ids: [...currentIds, id] };
            }
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const filteredCustomers = pelanggans.filter(p => 
        p.nama_toko.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.alamat_usaha && p.alamat_usaha.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const isLoading = loading || detailsLoading;
    const selectedCount = formData.customer_ids?.length || 0;

    return (
        <form onSubmit={handleSubmit} className="flex h-[80vh] w-full bg-white overflow-hidden">
            {/* LEFT SIDEBAR - CONTROL PANEL */}
            <div className="w-[400px] flex flex-col border-r border-gray-200 bg-white z-10 shrink-0">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-100 bg-white space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                            <RouteIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">
                                {initialData ? 'Edit Data Rute' : 'Buat Rute Baru'}
                            </h2>
                            <p className="text-xs text-gray-500">Isi detail rute dan pilih pelanggan.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                         <div>
                            <input
                                name="nama_rute"
                                type="text"
                                required
                                className="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all font-medium placeholder:font-normal"
                                value={formData.nama_rute}
                                onChange={handleChange}
                                placeholder="Nama Rute (Ex: Rute Senin Barat)"
                            />
                        </div>
                         <div>
                            <input
                                name="deskripsi"
                                className="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all placeholder:font-normal"
                                value={formData.deskripsi}
                                onChange={handleChange}
                                placeholder="Keterangan / Deskripsi..."
                            />
                        </div>
                    </div>
                </div>

                {/* Search & List Header */}
                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 backdrop-blur-sm sticky top-0 z-20">
                    <div className="relative mb-2">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Cari Toko atau Alamat..."
                            className="w-full pl-9 pr-3 py-2 text-sm border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>Menampilkan {filteredCustomers.length} pelanggan</span>
                        <span className={cn("font-medium", selectedCount > 0 ? "text-indigo-600" : "")}>
                            Toat: {selectedCount} Terpilih
                        </span>
                    </div>
                </div>

                {/* SCROLLABLE LIST */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
                    {pelanggansLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                            <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                            <span className="text-xs">Memuat data pelanggan...</span>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                         <div className="flex flex-col items-center justify-center h-40 text-gray-400 space-y-2">
                            <Info className="h-8 w-8 opacity-20" />
                            <span className="text-xs">Tidak ada pelanggan ditemukan.</span>
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            const isSelected = formData.customer_ids?.includes(customer.id);
                            return (
                                <div 
                                    key={customer.id}
                                    onClick={() => toggleCustomer(customer.id)}
                                    className={cn(
                                        "relative p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md group",
                                        isSelected 
                                            ? "bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200" 
                                            : "bg-white border-gray-100 hover:border-indigo-200"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className={cn(
                                            "mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all",
                                            isSelected 
                                                ? "bg-indigo-600 text-white shadow-sm scale-110" 
                                                : "bg-gray-100 text-gray-300 group-hover:bg-indigo-100 group-hover:text-indigo-400"
                                        )}>
                                            {isSelected ? <CheckCircle2 className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className={cn(
                                                    "text-sm font-bold truncate pr-2",
                                                    isSelected ? "text-indigo-900" : "text-gray-800"
                                                )}>
                                                    {customer.nama_toko}
                                                </h4>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">
                                                {customer.alamat_usaha}
                                            </p>
                                            
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                 {customer.divisi && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                                        {customer.divisi.nama_divisi}
                                                    </span>
                                                )}
                                                {customer.status === 'active' && (
                                                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-50 text-green-700 border border-green-100">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-xl" />}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* FOOTER ACTIONS */}
                <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20 space-y-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                        <span>Total Rute:</span>
                        <span className="font-bold text-gray-800">{selectedCount} Stop Points</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 hover:text-gray-800 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 disabled:opacity-70 disabled:shadow-none transition-all active:scale-[0.98]"
                        >
                            {isLoading ? 'Menyimpan...' : 'Simpan Rute'}
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT MAIN - MAP */}
            <div className="flex-1 relative bg-slate-100">
                <RouteCustomerMap 
                    customers={pelanggans}
                    selectedIds={formData.customer_ids || []}
                    onToggle={toggleCustomer}
                    height="h-full"
                />
                
                {/* Floating Map Hint */}
                 <div className="absolute top-4 left-4 right-4 z-50 pointer-events-none flex justify-center">
                    <div className="bg-white/90 backdrop-blur shadow-lg border border-gray-200 px-4 py-2 rounded-full text-xs font-medium text-gray-600 flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-500">
                        <MapIcon className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Klik marker di peta untuk memilih/hapus pelanggan dari rute</span>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default RouteForm;
