import React, { useState } from 'react';
import { Save, Calendar, MapPin, LayoutList, CheckCircle2 } from 'lucide-react';
import { RuteOption, GroupRuteMingguan } from '../types';
import { cn } from '@/lib/utils';

interface GroupRuteFormProps {
    ruteOptions: RuteOption[];
    onSave: (data: Partial<GroupRuteMingguan>) => void;
    loading?: boolean;
    initialData?: GroupRuteMingguan;
    onCancel: () => void;
}

const DAYS = [
    { id: 1, label: 'Senin' },
    { id: 2, label: 'Selasa' },
    { id: 3, label: 'Rabu' },
    { id: 4, label: 'Kamis' },
    { id: 5, label: 'Jumat' },
    { id: 6, label: 'Sabtu' },
    { id: 7, label: 'Minggu' },
];

const GroupRuteForm: React.FC<GroupRuteFormProps> = ({ ruteOptions, onSave, loading, initialData, onCancel }) => {
    const [namaGroup, setNamaGroup] = useState(initialData?.nama_group || '');
    
    // Convert details array to object map: { [hari]: ruteId }
    const initialDetails = initialData?.details.reduce((acc, curr) => {
        acc[curr.hari] = curr.id_rute;
        return acc;
    }, {} as Record<number, number | ''>) || {};

    const [details, setDetails] = useState<Record<number, number | ''>>(initialDetails);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formattedDetails = Object.entries(details)
            .filter(([, ruteId]) => ruteId !== '')
            .map(([hari, ruteId]) => ({
                hari: Number(hari),
                id_rute: Number(ruteId)
            }));

        if (!namaGroup) return;
        
        onSave({
            nama_group: namaGroup,
            // @ts-expect-error backend expects this structure
            details: formattedDetails
        });
    };

    const isDaySelected = (dayId: number) => details[dayId] !== '' && details[dayId] !== undefined;

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-300">
            {/* Header Section */}
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-tight mb-2">
                    <LayoutList className="h-4 w-4 text-indigo-600" />
                    Nama Template
                </label>
                <input 
                    type="text" 
                    className="w-full border border-slate-200 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm text-base"
                    placeholder="Contoh: Rute Area Utara - Minggu 1"
                    value={namaGroup}
                    onChange={(e) => setNamaGroup(e.target.value)}
                    required
                />
                <p className="text-xs text-slate-400 mt-2 ml-1">Berikan nama yang jelas untuk memudahkan identifikasi paket rute ini.</p>
            </div>

            {/* Days Grid */}
            <div>
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4 px-1">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    Pengaturan Hari
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {DAYS.map(day => (
                        <div 
                            key={day.id} 
                            className={cn(
                                "relative group flex flex-col gap-2 p-4 border rounded-xl transition-all duration-200",
                                isDaySelected(day.id) 
                                    ? "bg-indigo-50/30 border-indigo-200 shadow-sm" 
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                            )}
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className={cn(
                                    "text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                                    isDaySelected(day.id) ? "text-indigo-700" : "text-slate-500"
                                )}>
                                    <div className={cn(
                                        "w-2 h-2 rounded-full",
                                        isDaySelected(day.id) ? "bg-indigo-500" : "bg-slate-300"
                                    )} />
                                    {day.label}
                                </span>
                                {isDaySelected(day.id) && (
                                    <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                                )}
                            </div>
                            
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                <select 
                                    className={cn(
                                        "w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none appearance-none transition-all cursor-pointer",
                                        isDaySelected(day.id)
                                            ? "bg-white border-indigo-200 text-indigo-900 font-medium focus:ring-2 focus:ring-indigo-100"
                                            : "bg-slate-50 border-slate-200 text-slate-600 focus:bg-white focus:border-indigo-300"
                                    )}
                                    value={details[day.id] || ''}
                                    onChange={(e) => setDetails({ ...details, [day.id]: e.target.value ? Number(e.target.value) : '' })}
                                >
                                    <option value="">-- Kosong --</option>
                                    {ruteOptions.map(r => (
                                        <option key={r.id} value={r.id}>{r.nama_rute}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 italic">
                    * Hari yang dikosongkan tidak akan mengubah jadwal yang sudah ada.
                </div>
                <button 
                    type="submit"
                    disabled={loading || !namaGroup}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none active:scale-95"
                >
                    <Save className="h-5 w-5" />
                    {loading ? 'Menyimpan...' : (initialData ? 'Update Template' : 'Simpan Template')}
                </button>
                <button 
                    type="button"
                    onClick={onCancel}
                    className="w-full sm:w-auto px-6 py-3 text-slate-500 font-bold hover:text-slate-700 transition-colors"
                >
                    Batal
                </button>
            </div>
        </form>
    );
};

export default GroupRuteForm;
