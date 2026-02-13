import { useState, useEffect, useMemo } from 'react';
import { useMonitoring } from '../features/monitoring/hooks/useMonitoring';
import { EmployeeCard } from '../features/monitoring/components/EmployeeCard';
import { CustomerVisitCard } from '../features/monitoring/components/CustomerVisitCard';
import { KunjunganMap } from '../features/monitoring/components/KunjunganMap';
import { Calendar as CalendarIcon, Loader2, MapPin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisitPoint } from '../features/monitoring/types';

const KunjunganPage = () => {
    // Current Date
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
    const [selectedCustomerPoint, setSelectedCustomerPoint] = useState<VisitPoint | null>(null);
    const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

    const { 
        loading, 
        detailsLoading,
        recapData,
        allPoints, // Get all points
        fetchDailyRecap,
        fetchAllPoints
    } = useMonitoring();

    // Fetch Data on Date Change
    useEffect(() => {
        fetchDailyRecap(selectedDate);
        fetchAllPoints(selectedDate);
    }, [selectedDate, fetchDailyRecap, fetchAllPoints]);

    // Derive selected employee points and sort them
    const selectedEmployeePoints = useMemo(() => {
        if (!selectedEmployeeId) return [];
        
        const points = allPoints.filter(p => p.employee?.id === selectedEmployeeId);
        
        // Sorting: Visited first (by check-in time ASC), then Unvisited
        return points.sort((a, b) => {
            const isVisitedA = a.status === 'visited' || a.status === 'unplanned'; // Unplanned is also visited usually
            const isVisitedB = b.status === 'visited' || b.status === 'unplanned';

            if (isVisitedA && !isVisitedB) return -1;
            if (!isVisitedA && isVisitedB) return 1;
            
            if (isVisitedA && isVisitedB) {
                const timeA = a.visit?.waktu_check_in ? new Date(a.visit.waktu_check_in).getTime() : 0;
                const timeB = b.visit?.waktu_check_in ? new Date(b.visit.waktu_check_in).getTime() : 0;
                return timeA - timeB;
            }
            
            return 0; // Keep original order for unvisited
        });
    }, [allPoints, selectedEmployeeId]);

    // Determine points to focus on map
    const mapFocusPoints = useMemo(() => {
        if (selectedCustomerPoint) return [selectedCustomerPoint];
        if (selectedEmployeeId) return selectedEmployeePoints;
        return []; // If empty, map fits all points
    }, [selectedCustomerPoint, selectedEmployeeId, selectedEmployeePoints]);

    // Handle Date Change
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        setSelectedDate(newDate);
        setSelectedEmployeeId(null);
        setSelectedCustomerPoint(null);
        setIsRightSidebarOpen(false);
    };

    // Handle Employee Click
    const handleEmployeeClick = (id: number) => {
        if (selectedEmployeeId === id) {
            // Toggle sidebar if same
             setIsRightSidebarOpen(!isRightSidebarOpen);
        } else {
            setSelectedEmployeeId(id);
            setSelectedCustomerPoint(null);
            setIsRightSidebarOpen(true);
        }
    };
    
    // Handle Customer Click
    const handleCustomerClick = (point: VisitPoint) => {
        setSelectedCustomerPoint(point);
    }

    // Derived State: Selected Employee Color
    const selectedEmployeeColor = useMemo(() => {
        return recapData.find(e => e.karyawan.id === selectedEmployeeId)?.color || '#3B82F6';
    }, [recapData, selectedEmployeeId]);

    return (
        <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden flex flex-col bg-gray-50">
            {/* Top Bar (Date Filter) */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-200 flex items-center gap-3">
                <CalendarIcon className="h-4 w-4 text-gray-500" />
                <input 
                    type="date" 
                    value={selectedDate}
                    onChange={handleDateChange}
                    className="bg-transparent border-none p-0 text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer"
                />
            </div>

            {/* Main Content Area (Map) */}
            <div className="flex-1 relative z-0">
                {allPoints.length > 0 ? (
                    <KunjunganMap 
                        points={allPoints} 
                        focusPoints={mapFocusPoints}
                        selectedEmployeeColor={selectedEmployeeColor} 
                    />
                ) : (
                    // Empty State or Placeholder Map
                    <div className="h-full w-full bg-slate-100 flex items-center justify-center text-gray-400">
                        <div className="text-center">
                            <MapPin className="h-16 w-16 mx-auto mb-2 opacity-20" />
                            <p>Data kunjungan belum tersedia.</p>
                        </div>
                    </div>
                )}
                
                {detailsLoading && (
                    <div className="absolute inset-0 bg-white/50 z-40 flex items-center justify-center backdrop-blur-sm">
                        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                    </div>
                )}
            </div>

            {/* Left Sidebar (Employee List) */}
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-white shadow-xl z-20 flex flex-col border-r border-gray-200 transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-100 bg-white z-10">
                    <h2 className="text-lg font-bold text-gray-800">Monitoring Sales</h2>
                    <p className="text-xs text-gray-500">Pilih sales untuk detail rute</p>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
                    {loading ? (
                       <div className="flex justify-center py-10">
                           <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                       </div>
                    ) : recapData.length === 0 ? (
                        <div className="text-center py-10 text-gray-500 text-sm">
                            Tidak ada data karyawan aktif.
                        </div>
                    ) : (
                        recapData.map((emp) => (
                            <EmployeeCard
                                key={emp.karyawan.id}
                                data={emp}
                                isSelected={selectedEmployeeId === emp.karyawan.id}
                                onClick={() => handleEmployeeClick(emp.karyawan.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right Sidebar (Customer Details) */}
            <div className={cn(
                "absolute top-0 right-0 bottom-0 w-96 bg-white shadow-2xl z-20 flex flex-col border-l border-gray-200 transform transition-transform duration-300 ease-in-out",
                isRightSidebarOpen ? "translate-x-0" : "translate-x-full"
            )}>
                {selectedEmployeeId && (
                    <>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="font-bold text-gray-900">
                                    Detail Kunjungan
                                </h3>
                                <p className="text-xs text-gray-500">
                                    {recapData.find(e => e.karyawan.id === selectedEmployeeId)?.karyawan.nama_lengkap}
                                </p>
                            </div>
                            <button onClick={() => setIsRightSidebarOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X className="h-4 w-4 text-gray-500" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/30">
                            {detailsLoading ? (
                                <div className="space-y-4">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                                    ))}
                                </div>
                            ) : selectedEmployeePoints.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    Belum ada rute atau kunjungan hari ini.
                                </div>
                            ) : (
                                selectedEmployeePoints.map((point) => (
                                    <CustomerVisitCard 
                                        key={point.pelanggan.id} 
                                        point={point}
                                        onClick={() => handleCustomerClick(point)}
                                    />
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default KunjunganPage;
