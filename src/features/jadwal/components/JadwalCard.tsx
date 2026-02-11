import React from 'react';
import { User } from 'lucide-react';
import { Jadwal } from '../types';

interface JadwalCardProps {
    jadwal: Jadwal;
}

const JadwalCard: React.FC<JadwalCardProps> = ({ jadwal }) => {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        ongoing: 'bg-blue-100 text-blue-800',
        selesai: 'bg-green-100 text-green-800',
        dibatalkan: 'bg-red-100 text-red-800',
    };

    const statusLabel = jadwal.status || 'Belum Mulai';
    const statusClass = statusColors[jadwal.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800';

    return (
        <div className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow duration-200 border border-gray-100">
            <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                        <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">{jadwal.karyawan?.nama_lengkap || 'Unknown Sales'}</h3>
                        <p className="text-xs text-gray-500">{jadwal.karyawan?.jabatan || 'Sales'}</p>
                    </div>
                </div>
            </div>
            <div className="p-4 space-y-3">
                <div className="flex justify-between items-center group">
                    <span className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">Rute</span>
                    <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">{jadwal.rute?.nama_rute}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold leading-5 ${statusClass}`}>
                        {statusLabel.charAt(0).toUpperCase() + statusLabel.slice(1)}
                    </span>
                </div>
                
                {/* Future Actions */}
                {/* <button className="w-full mt-2 rounded border border-indigo-600 px-3 py-1.5 text-sm font-medium text-indigo-600 hover:bg-indigo-50 transition-colors">
                    Lihat Detail
                </button> */}
            </div>
        </div>
    );
};

export default JadwalCard;
