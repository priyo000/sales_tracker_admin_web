import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { Pelanggan } from '../../pelanggan/types';
import { Rute, RuteFormData } from '../types';
import { usePelanggan } from '../../pelanggan/hooks/usePelanggan';
import RouteCustomerMap from './RouteCustomerMap';
import { Search, Map as MapIcon, Info, CheckCircle2, User as UserIcon } from 'lucide-react';
import api from '../../../services/api';
import { cn } from '@/lib/utils';

interface RouteFormProps {
    initialData?: Rute | null;
    onSubmit: (data: RuteFormData) => void;
    onCancel: () => void;
    loading?: boolean;
}

interface SalesFilterOption {
    id: number;
    nama_lengkap: string;
    jabatan: string;
    has_account: boolean;
    has_data: boolean;
}

const RouteForm: React.FC<RouteFormProps> = ({ initialData, onSubmit, onCancel, loading }) => {
    const { pelanggans, fetchPelanggans, fetchFilterOptions, loading: pelanggansLoading } = usePelanggan();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOptions, setFilterOptions] = useState<SalesFilterOption[]>([]);
    const [selectedKaryawanId, setSelectedKaryawanId] = useState<number | 'all'>('all');
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [focusLocation, setFocusLocation] = useState<{ lat: number, lng: number, timestamp: number } | null>(null);
    
    const [formData, setFormData] = useState<RuteFormData>({
        nama_rute: initialData?.nama_rute || '',
        deskripsi: initialData?.deskripsi || '',
        customer_ids: []
    });
    const [namaRute, setNamaRute] = useState(initialData?.nama_rute || '');
    const [deskripsi, setDeskripsi] = useState(initialData?.deskripsi || '');

    // Fetch sales filter options
    useEffect(() => {
        const loadOptions = async () => {
            const options = await fetchFilterOptions({ only_with_data: true });
            setFilterOptions(options);
        };
        loadOptions();
    }, [fetchFilterOptions]);

    // Fetch customers (active & pending)
    useEffect(() => {
        fetchPelanggans({ 
            status: 'active,pending', 
            per_page: -1,
            id_karyawan: selectedKaryawanId === 'all' ? undefined : selectedKaryawanId
        });
    }, [fetchPelanggans, selectedKaryawanId]);

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

    const toggleCustomer = useCallback((id: number) => {
        setFormData(prev => {
            const currentIds = prev.customer_ids || [];
            if (currentIds.includes(id)) {
                return { ...prev, customer_ids: currentIds.filter(cid => cid !== id) };
            } else {
                return { ...prev, customer_ids: [...currentIds, id] };
            }
        });

        // Focus map on this customer
        const customer = pelanggans.find(p => p.id === id);
        if (customer?.latitude && customer?.longitude) {
            setFocusLocation({ 
                lat: customer.latitude, 
                lng: customer.longitude, 
                timestamp: Date.now() 
            });
        }

        // Auto-scroll list and focus
        setTimeout(() => {
            const element = document.getElementById(`customer-item-${id}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('ring-4', 'ring-indigo-400', 'ring-offset-2', 'z-30');
                setTimeout(() => {
                    element.classList.remove('ring-4', 'ring-indigo-400', 'ring-offset-2', 'z-30');
                }, 1500);
            }
        }, 100);
    }, [pelanggans]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({
            ...formData,
            nama_rute: namaRute,
            deskripsi: deskripsi
        });
    };

    const filteredCustomers = useMemo(() => {
        return pelanggans.filter(p => 
            p.nama_toko.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.alamat_usaha && p.alamat_usaha.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [pelanggans, searchQuery]);

    const selectedIdsSet = useMemo(() => new Set(formData.customer_ids), [formData.customer_ids]);

    const isLoading = loading || detailsLoading;
    const selectedCount = formData.customer_ids?.length || 0;

    return (
        <form onSubmit={handleSubmit} className="flex h-[80vh] w-full bg-white overflow-hidden">
            {/* LEFT SIDEBAR - CONTROL PANEL */}
            <div className="w-[400px] flex flex-col border-r border-gray-200 bg-white z-10 shrink-0">
                {/* Header Section */}
                <div className="p-6 border-b border-gray-100 bg-white space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div>
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
                                value={namaRute}
                                onChange={(e) => setNamaRute(e.target.value)}
                                placeholder="Nama Rute (Ex: Rute Senin Barat)"
                            />
                        </div>
                         <div>
                            <input
                                name="deskripsi"
                                className="block w-full rounded-lg border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all placeholder:font-normal"
                                value={deskripsi}
                                onChange={(e) => setDeskripsi(e.target.value)}
                                placeholder="Keterangan / Deskripsi..."
                            />
                        </div>
                    </div>
                </div>

                {/* Search & List Header */}
                <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200 backdrop-blur-sm sticky top-0 z-20 space-y-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Cari Toko atau Alamat..."
                            className="w-full pl-9 pr-3 py-2 text-sm border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <select
                            className="w-full pl-9 pr-3 py-2 text-sm border-gray-200 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 shadow-sm bg-white"
                            value={selectedKaryawanId}
                            onChange={(e) => setSelectedKaryawanId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        >
                            <option value="all">Semua Sales (Karyawan)</option>
                            {filterOptions.map(opt => (
                                <option key={opt.id} value={opt.id}>
                                    {opt.nama_lengkap} {!opt.has_account ? '(No Account)' : ''} {opt.has_data ? '✓' : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 px-1">
                        <span>Menampilkan {filteredCustomers.length} pelanggan</span>
                        <span className={cn("font-medium", selectedCount > 0 ? "text-indigo-600" : "")}>
                            Total: {selectedCount} Terpilih
                        </span>
                    </div>
                </div>

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
                        <CustomerListItems 
                            customers={filteredCustomers} 
                            selectedIds={selectedIdsSet} 
                            onToggle={toggleCustomer} 
                        />
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
                    selectedIds={selectedIdsSet}
                    onToggle={toggleCustomer}
                    focusLocation={focusLocation || null}
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


// MEMOIZED COMPONENTS FOR PERFORMANCE
const CustomerListItems = memo(({ customers, selectedIds, onToggle }: { customers: Pelanggan[], selectedIds: Set<number> | number[], onToggle: (id: number) => void }) => {
    return (
        <>
            {customers.map(customer => {
                const isSelected = selectedIds instanceof Set 
                    ? selectedIds.has(customer.id) 
                    : selectedIds.includes(customer.id);
                return (
                    <CustomerItem 
                        key={customer.id} 
                        customer={customer} 
                        isSelected={isSelected} 
                        onToggle={onToggle} 
                    />
                );
            })}
        </>
    );
});

const CustomerItem = memo(({ customer, isSelected, onToggle }: { customer: Pelanggan, isSelected: boolean, onToggle: (id: number) => void }) => {
    return (
        <div 
            id={`customer-item-${customer.id}`}
            onClick={() => onToggle(customer.id)}
            className={cn(
                "relative p-3 rounded-xl border transition-all duration-300 cursor-pointer hover:shadow-md group",
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
                        {customer.details_rute && customer.details_rute.length > 0 && (
                            <div className="w-full flex flex-wrap gap-1 mb-1">
                                {customer.details_rute.map((dr) => (
                                    <span key={dr.id} className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                        Rute: {dr.rute?.nama_rute || 'Unknown'}
                                    </span>
                                ))}
                            </div>
                        )}
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
                        {customer.status === 'pending' && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-100">
                                Pending
                            </span>
                        )}
                    </div>
                </div>
            </div>
            {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-r-xl" />}
        </div>
    );
});
