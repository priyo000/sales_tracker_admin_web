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
    error,
    fetchPesanans,
    updateStatus,
    updatePesanan,
    pagination,
  } = usePesanan();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

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
        page: pagination.currentPage,
        per_page: perPage,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [
    searchTerm,
    statusFilter,
    startDate,
    endDate,
    pagination.currentPage,
    perPage,
    fetchPesanans,
  ]);

  const handlePageChange = (page: number) => {
    fetchPesanans({
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      start_date: startDate,
      end_date: endDate,
      page,
      per_page: perPage,
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    fetchPesanans({
      search: searchTerm,
      status: statusFilter === "all" ? undefined : statusFilter,
      start_date: startDate,
      end_date: endDate,
      page: 1,
      per_page: newPerPage,
    });
  };

  const selectedOrder = useMemo(
    () => pesanans.find((p) => p.id === selectedOrderId),
    [pesanans, selectedOrderId],
  );

  const handleExport = async (statuses: string[]) => {
    setIsExporting(true);
    try {
      const response = await api.get("/pesanan/export", {
        params: {
          start_date: startDate || undefined,
          end_date: endDate || undefined,
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
        onSearchChange={setSearchTerm}
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
                  handlePageChange(1);
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
                  handlePageChange(1);
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
                  handlePageChange(1);
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
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          title={`Detail Pesanan: ${selectedOrder.no_pesanan}`}
          size="5xl"
        >
          <OrderDetail
            pesanan={selectedOrder}
            onStatusChange={handleStatusChange}
            onUpdatePesanan={updatePesanan}
            onClose={() => setSelectedOrderId(null)}
          />
        </Modal>
      )}
    </div>
  );
};

export default PesananPage;
