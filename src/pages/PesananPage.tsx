import React, { useEffect, useState, useMemo } from "react";
import {
  ShoppingCart,
  Download,
  SlidersHorizontal,
} from "lucide-react";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { usePesanan } from "../features/pesanan/hooks/usePesanan";
import OrderTable from "../features/pesanan/components/OrderTable";
import OrderDetail from "../features/pesanan/components/OrderDetail";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Modal } from "../components/ui/Modal";
import api from "@/services/api";
import toast from "react-hot-toast";
import { ExportOrderModal } from "../features/pesanan/components/ExportOrderModal";

const PesananPage: React.FC = () => {
  const {
    pesanans,
    loading,
    detailLoading,
    error,
    fetchPesanans,
    getPesananDetail,
    updateStatus,
    updatePesanan,
    pagination,
  } = usePesanan();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState<import("../features/pesanan/types").Pesanan | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });
  const [page, setPage] = useState(1);

  const startDate = useMemo(() => 
    dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : "", 
    [dateRange?.from]
  );
  
  const endDate = useMemo(() => 
    dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : "", 
    [dateRange?.to]
  );
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPesanans({
        search: searchTerm,
        status: statusFilter === "all" ? undefined : statusFilter,
        start_date: startDate,
        end_date: endDate,
        page: page,
        per_page: perPage,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    page,
    perPage,
    fetchPesanans,
  ]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  useEffect(() => {
    if (selectedOrderId === null) {
      setSelectedOrderDetail(null);
      return;
    }
    getPesananDetail(selectedOrderId).then((res) => {
      if (res.success && res.data) setSelectedOrderDetail(res.data);
    });
  }, [selectedOrderId, getPesananDetail]);

  const handleExport = async (statuses: string[], dateRange: {startDate: string, endDate: string}) => {
    setIsExporting(true);
    try {
      const response = await api.get("/pesanan/export", {
        params: {
          start_date: dateRange.startDate || undefined,
          end_date: dateRange.endDate || undefined,
          status: statuses.length > 0 ? statuses.join(",") : undefined,
        },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Pesanan_${new Date().toISOString().split("T")[0]}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Laporan berhasil diunduh");
      setIsExportModalOpen(false);
    } catch {
      toast.error("Gagal mengeksport data pesanan.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    await updateStatus(id, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Daftar Pesanan
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor semua transaksi pesanan dari sales.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <OrderTable
        data={pesanans}
        loading={loading}
        onViewDetail={(id) => setSelectedOrderId(id)}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[180px]">
              <Select
                value={statusFilter}
                onValueChange={(val: string) => {
                  setStatusFilter(val);
                  setPage(1);
                }}
              >
                <SelectTrigger
                  className="w-full bg-background shadow-sm h-9"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="proses">Proses</SelectItem>
                  <SelectItem value="dikirim">Dikirim</SelectItem>
                  <SelectItem value="sukses">Sukses</SelectItem>
                  <SelectItem value="batal">Batal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5 min-w-[260px]">
              <DatePickerWithRange
                date={dateRange}
                onChange={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
              />
            </div>

            {(searchTerm || statusFilter !== "all" || startDate || endDate) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive h-9 px-3 hover:bg-destructive/10 text-xs font-medium"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setDateRange(undefined);
                  setPage(1);
                }}
              >
                Reset Filter
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                disabled={isExporting}
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm h-9"
              >
                <Download className="h-4 w-4" />{" "}
                Export Excel
              </Button>
            </div>
          </div>
        }
      />

      {/* Export Modal */}
      <ExportOrderModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        isLoading={isExporting}
        onExport={handleExport}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
        title={selectedOrderDetail ? `Detail Pesanan: ${selectedOrderDetail.no_pesanan}` : "Memuat Detail..."}
        size="5xl"
      >
        {detailLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
        {!detailLoading && selectedOrderDetail && (
          <OrderDetail
            pesanan={selectedOrderDetail}
            onStatusChange={async (id, status) => {
              await handleStatusChange(id, status);
              const res = await getPesananDetail(id);
              if (res.success && res.data) setSelectedOrderDetail(res.data);
            }}
            onUpdatePesanan={async (id, data) => {
              const res = await updatePesanan(id, data);
              if (res.success) {
                const detail = await getPesananDetail(id);
                if (detail.success && detail.data) setSelectedOrderDetail(detail.data);
              }
              return res;
            }}
            onClose={() => setSelectedOrderId(null)}
          />
        )}
      </Modal>
    </div>
  );
};

export default PesananPage;
