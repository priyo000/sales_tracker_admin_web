import React from 'react';
import { Store, MapPin, Phone, Check, X } from 'lucide-react';
import { Pelanggan, PelangganStatus } from '../types';
import { cn } from '@/lib/utils'; // Assuming this exists or I'll implement inline if needed

interface CustomerCardProps {
    pelanggan: Pelanggan;
    onApprove: (id: number) => void;
    onReject: (id: number) => void;
}

const CustomerCard: React.FC<CustomerCardProps> = ({ pelanggan, onApprove, onReject }) => {
    return (
        <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-lg transition-shadow duration-300">
            <div className="h-32 bg-gray-200 relative">
                {pelanggan.foto_toko ? (
                    <img 
                        src={pelanggan.foto_toko} 
                        alt={pelanggan.nama_toko} 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = ''; // Fallback logic or just hide
                            (e.target as HTMLImageElement).parentElement?.classList.add('bg-gray-200');
                        }}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400 bg-gray-100">
                        <Store className="h-12 w-12 opacity-50" />
                    </div>
                )}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                    pelanggan.status === 'active' ? 'bg-green-500' :
                    pelanggan.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`}>
                    {pelanggan.status}
                </div>
            </div>
            
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 truncate" title={pelanggan.nama_toko}>
                    {pelanggan.nama_toko}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{pelanggan.nama_pemilik}</p>
                
                <div className="space-y-2 mb-4">
                    <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="line-clamp-2">{pelanggan.alamat_toko}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <Phone className="mr-2 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span>{pelanggan.no_hp_pemilik}</span>
                    </div>
                </div>

                {pelanggan.status === 'pending' && (
                    <div className="flex space-x-2 border-t border-gray-100 pt-4 mt-auto">
                        <button 
                            onClick={() => onApprove(pelanggan.id)}
                            className="flex flex-1 items-center justify-center rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-colors border border-green-200"
                        >
                            <Check className="mr-2 h-4 w-4" /> Approve
                        </button>
                        <button 
                            onClick={() => onReject(pelanggan.id)}
                            className="flex flex-1 items-center justify-center rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors border border-red-200"
                        >
                            <X className="mr-2 h-4 w-4" /> Reject
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerCard;
