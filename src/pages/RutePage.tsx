import React, { useEffect, useState } from "react";
import { Plus, FileUp, Route as RouteIcon } from "lucide-react";
import toast from "react-hot-toast";
import { useRute } from "../features/rute/hooks/useRute";
import RouteTable from "../features/rute/components/RouteTable";
import RouteForm from "../features/rute/components/RouteForm";
import ImportRouteModal from "../features/rute/components/ImportRouteModal";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Rute, RuteFormData } from "../features/rute/types";
import { Button } from "@/components/ui/button";

const RutePage: React.FC = () => {
  const {
    rutes,
    loading,
    error,
    fetchRutes,
    createRute,
    updateRute,
    deleteRute,
    importRute,
  } = useRute();

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Rute | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // Initial Fetch & Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRutes({ search });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, fetchRutes]);

  const handleCreate = () => {
    setEditingRoute(null);
    setIsFormOpen(true);
  };

  const handleEdit = (rute: Rute) => {
    setEditingRoute(rute);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteRute(deletingId);
      if (result && result.success) {
        toast.success("Rute berhasil dihapus");
        setDeletingId(null);
      } else {
        toast.error(result?.message || "Gagal menghapus rute");
      }
    }
  };

  const handleFormSubmit = async (data: RuteFormData) => {
    let result;
    if (editingRoute) {
      result = await updateRute(editingRoute.id, data);
    } else {
      result = await createRute(data);
    }

    if (result.success) {
      toast.success(
        editingRoute ? "Rute berhasil diperbarui" : "Rute berhasil dibuat",
      );
      setIsFormOpen(false);
    } else {
      toast.error(result.message || "Gagal menyimpan rute");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <RouteIcon className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manajemen Rute
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola data rute perjalanan sales untuk pengelompokan pelanggan.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <RouteTable
        data={rutes}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onSearchChange={setSearch}
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm h-9"
            >
              <FileUp className="h-4 w-4" /> Import Excel
            </Button>
            <Button onClick={handleCreate} className="gap-2 shadow-md h-9">
              <Plus className="h-4 w-4" /> Tambah Rute
            </Button>
          </div>
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRoute ? "Edit Data Rute" : "Buat Rute Baru"}
        size="7xl"
        noPadding
        closeOnOutsideClick={false}
      >
        <RouteForm
          key={editingRoute ? editingRoute.id : "create"}
          initialData={editingRoute}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Rute"
        message="Apakah Anda yakin ingin menghapus rute ini? Data pelanggan yang terhubung mungkin akan kehilangan referensi rute."
        type="danger"
        confirmText="Hapus"
      />

      {/* Import Modal */}
      <ImportRouteModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importRute}
      />
    </div>
  );
};

export default RutePage;
