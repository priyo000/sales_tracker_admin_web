import { MonitoringEmployee } from '../types';
import { cn } from '@/lib/utils';
import { BadgeCheck, MapPin, AlertTriangle, User } from 'lucide-react';

interface EmployeeCardProps {
    data: MonitoringEmployee;
    isSelected: boolean;
    onClick: () => void;
}

export const EmployeeCard = ({ data, isSelected, onClick }: EmployeeCardProps) => {
    const { karyawan, stats, color } = data;
    
    // Format currency IDR
    const formatIDR = (val: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(val);
    };

    return (
        <div 
            onClick={onClick}
            className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all duration-200 hover:shadow-md",
                isSelected 
                    ? "bg-indigo-50 border-indigo-200 shadow-sm" 
                    : "bg-white border-gray-100 hover:border-gray-200"
            )}
        >
            <div className="flex items-center gap-3 mb-3">
                <div 
                    className="h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: color }}
                >
                    {karyawan.nama_lengkap.substring(0, 2).toUpperCase()}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">{karyawan.nama_lengkap}</h3>
                    <p className="text-xs text-gray-500">{karyawan.kode_karyawan}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Planned */}
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" />
                    <div>
                        <span className="block text-[10px] text-gray-400 font-medium">Terencana</span>
                        <span className="font-semibold">{stats.planned_visited} / {stats.planned_total}</span>
                    </div>
                </div>

                {/* Unplanned */}
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <User className="h-3.5 w-3.5 text-orange-500" />
                    <div>
                        <span className="block text-[10px] text-gray-400 font-medium">Unplanned</span>
                        <span className="font-semibold">{stats.unplanned}</span>
                    </div>
                </div>

                {/* With Order */}
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <BadgeCheck className="h-3.5 w-3.5 text-green-500" />
                     <div>
                        <span className="block text-[10px] text-gray-400 font-medium">Dgn Pesanan</span>
                        <span className="font-semibold">{stats.with_order}</span>
                    </div>
                </div>

                {/* Out of Range */}
                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                    <AlertTriangle className={cn("h-3.5 w-3.5", stats.out_of_range > 0 ? "text-red-500" : "text-gray-400")} />
                     <div>
                        <span className="block text-[10px] text-gray-400 font-medium">Diluar Area</span>
                        <span className={cn("font-semibold", stats.out_of_range > 0 && "text-red-500")}>{stats.out_of_range}</span>
                    </div>
                </div>
            </div>

            {/* Sales Total */}
            <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    Sales Order
                </span>
                <span className="text-sm font-bold text-green-600">
                    {formatIDR(stats.sales_total)}
                </span>
            </div>
        </div>
    );
};
