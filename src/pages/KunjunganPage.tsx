import { useState, useEffect, useMemo } from "react";
import { useMonitoring } from "../features/monitoring/hooks/useMonitoring";
import { EmployeeCard } from "../features/monitoring/components/EmployeeCard";
import { CustomerVisitCard } from "../features/monitoring/components/CustomerVisitCard";
import { KunjunganMap } from "../features/monitoring/components/KunjunganMap";
import { Calendar as CalendarIcon, Loader2, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { VisitPoint } from "../features/monitoring/types";
import { DatePicker } from "@/components/ui/date-picker";
import { parse, format } from "date-fns";

const KunjunganPage = () => {
  // Current Date
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null,
  );
  const [selectedCustomerPoint, setSelectedCustomerPoint] =
    useState<VisitPoint | null>(null);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(false);

  const {
    loading,
    detailsLoading,
    recapData,
    allPoints, // Get all points
    fetchDailyRecap,
    fetchAllPoints,
  } = useMonitoring();

  // Fetch Data on Date Change
  useEffect(() => {
    fetchDailyRecap(selectedDate);
    fetchAllPoints(selectedDate);
  }, [selectedDate, fetchDailyRecap, fetchAllPoints]);

  // Derive selected employee points and sort them
  const selectedEmployeePoints = useMemo(() => {
    if (!selectedEmployeeId) return [];

    const points = allPoints.filter(
      (p) => p.employee?.id === selectedEmployeeId,
    );

    // Sorting: Visited first (by check-in time ASC), then Unvisited
    return points.sort((a, b) => {
      const isVisitedA = a.status === "visited" || a.status === "unplanned"; // Unplanned is also visited usually
      const isVisitedB = b.status === "visited" || b.status === "unplanned";

      if (isVisitedA && !isVisitedB) return -1;
      if (!isVisitedA && isVisitedB) return 1;

      if (isVisitedA && isVisitedB) {
        const timeA = a.visit?.waktu_check_in
          ? new Date(a.visit.waktu_check_in).getTime()
          : 0;
        const timeB = b.visit?.waktu_check_in
          ? new Date(b.visit.waktu_check_in).getTime()
          : 0;
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
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDateStr = format(date, "yyyy-MM-dd");
      setSelectedDate(newDateStr);
      setSelectedEmployeeId(null);
      setSelectedCustomerPoint(null);
      setIsRightSidebarOpen(false);
    }
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

  // Handle Customer Click (from List or Map)
  const handleCustomerClick = (point: VisitPoint) => {
    // If clicking from map, we need to ensure the right employee is selected and sidebar is open
    if (point.employee && selectedEmployeeId !== point.employee.id) {
      setSelectedEmployeeId(point.employee.id);
    }

    setSelectedCustomerPoint(point);
    setIsRightSidebarOpen(true);

    // Scroll the element into view if it exists in the list
    setTimeout(() => {
      const element = document.getElementById(
        `visit-card-${point.pelanggan.id}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        // Optional: add a temporary highlight class
        element.classList.add("ring-2", "ring-indigo-500");
        setTimeout(
          () => element.classList.remove("ring-2", "ring-indigo-500"),
          2000,
        );
      }
    }, 300);
  };

  // Derived State: Selected Employee Color
  const selectedEmployeeColor = useMemo(() => {
    return (
      recapData.find((e) => e.karyawan.id === selectedEmployeeId)?.color ||
      "#3B82F6"
    );
  }, [recapData, selectedEmployeeId]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full bg-background overflow-hidden relative">
      <div className="flex-1 relative overflow-hidden flex flex-row">
        {/* Left Sidebar (Employee List) */}
        <div className="w-80 bg-card border-r border-border flex flex-col overflow-hidden relative z-20 shadow-xl">
          {/* Compact Sidebar Header */}
          <div className="p-4 border-b bg-card shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-1.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/20 shrink-0">
                <MapPin className="h-4 w-4" />
              </div>
              <h1 className="text-base font-bold tracking-tight text-foreground leading-none">
                Monitoring
              </h1>
            </div>
            <p className="text-[10px] text-muted-foreground font-medium ml-10">
              Real-time Sales Tracking
            </p>
          </div>

          <div className="px-5 py-3 border-b bg-muted/10 shrink-0">
            <h2 className="text-[10px] font-bold text-foreground/50 uppercase tracking-widest">
              Daftar Sales
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide bg-muted/5">
            {loading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            ) : recapData.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">
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

        {/* Main Content Area (Map) */}
        <div className="flex-1 relative z-0">
          {/* Premium Floating Date Picker */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-card/85 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.15)] hover:bg-card hover:scale-105 transition-all group cursor-pointer ring-1 ring-black/5">
            <div className="bg-primary/10 p-1.5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <CalendarIcon className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-muted-foreground/60 leading-none mb-0.5 tracking-tighter">
                Periode Monitoring
              </span>
              <DatePicker
                date={parse(selectedDate, "yyyy-MM-dd", new Date())}
                onChange={handleDateSelect}
                className="bg-transparent border-none p-0 text-xs font-black text-foreground focus-visible:ring-0 cursor-pointer w-auto shadow-none h-auto min-h-0 hover:bg-transparent"
              />
            </div>
          </div>

          {allPoints.length > 0 ? (
            <KunjunganMap
              points={allPoints}
              focusPoints={mapFocusPoints}
              selectedEmployeeColor={selectedEmployeeColor}
              onMarkerClick={handleCustomerClick}
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
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          )}
        </div>

        {/* Right Sidebar (Customer Details) */}
        <div
          className={cn(
            "absolute top-0 right-0 bottom-0 w-80 bg-card shadow-2xl z-30 flex flex-col border-l border-border transform transition-transform duration-300 ease-in-out",
            isRightSidebarOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {selectedEmployeeId && (
            <>
              <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                <div>
                  <h3 className="font-bold text-foreground">
                    Detail Kunjungan
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {
                      recapData.find(
                        (e) => e.karyawan.id === selectedEmployeeId,
                      )?.karyawan.nama_lengkap
                    }
                  </p>
                </div>
                <button
                  onClick={() => setIsRightSidebarOpen(false)}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-muted/10">
                {detailsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="h-24 bg-muted/20 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : selectedEmployeePoints.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground text-sm">
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
    </div>
  );
};

export default KunjunganPage;
