import React, { useEffect, useState } from "react";
import { Plus, LayoutGrid } from "lucide-react";
import toast from "react-hot-toast";
import { useDivisi } from "../features/divisi/hooks/useDivisi";
import DivisionTable from "../features/divisi/components/DivisionTable";
import DivisionForm from "../features/divisi/components/DivisionForm";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Divisi, DivisiFormData } from "../features/divisi/types";
import { Button } from "@/components/ui/button";

const DivisiPage: React.FC = () => {
  const {
    divisis,
    loading,
    fetchDivisis,
    createDivisi,
    updateDivisi,
    deleteDivisi,
  } = useDivisi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivisi, setEditingDivisi] = useState<Divisi | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDivisis();
  }, [fetchDivisis]);

  const handleOpenModal = () => {
    setEditingDivisi(null);
    setIsModalOpen(true);
  };

  const handleEditDivisi = (divisi: Divisi) => {
    setEditingDivisi(divisi);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateDivisi = async (data: DivisiFormData) => {
    let result;
    if (editingDivisi) {
      result = await updateDivisi(editingDivisi.id, data);
    } else {
      result = await createDivisi(data);
    }

    if (result.success) {
      toast.success(
        editingDivisi ? "Divisi diperbarui" : "Divisi baru ditambahkan",
      );
      setIsModalOpen(false);
      setEditingDivisi(null);
      fetchDivisis();
    } else {
      toast.error(result.message || "Gagal menyimpan divisi");
    }
  };

  const handleDeleteDivisi = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteDivisi(deletingId);
      if (result.success) {
        toast.success("Divisi berhasil dihapus");
        setDeletingId(null);
        fetchDivisis();
      } else {
        toast.error(result.message || "Gagal menghapus divisi");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manajemen Divisi
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola struktur organisasi dan jangkauan akses data.
            </p>
          </div>
        </div>
      </div>

      <DivisionTable
        data={divisis}
        loading={loading}
        onEdit={handleEditDivisi}
        onDelete={handleDeleteDivisi}
        toolbar={
          <Button onClick={handleOpenModal} className="gap-2 shadow-md h-9">
            <Plus className="h-4 w-4" /> Tambah Divisi
          </Button>
        }
      />

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDivisi ? "Edit Data Divisi" : "Tambah Divisi Baru"}
        size="2xl"
      >
        <DivisionForm
          initialData={editingDivisi || undefined}
          onSubmit={handleCreateOrUpdateDivisi}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Divisi"
        message="Apakah Anda yakin ingin menghapus divisi ini?"
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default DivisiPage;
