import React, { useEffect, useState } from "react";
import { Plus, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { usePerusahaan } from "../features/perusahaan/hooks/usePerusahaan";
import PerusahaanTable from "../features/perusahaan/components/PerusahaanTable";
import PerusahaanForm from "../features/perusahaan/components/PerusahaanForm";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Perusahaan, PerusahaanFormData } from "../features/perusahaan/types";
import { Button } from "@/components/ui/button";

const PerusahaanPage: React.FC = () => {
  const {
    perusahaans,
    loading,
    error: hookError,
    fetchPerusahaans,
    createPerusahaan,
    updatePerusahaan,
    deletePerusahaan,
    pagination,
  } = usePerusahaan();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Perusahaan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPerusahaans({
        search: searchTerm,
        page,
        per_page: perPage,
      });
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, page, perPage, fetchPerusahaans]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePerPageChange = (p: number) => {
    setPerPage(p);
    setPage(1);
  };

  const handleOpenModal = () => {
    setEditingCompany(null);
    setIsModalOpen(true);
  };

  const handleEditCompany = (company: Perusahaan) => {
    setEditingCompany(company);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateCompany = async (data: PerusahaanFormData) => {
    let result;
    if (editingCompany) {
      result = await updatePerusahaan(editingCompany.id, data);
    } else {
      result = await createPerusahaan(data);
    }

    if (result.success) {
      toast.success(
        editingCompany
          ? "Perusahaan berhasil diperbarui"
          : "Perusahaan berhasil dibuat",
      );
      setIsModalOpen(false);
      setEditingCompany(null);
    } else {
      toast.error(result.message || "Gagal menyimpan perusahaan");
    }
  };

  const handleDeleteCompany = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deletePerusahaan(deletingId);
      if (result.success) {
        toast.success("Perusahaan berhasil dihapus");
        setDeletingId(null);
      } else {
        toast.error(result.message || "Gagal menghapus perusahaan");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Data Perusahaan
            </h1>
            <p className="text-sm text-muted-foreground">
              Katalog pelanggan korporat dan cabang perusahaan.
            </p>
          </div>
        </div>
      </div>

      {hookError && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {hookError}
        </div>
      )}

      <PerusahaanTable
        data={perusahaans}
        loading={loading}
        onEdit={handleEditCompany}
        onDelete={handleDeleteCompany}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        toolbar={
          <Button onClick={handleOpenModal} className="gap-2 shadow-md h-9">
            <Plus className="h-4 w-4" /> Tambah Perusahaan
          </Button>
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          editingCompany ? "Edit Data Perusahaan" : "Daftar Perusahaan Baru"
        }
        size="4xl"
      >
        <PerusahaanForm
          initialData={editingCompany || undefined}
          onSubmit={handleCreateOrUpdateCompany}
          onCancel={() => setIsModalOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Data Perusahaan"
        message="Apakah Anda yakin ingin menghapus data perusahaan ini?"
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default PerusahaanPage;
