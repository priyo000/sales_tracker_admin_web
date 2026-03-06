import React, { useEffect, useState } from "react";
import { Plus, Users, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { useKaryawan } from "../features/karyawan/hooks/useKaryawan";
import { useDivisi } from "../features/divisi/hooks/useDivisi";
import EmployeeTable from "../features/karyawan/components/EmployeeTable";
import EmployeeForm from "../features/karyawan/components/EmployeeForm";
import ImportKaryawanModal from "../features/karyawan/components/ImportEmployeeModal";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Karyawan, KaryawanFormData } from "../features/karyawan/types";
import { Button } from "@/components/ui/button";

const KaryawanPage: React.FC = () => {
  const {
    karyawans,
    loading,
    error: hookError,
    fetchKaryawans,
    createKaryawan,
    updateKaryawan,
    deleteKaryawan,
    importKaryawan,
    pagination,
  } = useKaryawan();

  const { divisis, fetchDivisis } = useDivisi();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Karyawan | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    fetchDivisis();
  }, [fetchDivisis]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchKaryawans({ 
        search: searchTerm,
        page,
        per_page: perPage
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page, perPage, fetchKaryawans]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePerPageChange = (p: number) => {
    setPerPage(p);
    setPage(1);
  };

  const handleOpenModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Karyawan) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateEmployee = async (data: KaryawanFormData) => {
    let result;
    if (editingEmployee) {
      result = await updateKaryawan(editingEmployee.id, data);
    } else {
      result = await createKaryawan(data);
    }

    if (result.success) {
      toast.success(
        editingEmployee
          ? "Data karyawan diperbarui"
          : "Karyawan baru ditambahkan",
      );
      setIsModalOpen(false);
      setEditingEmployee(null);
    } else {
      toast.error(result.message || "Gagal menyimpan data karyawan");
    }
  };

  const handleDeleteEmployee = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteKaryawan(deletingId);
      if (result.success) {
        toast.success("Karyawan berhasil dihapus");
        setDeletingId(null);
      } else {
        toast.error(result.message || "Gagal menghapus karyawan");
      }
    }
  };

  const handleImport = async (file: File) => {
    const result = await importKaryawan(file);
    if (result.success) {
      toast.success("Data karyawan berhasil diimport");
      setIsImportModalOpen(false);
    } else {
      toast.error(result.message || "Gagal mengimport data");
    }
    return result;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Data Karyawan
            </h1>
            <p className="text-sm text-muted-foreground">
              Kelola data personil sales dan operasional.
            </p>
          </div>
        </div>
      </div>

      {hookError && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {hookError}
        </div>
      )}

      <EmployeeTable
        data={karyawans}
        loading={loading}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5 h-9"
            >
              <FileUp className="h-4 w-4" /> Import
            </Button>
            <Button onClick={handleOpenModal} className="gap-2 shadow-md h-9">
              <Plus className="h-4 w-4" /> Tambah Karyawan
            </Button>
          </div>
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? "Edit Data Karyawan" : "Tambah Karyawan Baru"}
        size="4xl"
        noPadding
      >
        <EmployeeForm
          initialData={editingEmployee || undefined}
          divisiOptions={divisis}
          onSubmit={handleCreateOrUpdateEmployee}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Import Modal */}
      <ImportKaryawanModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImport}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Data Karyawan"
        message="Apakah Anda yakin ingin menghapus data karyawan ini? Tindakan ini tidak dapat dibatalkan."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default KaryawanPage;
