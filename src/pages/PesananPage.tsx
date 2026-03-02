import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { usePesanan } from "../features/pesanan/hooks/usePesanan";
import OrderTable from "../features/pesanan/components/OrderTable";
import OrderDetail from "../features/pesanan/components/OrderDetail";
import { Modal } from "../components/ui/Modal";
import { Pesanan, UpdatePesananData } from "../features/pesanan/types";
import { FileDown, Calendar, Filter } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useDivisi } from "../features/divisi/hooks/useDivisi";

const PesananPage: React.FC = () => {
  const {
    pesanans,
    loading,
    error,
    fetchPesanans,
    getPesananDetail,
    updateStatus,
    updatePesanan,
    exportPesanan,
  } = usePesanan();

  const { user } = useAuth();
  const { divisis, fetchDivisis } = useDivisi();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [idDivisi, setIdDivisi] = useState("");
  const [selectedPesanan, setSelectedPesanan] = useState<Pesanan | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const isHighLevelAdmin =
    user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  useEffect(() => {
    if (isHighLevelAdmin) {
      fetchDivisis();
    }
  }, [isHighLevelAdmin, fetchDivisis]);

  // Initial Fetch & Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPesanans({
        search,
        status: statusFilter,
        start_date: startDate,
        end_date: endDate,
        id_divisi: idDivisi || undefined,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, startDate, endDate, idDivisi, fetchPesanans]);

  const handleViewDetail = async (id: number) => {
    const result = await getPesananDetail(id);
    if (result.success && result.data) {
      setSelectedPesanan(result.data);
      setIsDetailOpen(true);
    } else {
      toast.error(result.message || "Gagal memuat detail pesanan");
    }
  };

  const handleUpdatePesanan = async (id: number, data: UpdatePesananData) => {
    const result = await updatePesanan(id, data);
    if (result.success) {
      toast.success("Pesanan berhasil diperbarui");
      if (selectedPesanan && selectedPesanan.id === id) {
        // Fetch fresh detail to show updated items
        const fresh = await getPesananDetail(id);
        if (fresh.success) setSelectedPesanan(fresh.data || null);
      }
    } else {
      toast.error(result.message || "Gagal memperbarui pesanan");
    }
    return result;
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const result = await updateStatus(id, newStatus);
    if (result.success) {
      toast.success("Status pesanan berhasil diperbarui");
      if (selectedPesanan && selectedPesanan.id === id) {
        setSelectedPesanan({ ...selectedPesanan, status: newStatus });
      }
    } else {
      toast.error(result.message || "Gagal mengubah status");
    }
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedPesanan(null);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportPesanan({
        start_date: startDate,
        end_date: endDate,
        status: statusFilter || undefined,
        id_divisi: idDivisi || undefined,
      });
      toast.success("Laporan berhasil diunduh");
    } catch {
      toast.error("Gagal mengeksport laporan");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Pesanan</h1>
        <div className="flex space-x-2 overflow-x-auto pb-2 sm:pb-0">
          {["", "PENDING", "PROSES", "DIKIRIM", "SUKSES", "BATAL"].map((s) => (
            <button
              key={s || "ALL"}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium uppercase transition-colors border whitespace-nowrap",
                statusFilter === s
                  ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {s || "Semua"}
            </button>
          ))}
        </div>
      </div>

      {/* Helper Text */}
      <p className="text-sm text-gray-500">
        Pantau dan kelola pesanan masuk dari sales lapangan secara real-time.
      </p>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[240px]">
            <label className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-1.5">
              <Search className="w-3 h-3 mr-1" /> Cari Pesanan
            </label>
            <div className="relative">
              <input
                type="text"
                className="block w-full rounded-lg border-gray-300 bg-gray-50/50 py-2.5 pl-3 pr-10 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                placeholder="Cari No Pesanan / Toko..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="w-full sm:w-auto">
            <label className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-1.5">
              <Calendar className="w-3 h-3 mr-1" /> Mulai
            </label>
            <input
              type="date"
              className="block w-full rounded-lg border-gray-300 bg-gray-50/50 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="w-full sm:w-auto">
            <label className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-1.5">
              <Calendar className="w-3 h-3 mr-1" /> Selesai
            </label>
            <input
              type="date"
              className="block w-full rounded-lg border-gray-300 bg-gray-50/50 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {isHighLevelAdmin && (
            <div className="w-full sm:w-48">
              <label className="flex items-center text-xs font-semibold text-gray-500 uppercase mb-1.5">
                <Filter className="w-3 h-3 mr-1" /> Divisi
              </label>
              <select
                className="block w-full rounded-lg border-gray-300 bg-gray-50/50 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={idDivisi}
                onChange={(e) => setIdDivisi(e.target.value)}
              >
                <option value="">Semua Divisi</option>
                {divisis.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nama_divisi}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="w-full sm:w-auto">
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <FileDown className="w-4 h-4 mr-2" />
              {isExporting ? "Mengekspor..." : "Export Excel"}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Table */}
      <OrderTable
        data={pesanans}
        loading={loading}
        onViewDetail={handleViewDetail}
      />

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailOpen && !!selectedPesanan}
        onClose={handleCloseDetail}
        title={`Detail Pesanan: ${selectedPesanan?.no_pesanan || ""}`}
        size="4xl"
      >
        {selectedPesanan && (
          <OrderDetail
            pesanan={selectedPesanan}
            onStatusChange={handleStatusChange}
            onUpdatePesanan={handleUpdatePesanan}
            onClose={handleCloseDetail}
          />
        )}
      </Modal>
    </div>
  );
};

export default PesananPage;
