import React, { useEffect, useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";
import { cn } from "@/lib/utils";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";

import { useInformasiKunjungan } from "../features/monitoring/hooks/useInformasiKunjungan";
import { useProspectTracking } from "../features/monitoring/hooks/useProspectTracking";
import InformasiKunjunganTable from "../features/monitoring/components/InformasiKunjunganTable";
import ProspectTrackingTable from "../features/monitoring/components/ProspectTrackingTable";

import { KalenderKerjaTab } from "../features/monitoring/components/KalenderKerjaTab";
import { ExportReportModal } from "../features/monitoring/components/ExportReportModal";
import { FileDown } from "lucide-react";

const InformasiKunjunganPage: React.FC = () => {
  const { data, loading, pagination, fetchData } = useInformasiKunjungan();
  const { 
    data: prospectData, 
    loading: prospectLoading, 
    pagination: prospectPagination, 
    fetchProspects,
    details: prospectDetails,
    loadingDetails: loadingProspectDetails,
    fetchProspectDetails
  } = useProspectTracking();

  const [activeTab, setActiveTab] = useState("rekap");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const [prospectDateRange, setProspectDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [prospectPage, setProspectPage] = useState(1);
  const [prospectPerPage, setProspectPerPage] = useState(20);

  const [prospectSearch, setProspectSearch] = useState("");
  const [debouncedProspectSearch, setDebouncedProspectSearch] = useState("");

  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedProspectSearch(prospectSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [prospectSearch]);

  const startDate = useMemo(
    () => (dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : ""),
    [dateRange]
  );

  const endDate = useMemo(
    () => (dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : ""),
    [dateRange]
  );

  // Prospect dates
  const prospectStartDate = useMemo(
    () => (prospectDateRange?.from ? formatFile(prospectDateRange.from, "yyyy-MM-dd") : ""),
    [prospectDateRange]
  );
  const prospectEndDate = useMemo(
    () => (prospectDateRange?.to ? formatFile(prospectDateRange.to, "yyyy-MM-dd") : ""),
    [prospectDateRange]
  );

  useEffect(() => {
    if (activeTab === "rekap") {
      fetchData({
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        page,
        per_page: perPage,
      });
    }
  }, [startDate, endDate, page, perPage, fetchData, activeTab]);

  useEffect(() => {
    if (activeTab === "prospect") {
      fetchProspects({
        start_date: prospectStartDate || undefined,
        end_date: prospectEndDate || undefined,
        page: prospectPage,
        per_page: prospectPerPage,
        search: debouncedProspectSearch || undefined,
      });
    }
  }, [prospectStartDate, prospectEndDate, prospectPage, prospectPerPage, debouncedProspectSearch, fetchProspects, activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Informasi Kunjungan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Data rekap kunjungan, pencarian pelanggan baru & Pengaturan Tanggal Kerja
            </p>
          </div>
        </div>
      </div>

      {/* Tabs - Match with JadwalPage style */}
      <div className="flex p-1 bg-muted/50 rounded-xl w-fit border border-border/50 mb-6 overflow-x-auto max-w-full">
        <button
          onClick={() => setActiveTab("rekap")}
          className={cn(
            "px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg whitespace-nowrap",
            activeTab === "rekap"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Rekap Kunjungan
        </button>
        <button
          onClick={() => setActiveTab("prospect")}
          className={cn(
            "px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg whitespace-nowrap",
            activeTab === "prospect"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Prospect Sales
        </button>
        <button
          onClick={() => setActiveTab("kalender")}
          className={cn(
            "px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg whitespace-nowrap",
            activeTab === "kalender"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          Kalender Kerja
        </button>
      </div>

      <div className="w-full">
        {/* Tab Rekap Kunjungan */}
        <div className={activeTab === "rekap" ? "block animate-in fade-in slide-in-from-bottom-2 duration-500" : "hidden"}>
          <InformasiKunjunganTable
            data={data}
            loading={loading}
            page={page}
            perPage={perPage}
            pagination={pagination}
            onPageChange={setPage}
            onPerPageChange={(newPerPage) => {
              setPerPage(newPerPage);
              setPage(1);
            }}
            toolbar={
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 min-w-[260px]">
                  <DatePickerWithRange
                    date={dateRange}
                    onChange={(range) => {
                      setDateRange(range);
                      setPage(1);
                    }}
                  />
                </div>

                {(startDate || endDate) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-9 px-3 hover:bg-destructive/10 text-xs font-medium"
                    onClick={() => {
                      setDateRange(undefined);
                      setPage(1);
                    }}
                  >
                    Reset Filter
                  </Button>
                )}

                <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5 hover:text-primary transition-all shadow-sm"
                  onClick={() => setIsExportModalOpen(true)}
                >
                  <FileDown className="h-4 w-4" />
                  Export Laporan
                </Button>
              </div>
            }
          />
        </div>

        {/* Tab Prospect Sales - Keep Alive */}
        <div className={activeTab === "prospect" ? "block animate-in fade-in slide-in-from-bottom-2 duration-500" : "hidden"}>
          <ProspectTrackingTable
            data={prospectData}
            loading={prospectLoading}
            page={prospectPage}
            perPage={prospectPerPage}
            pagination={prospectPagination}
            onPageChange={setProspectPage}
            onPerPageChange={(newPerPage) => {
              setProspectPerPage(newPerPage);
              setPage(1);
            }}
            details={prospectDetails}
            loadingDetails={loadingProspectDetails}
            onViewDetails={fetchProspectDetails}
            onSearchChange={setProspectSearch}
            searchPlaceholder="Cari Nama Sales..."
            toolbar={
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 min-w-[260px]">
                  <DatePickerWithRange
                    date={prospectDateRange}
                    onChange={(range) => {
                      setProspectDateRange(range);
                      setProspectPage(1);
                    }}
                  />
                </div>

                {(prospectStartDate || prospectEndDate || prospectSearch) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive h-9 px-3 hover:bg-destructive/10 text-xs font-medium"
                    onClick={() => {
                      setProspectDateRange(undefined);
                      setProspectSearch("");
                      setProspectPage(1);
                    }}
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            }
          />
        </div>

        {/* Tab Kalender Kerja - Keep Alive Pattern */}
        <div className={activeTab === "kalender" ? "block" : "hidden"}>
          <KalenderKerjaTab />
        </div>
      </div>

      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </div>
  );
};

export default InformasiKunjunganPage;
