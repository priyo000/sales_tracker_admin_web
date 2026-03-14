import React, { useEffect, useState } from "react";
import { Plus, ShieldCheck, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../features/users/hooks/useUser";
import UserTable from "../features/users/components/UserTable";
import UserForm from "../features/users/components/UserForm";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { User, UserFormData } from "../features/users/types";
import { Karyawan } from "../features/karyawan/types";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const UserPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const {
    users,
    loading,
    error: hookError,
    fetchUsers,
    fetchAvailableEmployees,
    createUser,
    updateUser,
    deleteUser,
    pagination,
  } = useUser();

  const [availableEmployees, setAvailableEmployees] = useState<Karyawan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const isSuperAdmin = currentUser?.peran === "super_admin";

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers({ 
        search: searchTerm,
        page,
        per_page: perPage
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page, perPage, fetchUsers]);

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  const handlePerPageChange = (p: number) => {
    setPerPage(p);
    setPage(1);
  };

  useEffect(() => {
    if (isModalOpen && !editingUser) {
      fetchAvailableEmployees().then(setAvailableEmployees);
    }
  }, [isModalOpen, editingUser, fetchAvailableEmployees]);

  const handleOpenModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateUser = async (data: UserFormData) => {
    let result;
    if (editingUser) {
      result = await updateUser(editingUser.id, data);
    } else {
      result = await createUser(data);
    }

    if (result && result.success) {
      toast.success(
        editingUser ? "User berhasil diperbarui" : "User berhasil dibuat",
      );
      setIsModalOpen(false);
      setEditingUser(null);
    } else {
      // Error managed by hook/toast or above result
    }
  };

  const handleDeleteUser = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const success = await deleteUser(deletingId);
      if (success) {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manajemen User
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola akun akses sistem dan hak akses.
            </p>
          </div>
        </div>
      </div>

      {hookError && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {hookError}
        </div>
      )}

      {/* Super Admin: context banner — shows which company is currently active */}
      {isSuperAdmin && currentUser?.perusahaan && (
        <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/5 px-4 py-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-500/10">
            <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-purple-600/70 dark:text-purple-400/70">
              Konteks Perusahaan Aktif
            </p>
            <p className="text-sm font-bold text-purple-700 dark:text-purple-300 truncate">
              {currentUser.perusahaan.nama_perusahaan}
            </p>
          </div>
          <p className="ml-auto text-[11px] text-muted-foreground hidden sm:block text-right shrink-0">
            User yang dibuat/diubah akan belong to perusahaan ini.
            <br />
            <span className="font-bold text-purple-600/70">
              Ganti perusahaan via dropdown di header.
            </span>
          </p>
        </div>
      )}

      <UserTable
        data={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
        toolbar={
          <Button onClick={handleOpenModal} className="gap-2 shadow-md h-9">
            <Plus className="h-4 w-4" /> Tambah User
          </Button>
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? "Edit Akun User" : "Buat Akun User Baru"}
        size="3xl"
      >
        <UserForm
          initialData={editingUser}
          availableEmployees={availableEmployees}
          onSubmit={handleCreateOrUpdateUser}
          onCancel={() => setIsModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Akun User"
        message="Apakah Anda yakin ingin menghapus akun user ini? Akses user tersebut akan segera dicabut."
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default UserPage;
