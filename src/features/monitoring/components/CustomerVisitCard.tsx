import { VisitPoint } from '../types';
import { Clock, MapPin, Camera, AlertTriangle, CheckCircle, Smartphone, BadgeCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal'; 

interface CustomerVisitCardProps {
    point: VisitPoint;
    onClick?: () => void;
}

export const CustomerVisitCard = ({ point, onClick }: CustomerVisitCardProps) => {
    const { pelanggan, visit, status, type } = point;
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);

    // Get time formatted
    const formatTime = (isoString?: string) => {
        if (!isoString) return '-';
        return new Date(isoString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    // Helper for Currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
    };

    // Get images
    const images = [visit?.foto_1_url, visit?.foto_2_url, visit?.foto_3_url, visit?.foto_4_url].filter(Boolean);

    // Status Badge Logic
    let statusBadge = (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-[10px] font-medium tracking-wide">
            <Clock className="h-3 w-3" /> BELUM
        </span>
    );

    if (status === 'visited') {
        if (type === 'unplanned') {
            statusBadge = (
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-medium tracking-wide border border-orange-100">
                    <AlertTriangle className="h-3 w-3" /> UNPLANNED
                </span>
            );
        } else {
            statusBadge = (
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-medium tracking-wide border border-green-100">
                    <CheckCircle className="h-3 w-3" /> DIKUNJUNGI
                </span>
            );
        }
    }

    // Distance warning
    const isOutOfRange = (visit?.jarak_validasi || 0) > 100;

    return (
        <div 
            onClick={onClick}
            className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition-all mb-3 last:mb-0 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-blue-100"
        >
            {/* Header */}
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200 font-mono tracking-tight">
                            {pelanggan.kode_pelanggan || '-'}
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-1">{pelanggan.nama_toko}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{pelanggan.alamat}</p>
                </div>
                <div className="shrink-0 ml-2">
                    {statusBadge}
                </div>
            </div>

            {/* Visit Details - Always Shown */}
            <div className="space-y-3 mt-3 pt-3 border-t border-gray-50">
                {/* Time & Distance Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                    {/* Time */}
                    <div className="flex items-start gap-2 text-gray-600">
                        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Clock className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <span className="text-gray-400 text-[10px] block font-medium uppercase tracking-wider mb-0.5">Waktu Check-in</span>
                            <span className="font-semibold text-gray-900 block">
                                {visit ? formatTime(visit.waktu_check_in) : '-'}
                            </span>
                            {visit?.waktu_check_out && (
                                <span className="text-gray-400 text-[10px] block mt-0.5">
                                    out: {formatTime(visit.waktu_check_out)}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Distance */}
                    <div className="flex items-start gap-2 text-gray-600">
                        <div className={cn("p-1.5 rounded-lg", isOutOfRange ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600")}>
                            <MapPin className="h-3.5 w-3.5" />
                        </div>
                        <div>
                            <span className="text-gray-400 text-[10px] block font-medium uppercase tracking-wider mb-0.5">Jarak Check-in</span>
                            <span className={cn("font-semibold block", isOutOfRange ? "text-red-700" : "text-gray-900")}>
                                {visit?.jarak_validasi ? `${Math.round(visit.jarak_validasi)} Meter` : '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Additional Visit Info Only if Visited */}
                {visit && (
                    <>
                        {/* Order Details */}
                        {visit.pesanan ? (
                            <div className="bg-green-50 text-green-700 p-3 rounded-lg text-xs border border-green-100 shadow-sm shadow-green-50/50">
                                <div className="flex items-center gap-2 mb-2 font-semibold border-b border-green-200 pb-2">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span>Rincian Order</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-[10px] text-green-600 block mb-0.5 uppercase tracking-wider">Jumlah Item</span>
                                        <span className="font-bold text-sm">{visit.pesanan.items_count || 0}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-green-600 block mb-0.5 uppercase tracking-wider">Total Order</span>
                                        <span className="font-bold text-sm">
                                            {formatCurrency(visit.pesanan.total_tagihan || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                             visit.status_transaksi && (
                                <div className="bg-green-50 text-green-700 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border border-green-100 shadow-sm shadow-green-50/50">
                                    <BadgeCheck className="h-4 w-4" />
                                    <span className="font-semibold">Ada Pesanan (Data detail belum tersedia)</span>
                                </div>
                            )
                        )}
                        
                        {/* Images Button */}
                        {images.length > 0 && (
                            <button 
                                onClick={(e) => { 
                                    e.stopPropagation(); // Prevent card click
                                    setIsImageModalOpen(true); 
                                }}
                                className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 rounded-lg border border-gray-200 transition-colors group"
                            >
                                <Camera className="h-3.5 w-3.5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                                Lihat {images.length} Foto Bukti
                            </button>
                        )}
    
                        {/* Out of Range Alert */}
                        {isOutOfRange && (
                            <div className="flex items-start gap-2 text-red-600 text-[11px] bg-red-50 p-2 rounded-lg border border-red-100">
                                <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                <span>Check-in dilakukan diluar area toleransi (&gt;100m).</span>
                            </div>
                        )}
                    </>
                )}
                
                {/* Empty State Footer if Not Visited */}
                {!visit && (
                     <div className="pt-1 mt-1">
                        <p className="text-[11px] text-gray-400 italic flex items-center gap-1.5">
                            <Smartphone className="h-3 w-3 text-gray-300" />
                            Belum dikunjungi
                        </p>
                    </div>
                )}
            </div>

            {/* Image Modal */}
            <Modal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                title="Bukti Foto Kunjungan"
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    {images.map((img, idx) => (
                        <div key={idx} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                            <img src={img as string} alt={`Bukti ${idx+1}`} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm">
                                Foto {idx + 1}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => setIsImageModalOpen(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </Modal>
        </div>
    );
}
