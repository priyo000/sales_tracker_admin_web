import React, { useEffect, useState } from "react";
import { Plus, Upload, Store, SlidersHorizontal, Download } from "lucide-react";
import toast from "react-hot-toast";
import { usePelanggan } from "../features/pelanggan/hooks/usePelanggan";
import CustomerTable from "../features/pelanggan/components/CustomerTable";
import CustomerForm from "../features/pelanggan/components/CustomerForm";
import CustomerDetail from "../features/pelanggan/components/CustomerDetail";
import ImportCustomerModal from "../features/pelanggan/components/ImportCustomerModal";
import { ExportCustomerModal } from "../features/pelanggan/components/ExportCustomerModal";
import { ConfirmModal, Modal } from "../components/ui/Modal";
import {
  PelangganStatus,
  PelangganFormData,
  Pelanggan,
} from "../features/pelanggan/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const PelangganPage: React.FC = () => {
  const {
    pelanggans,
    loading: loadingData,
    error,
    fetchPelanggans,
    updateStatus,
    createPelanggan,
    updatePelanggan,
    importPelanggan,
    exportPelanggan,
    pagination,
  } = usePelanggan();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PelangganStatus | "all">(
    "all",
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPelanggan, setEditingPelanggan] = useState<Pelanggan | null>(
    null,
  );
  const [viewingPelanggan, setViewingPelanggan] = useState<Pelanggan | null>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [perPage, setPerPage] = useState(20);
  const [page, setPage] = useState(1);

  const [confirmAction, setConfirmAction] = useState<{
    id: number;
    type: "approve" | "reject";
  } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPelanggans({
        search,
        status: filterStatus,
        page,
        per_page: perPage,
      });
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [search, filterStatus, fetchPelanggans, page, perPage]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    setPage(1);
  };

  const handleAction = async () => {
    if (!confirmAction) return;

    const result = await updateStatus(confirmAction.id, confirmAction.type);
    if (result.success) {
      toast.success(
        `Pelanggan berhasil ${confirmAction.type === "approve" ? "disetujui" : "ditolak"}`,
      );
      fetchPelanggans({ search, status: filterStatus });
      setConfirmAction(null);
    } else {
      toast.error(result.message || "Gagal memproses pelanggan");
    }
  };

  const handleCreatePelanggan = async (data: PelangganFormData) => {
    setIsSubmitting(true);
    const result = await createPelanggan(data);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Pelanggan berhasil ditambahkan");
      setIsAddModalOpen(false);
      fetchPelanggans({ search, status: filterStatus });
    } else {
      toast.error(result.message || "Gagal menambahkan pelanggan");
    }
  };

  const handleUpdatePelanggan = async (data: PelangganFormData) => {
    if (!editingPelanggan) return;
    setIsSubmitting(true);
    const result = await updatePelanggan(editingPelanggan.id, data);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Data pelanggan berhasil diperbarui");
      setEditingPelanggan(null);
      fetchPelanggans({ search, status: filterStatus });
    } else {
      toast.error(result.message || "Gagal memperbarui pelanggan");
    }
  };

  const handleExportData = async (statuses: string[]) => {
    setIsSubmitting(true);
    const result = await exportPelanggan({
      status: statuses.length > 0 ? statuses.join(",") : undefined,
      search: search || undefined,
    });
    setIsSubmitting(false);
    if (result.success) {
      toast.success("Data pelanggan berhasil diexport");
      setIsExportModalOpen(false);
    } else {
      toast.error("Gagal mengexport data pelanggan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Data Pelanggan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola dan verifikasi data pelanggan toko.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <CustomerTable
        data={pelanggans}
        loading={loadingData}
        onApprove={(id) => setConfirmAction({ id, type: "approve" })}
        onReject={(id) => setConfirmAction({ id, type: "reject" })}
        onEdit={(p) => setEditingPelanggan(p)}
        onView={(p) => setViewingPelanggan(p)}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        onSearchChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        toolbar={
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[180px]">
              <Select
                value={filterStatus}
                onValueChange={(val) => {
                  setFilterStatus(val as PelangganStatus | "all");
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
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="nonactive">Non-Active</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsImportModalOpen(true)}
                className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm h-9"
              >
                <Upload className="h-4 w-4" /> Import Excel
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExportModalOpen(true)}
                className="gap-2 border-green-600/20 text-green-600 hover:bg-green-50 shadow-sm h-9"
              >
                <Download className="h-4 w-4" /> Export Excel
              </Button>

              <Button
                onClick={() => setIsAddModalOpen(true)}
                size="sm"
                className="gap-2 shadow-md h-9"
              >
                <Plus className="h-4 w-4" /> Tambah Pelanggan
              </Button>
            </div>
          </div>
        }
      />

      {/* Add Pelanggan Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Tambah Pelanggan Baru"
        size="5xl"
      >
        <CustomerForm
          onSubmit={handleCreatePelanggan}
          onCancel={() => setIsAddModalOpen(false)}
          loading={isSubmitting}
        />
      </Modal>

      {/* Edit Pelanggan Modal */}
      <Modal
        isOpen={!!editingPelanggan}
        onClose={() => setEditingPelanggan(null)}
        title={`Edit Pelanggan: ${editingPelanggan?.nama_toko}`}
        size="5xl"
      >
        <CustomerForm
          initialData={editingPelanggan}
          onSubmit={handleUpdatePelanggan}
          onCancel={() => setEditingPelanggan(null)}
          loading={isSubmitting}
        />
      </Modal>

      {/* View Pelanggan Modal */}
      <Modal
        isOpen={!!viewingPelanggan}
        onClose={() => setViewingPelanggan(null)}
        title={`Detail Pelanggan: ${viewingPelanggan?.nama_toko}`}
        size="6xl"
      >
        {viewingPelanggan && <CustomerDetail data={viewingPelanggan} />}
      </Modal>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.type === "approve"
            ? "Setujui Pelanggan"
            : "Tolak Pelanggan"
        }
        message={`Apakah Anda yakin ingin ${confirmAction?.type === "approve" ? "menyetujui" : "menolak"} pendaftaran pelanggan ini?`}
        type={confirmAction?.type === "approve" ? "warning" : "danger"}
        confirmText={confirmAction?.type === "approve" ? "Approve" : "Reject"}
      />

      {/* Import Modal */}
      <ImportCustomerModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importPelanggan}
      />

      {/* Export Modal */}
      <ExportCustomerModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportData}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default PelangganPage;
