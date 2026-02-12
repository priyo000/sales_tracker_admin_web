import React, { useState, useEffect, useMemo } from 'react';
import { Search, Grid as GridIcon, List, Info, Plus, Settings, Trash2, Edit, FileUp } from 'lucide-react';
import { KaryawanOption, RuteOption, JadwalRecurring, GroupRuteMingguan } from '../types';
import { useJadwalRecurring } from '../hooks/useJadwalRecurring';
import { useGroupRute } from '../hooks/useGroupRute';
import GroupRuteForm from './GroupRuteForm';
import ImportJadwalMasterModal from './ImportJadwalMasterModal';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { Modal } from '@/components/ui/Modal';

interface MasterScheduleProps {
    karyawanOptions: KaryawanOption[];
    ruteOptions: RuteOption[];
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

const WEEKS = [1, 2, 3, 4];

const MasterSchedule: React.FC<MasterScheduleProps> = ({ karyawanOptions, ruteOptions }) => {
    const { 
        loading: loadingPatterns, 
        fetchPatterns, 
        updatePatterns, 
        setGroup, 
        assignedGroups, 
        setAssignedGroups,
        importMasterJadwal
    } = useJadwalRecurring();
    const { groups, fetchGroups, createGroup, updateGroup, deleteGroup, loading: loadingGroups } = useGroupRute();
    
    const [localPatterns, setLocalPatterns] = useState<Partial<JadwalRecurring>[]>([]);
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupRuteMingguan | undefined>(undefined);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Initial load
    useEffect(() => {
        const load = async () => {
             const res = await fetchPatterns();
             if (res && res.patterns) setLocalPatterns(res.patterns);
        };
        load();
        fetchGroups();
    }, [fetchPatterns, fetchGroups]);

    // Construct grid from localPatterns and karyawanOptions
    const grid = useMemo(() => {
        const newGrid: Record<number, Record<number, Record<number, number | null>>> = {};
        
        // Initialize for all employees
        karyawanOptions.forEach(k => {
            newGrid[k.id] = {};
            WEEKS.forEach(w => {
                newGrid[k.id][w] = {};
                DAYS.forEach(d => {
                    newGrid[k.id][w][d.id] = null;
                });
            });
        });

        // Map existing patterns
        localPatterns.forEach(p => {
            if (p.id_karyawan && p.minggu_ke && p.hari && newGrid[p.id_karyawan] && newGrid[p.id_karyawan][p.minggu_ke]) {
                newGrid[p.id_karyawan][p.minggu_ke][p.hari] = p.id_rute ?? null;
            }
        });

        // Overlay Group Assignments (Lock & Override)
        assignedGroups.forEach(ag => {
            if (newGrid[ag.id_karyawan] && newGrid[ag.id_karyawan][ag.minggu_ke] && ag.group_rute) {
                ag.group_rute.details.forEach(d => {
                     if (newGrid[ag.id_karyawan][ag.minggu_ke][d.hari] !== undefined) {
                         newGrid[ag.id_karyawan][ag.minggu_ke][d.hari] = d.id_rute;
                     }
                });
            }
        });

        return newGrid;
    }, [localPatterns, karyawanOptions, assignedGroups]);

    const filteredKaryawan = useMemo(() => {
        return karyawanOptions.filter(k => 
            k.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
            k.kode_karyawan?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [karyawanOptions, searchTerm]);

    const saveChanges = async (karyawanId: number, currentPatterns: Partial<JadwalRecurring>[]) => {
        const rowPatterns = currentPatterns.filter(p => p.id_karyawan === karyawanId);
        
        // Prepare data for backend: We need all 4 weeks for this employee in the updatePatterns
        const flatPatterns: { minggu_ke: number, hari: number, id_rute: number | null }[] = [];
        WEEKS.forEach(w => {
            DAYS.forEach(d => {
                const found = rowPatterns.find(p => p.minggu_ke === w && p.hari === d.id);
                flatPatterns.push({
                    minggu_ke: w,
                    hari: d.id,
                    id_rute: found?.id_rute ?? null
                });
            });
        });

        const result = await updatePatterns({
            id_karyawan: karyawanId,
            patterns: flatPatterns
        });

        if (result.success) {
            toast.success('Jadwal tersimpan otomatis', { duration: 2000, position: 'bottom-right' });
        } else {
            toast.error(result.message || 'Gagal menyimpan otomatis');
        }
    };

    const handleCellChange = (karyawanId: number, week: number, day: number, routeId: string) => {
        const newPatterns = [...localPatterns];
        const existingIdx = newPatterns.findIndex(p => p.id_karyawan === karyawanId && p.minggu_ke === week && p.hari === day);
        
        if (existingIdx > -1) {
            if (routeId) {
                newPatterns[existingIdx] = { ...newPatterns[existingIdx], id_rute: Number(routeId) };
            } else {
                newPatterns.splice(existingIdx, 1);
            }
        } else if (routeId) {
            newPatterns.push({ id_karyawan: karyawanId, minggu_ke: week, hari: day, id_rute: Number(routeId) });
        }
        setLocalPatterns(newPatterns);
        saveChanges(karyawanId, newPatterns);
    };

    const handleApplyGroup = async (karyawanId: number, week: number, groupId: string) => {
        const idGroup = groupId ? Number(groupId) : null;
        
        // Optimistic Update
        const previousGroups = [...assignedGroups];
        
        if (idGroup) {
            const selectedGroup = groups.find(g => g.id === idGroup);
            if (selectedGroup) {
                // Remove existing assignment for this week if any
                const newAssignments = previousGroups.filter(ag => !(ag.id_karyawan === karyawanId && ag.minggu_ke === week));
                // Add new assignment
                newAssignments.push({
                    id: -(karyawanId * 100 + week), // Temporary deterministic ID
                    id_karyawan: karyawanId,
                    minggu_ke: week,
                    id_group_rute: idGroup,
                    group_rute: selectedGroup
                });
                setAssignedGroups(newAssignments);
            }
        } else {
            // Remove assignment
            const newAssignments = previousGroups.filter(ag => !(ag.id_karyawan === karyawanId && ag.minggu_ke === week));
            setAssignedGroups(newAssignments);
        }

        const res = await setGroup(karyawanId, week, idGroup);
        
        if (res.success) {
            toast.success(idGroup ? 'Template rute diterapkan' : 'Template dilepas', { position: 'bottom-center', duration: 2000 });
            // We do NOT refetch here to avoid table flicker. The optimistic state is sufficient.
        } else {
            // Revert on failure
            setAssignedGroups(previousGroups);
            toast.error(res.message || 'Gagal menerapkan template');
        }
    };


    const onCreateOrUpdateGroup = async (data: Partial<GroupRuteMingguan>) => {
        let res;
        if (editingGroup) {
            res = await updateGroup(editingGroup.id, data);
        } else {
            res = await createGroup(data);
        }

        if (res.success) {
            toast.success(editingGroup ? 'Template berhasil diperbarui' : 'Template berhasil dibuat');
            setShowGroupForm(false);
            setEditingGroup(undefined);
            fetchGroups();
        } else {
            toast.error(res.message || 'Gagal menyimpan template');
        }
    };

    const handleEditGroup = (group: GroupRuteMingguan) => {
        setEditingGroup(group);
        setShowGroupForm(true);
    };

    const handleDeleteGroup = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus template ini?')) return;
        
        const res = await deleteGroup(id);
        if (res.success) {
            toast.success('Template berhasil dihapus');
            fetchGroups();
        } else {
            toast.error(res.message || 'Gagal menghapus template');
        }
    };

    const openCreateForm = () => {
        setEditingGroup(undefined); 
        setShowGroupForm(true);
    };

    return (
        <div className="bg-slate-50 min-h-screen">
             {/* Header matching screenshot */}
             <div className="bg-white border-b px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-20">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 text-white p-2 rounded-full">
                        <GridIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-800">Kelola Kunjungan Mingguan</h2>
                    <button 
                        onClick={() => { setIsGroupModalOpen(true); setShowGroupForm(false); setEditingGroup(undefined); }}
                        className="ml-4 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        <List className="h-4 w-4" /> Lihat Daftar Rute Mingguan
                    </button>

                    <button 
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all active:scale-95"
                    >
                        <FileUp className="h-4 w-4" /> Import Master Excel
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Cari Pegawai..."
                            className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Tampilkan Pegawai Tidak Aktif</span>
                        <div className="w-10 h-5 bg-slate-200 rounded-full cursor-pointer p-1">
                            <div className="w-3 h-3 bg-white rounded-full shadow-sm"></div>
                        </div>
                    </div>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                        <Settings className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Tabs for Week Selection */}
            <div className="bg-white px-6 border-b flex items-end">
                <div className="px-6 py-4 flex items-center gap-2 text-slate-500 text-sm font-medium border-r pr-8">
                    <span>Kunjungan Mingguan</span>
                    <Info className="h-4 w-4" />
                </div>
                {WEEKS.map(w => (
                    <button
                        key={w}
                        onClick={() => setSelectedWeek(w)}
                        className={cn(
                            "px-8 py-4 text-sm font-bold transition-all border-b-2",
                            selectedWeek === w 
                                ? "border-indigo-600 text-indigo-600 bg-indigo-50/10" 
                                : "border-transparent text-slate-400 hover:text-slate-600"
                        )}
                    >
                        Minggu {w}
                    </button>
                ))}
            </div>

            <div className="p-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-[13px]">
                            <thead className="bg-slate-50/80 text-slate-600 border-b">
                                <tr>
                                    <th className="px-4 py-3 font-semibold sticky left-0 z-10 bg-slate-50">Pegawai</th>
                                    <th className="px-4 py-3 font-semibold min-w-[180px]">Rute Mingguan</th>
                                    {DAYS.map(d => (
                                        <th key={d.id} className="px-4 py-3 font-semibold min-w-[160px] text-center">{d.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {loadingPatterns ? (
                                    <tr>
                                        <td colSpan={10} className="py-20 text-center text-slate-400">Memuat data...</td>
                                    </tr>
                                ) : filteredKaryawan.map(k => (
                                    <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-4 py-4 sticky left-0 z-10 bg-white group shadow-[1px_0_0_0_#f1f5f9]">
                                            <div className="flex items-center gap-3">
                                                {/* <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <MapPin className="h-5 w-5" />
                                                </div> */}
                                                <div>
                                                    <div className="font-bold text-slate-800 uppercase leading-none mb-1">{k.nama_lengkap}</div>
                                                    <div className="text-[11px] text-slate-400 font-medium">{k.kode_karyawan || k.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                                onChange={(e) => handleApplyGroup(k.id, selectedWeek, e.target.value)}
                                                value={assignedGroups.find(ag => ag.id_karyawan === k.id && ag.minggu_ke === selectedWeek)?.id_group_rute || ""}
                                            >
                                                <option value="">Manual (Custom)</option>
                                                {groups.map(g => (
                                                    <option key={g.id} value={g.id}>{g.nama_group}</option>
                                                ))}
                                            </select>
                                        </td>
                                        {DAYS.map(d => {
                                            const isLocked = !!assignedGroups.find(ag => ag.id_karyawan === k.id && ag.minggu_ke === selectedWeek);
                                            const routeId = grid[k.id]?.[selectedWeek]?.[d.id];
                                            return (
                                                <td key={d.id} className="px-2 py-4">
                                                    {isLocked ? (
                                                        <div className="w-full bg-slate-100 text-slate-500 text-xs py-1.5 px-2 rounded border border-slate-200 text-center font-medium truncate">
                                                            {ruteOptions.find(r => r.id === routeId)?.nama_rute || '-'}
                                                        </div>
                                                    ) : (
                                                        <select 
                                                            className={cn(
                                                                "w-full rounded-md border text-center transition-all outline-none py-1.5",
                                                                routeId
                                                                    ? "bg-indigo-50 border-indigo-200 text-indigo-900 font-medium"
                                                                    : "bg-white border-slate-200 text-slate-400"
                                                            )}
                                                            value={routeId || ''}
                                                            onChange={(e) => handleCellChange(k.id, selectedWeek, d.id, e.target.value)}
                                                        >
                                                            <option value="">-</option>
                                                            {ruteOptions.map(r => (
                                                                <option key={r.id} value={r.id}>{r.nama_rute}</option>
                                                            ))}
                                                        </select>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modal for Group/Template Management */}
            <Modal
                isOpen={isGroupModalOpen}
                onClose={() => setIsGroupModalOpen(false)}
                title={showGroupForm ? "Buat Template Rute Baru" : "Daftar Template Rute Mingguan"}
                size="4xl"
            >
                {showGroupForm ? (
                    <GroupRuteForm 
                        ruteOptions={ruteOptions} 
                        onSave={onCreateOrUpdateGroup} 
                        loading={loadingGroups} 
                        initialData={editingGroup}
                        onCancel={() => setShowGroupForm(false)}
                    />
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-500">Daftar paket rute Senin-Minggu yang tersedia.</p>
                            <button 
                                onClick={openCreateForm}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-indigo-100"
                            >
                                <Plus className="h-4 w-4" /> Buat Template Baru
                            </button>
                        </div>

                        {groups.length === 0 ? (
                            <div className="py-12 text-center border-2 border-dashed rounded-xl">
                                <List className="mx-auto h-12 w-12 text-slate-200" />
                                <p className="mt-2 text-slate-400">Belum ada template. Buat satu untuk mempercepat pengisian jadwal!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {groups.map((g, idx) => (
                                    <div key={g.id} className="bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition-shadow flex items-center justify-between group">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-indigo-100 text-indigo-600 h-12 w-12 rounded-lg flex items-center justify-center font-bold text-lg">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-800">{g.nama_group}</h3>
                                                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                                                    <List className="h-4 w-4" />
                                                    {g.details.length} Hari Terjadwal
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            <button 
                                                onClick={() => handleEditGroup(g)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm"
                                            >
                                                <Edit className="h-4 w-4" />
                                                Edit Rute
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteGroup(g.id)}
                                                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-red-600 font-medium rounded-lg hover:bg-red-50 hover:border-red-200 transition-colors shadow-sm"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Import Modal */}
            <ImportJadwalMasterModal 
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onImport={importMasterJadwal}
            />
        </div>
    );
};

export default MasterSchedule;
