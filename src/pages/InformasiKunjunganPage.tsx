import React, { useEffect, useState, useMemo } from "react";
import { FileText } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";

import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";

import { useInformasiKunjungan } from "../features/monitoring/hooks/useInformasiKunjungan";
import InformasiKunjunganTable from "../features/monitoring/components/InformasiKunjunganTable";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KalenderKerjaTab } from "../features/monitoring/components/KalenderKerjaTab";
import { ExportReportModal } from "../features/monitoring/components/ExportReportModal";
import { FileDown } from "lucide-react";

const InformasiKunjunganPage: React.FC = () => {
  const { data, loading, pagination, fetchData } = useInformasiKunjungan();
  const [activeTab, setActiveTab] = useState("rekap");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const startDate = useMemo(
    () => (dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : ""),
    [dateRange]
  );

  const endDate = useMemo(
    () => (dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : ""),
    [dateRange]
  );

  useEffect(() => {
    fetchData({
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      page,
      per_page: perPage,
    });
  }, [startDate, endDate, page, perPage, fetchData]);

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
              Data rekap kunjungan & Pengaturan Tanggal Kerja
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mb-6">
          <TabsTrigger value="rekap">Rekap Kunjungan</TabsTrigger>
          <TabsTrigger value="kalender">Kalender Kerja</TabsTrigger>
        </TabsList>

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

        {/* Tab Kalender Kerja - Keep Alive Pattern */}
        <div className={activeTab === "kalender" ? "block" : "hidden"}>
          <KalenderKerjaTab />
        </div>
      </Tabs>

      <ExportReportModal 
        isOpen={isExportModalOpen} 
        onClose={() => setIsExportModalOpen(false)} 
      />
    </div>
  );
};

export default InformasiKunjunganPage;
