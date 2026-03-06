import React, { useEffect, useState, useMemo } from "react";
import { Plus, Calendar as CalendarIcon } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useJadwal } from "../features/jadwal/hooks/useJadwal";
import JadwalForm from "../features/jadwal/components/JadwalForm";
import MasterSchedule from "../features/jadwal/components/MasterSchedule";
import DailyScheduleTable from "../features/jadwal/components/DailyScheduleTable";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Jadwal, JadwalFormData } from "../features/jadwal/types";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

const JadwalPage: React.FC = () => {
  const {
    jadwals,
    loading,
    error,
    karyawanOptions,
    ruteOptions,
    fetchJadwals,
    fetchOptions,
    createJadwal,
    updateJadwal,
    deleteJadwal,
    pagination,
  } = useJadwal();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const [activeTab, setActiveTab] = useState<"daily" | "recurring">("daily");

  // Default date to Today
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  const todayStr = `${yyyy}-${mm}-${dd}`;

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: today,
    to: today,
  });

  const startDate = useMemo(() => 
    dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : "", 
    [dateRange]
  );
  
  const endDate = useMemo(() => 
    dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : "", 
    [dateRange]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJadwal, setEditingJadwal] = useState<Jadwal | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Initial Load & Filter Change
  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  useEffect(() => {
    if (activeTab === "daily") {
      const timer = setTimeout(() => {
        const params: {
          start_date?: string;
          end_date?: string;
          search?: string;
          page?: number;
          per_page?: number;
        } = {
          page,
          per_page: perPage
        };
        if (startDate) params.start_date = startDate;
        if (endDate) params.end_date = endDate;
        if (searchTerm) params.search = searchTerm;
        fetchJadwals(params);
      }, 500); // Debounce search
      return () => clearTimeout(timer);
    }
  }, [startDate, endDate, searchTerm, activeTab, page, perPage, fetchJadwals]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePerPageChange = (p: number) => {
    setPerPage(p);
    setPage(1);
  };

  const handleOpenModal = () => {
    setEditingJadwal(null);
    setIsModalOpen(true);
  };

  const handleEditJadwal = (jadwal: Jadwal) => {
    setEditingJadwal(jadwal);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateJadwal = async (data: JadwalFormData) => {
    let result;
    if (editingJadwal) {
      result = await updateJadwal(editingJadwal.id, data);
    } else {
      result = await createJadwal(data);
    }

    if (result.success) {
      toast.success(
        editingJadwal
          ? "Jadwal berhasil diperbarui"
          : "Jadwal harian berhasil dibuat",
      );
      setIsModalOpen(false);
      setEditingJadwal(null);
      refreshData();
    } else {
      toast.error(result.message || "Gagal menyimpan jadwal");
    }
  };

  const handleDeleteJadwal = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteJadwal(deletingId);
      if (result.success) {
        toast.success("Jadwal berhasil dihapus");
        setDeletingId(null);
        refreshData();
      } else {
        toast.error(result.message || "Gagal menghapus jadwal");
      }
    }
  };

  const refreshData = () => {
    const params: { start_date?: string; end_date?: string; search?: string } =
      {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    if (searchTerm) params.search = searchTerm;
    fetchJadwals(params);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <CalendarIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Jadwal Kunjungan Sales
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Kelola jadwal kunjungan harian dan pola mingguan otomatis.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleOpenModal}
            className="gap-2 shadow-md h-10 px-5"
          >
            <Plus className="h-4 w-4" /> Tambah Manual
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
        <button
          onClick={() => setActiveTab("daily")}
          className={cn(
            "px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg",
            activeTab === "daily"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          Jadwal Harian
        </button>
        <button
          onClick={() => setActiveTab("recurring")}
          className={cn(
            "px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg",
            activeTab === "recurring"
              ? "bg-primary text-white shadow-md shadow-primary/20"
              : "text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          Master Jadwal (Recurring)
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      {activeTab === "daily" ? (
        <div className="space-y-4 animate-in fade-in duration-300">
          <DailyScheduleTable
            data={jadwals}
            loading={loading}
            onEdit={handleEditJadwal}
            onDelete={handleDeleteJadwal}
            onSearchChange={(val) => {
              setSearchTerm(val);
              setPage(1);
            }}
            pagination={pagination}
            onPageChange={handlePageChange}
            onPerPageChange={handlePerPageChange}
            toolbar={
              <div className="flex flex-wrap items-center gap-3 w-full">
                <div className="flex items-center gap-1.5 min-w-[260px]">
                  <DatePickerWithRange
                    date={dateRange}
                    onChange={setDateRange}
                  />
                </div>

                {(startDate !== todayStr ||
                  endDate !== todayStr ||
                  searchTerm) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDateRange({ from: today, to: today });
                      setSearchTerm("");
                    }}
                    className="text-destructive h-10 px-4 hover:bg-destructive/10 text-xs font-black uppercase tracking-widest"
                  >
                    Reset Filter
                  </Button>
                )}
              </div>
            }
          />
        </div>
      ) : (
        <div className="animate-in fade-in duration-300">
          <MasterSchedule
            karyawanOptions={karyawanOptions}
            ruteOptions={ruteOptions}
          />
        </div>
      )}

      {/* Create Schedule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingJadwal ? "Edit Jadwal" : "Tambah Jadwal Manual"}
        size="md"
      >
        <JadwalForm
          key={editingJadwal ? editingJadwal.id : "create"}
          initialData={editingJadwal || undefined}
          existingJadwals={jadwals}
          onSubmit={handleCreateOrUpdateJadwal}
          onCancel={() => setIsModalOpen(false)}
          karyawanOptions={karyawanOptions}
          ruteOptions={ruteOptions}
          initialDate={todayStr}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Jadwal"
        message="Apakah Anda yakin ingin menghapus/membatalkan jadwal ini?"
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default JadwalPage;
