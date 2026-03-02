import React, { useEffect, useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useUser } from "../features/users/hooks/useUser";
import UserTable from "../features/users/components/UserTable";
import UserForm from "../features/users/components/UserForm";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { User, UserFormData } from "../features/users/types";
import { Karyawan } from "../features/karyawan/types";
import { Button } from "@/components/ui/button";

const UserPage: React.FC = () => {
  const {
    users,
    loading,
    error: hookError,
    fetchUsers,
    fetchAvailableEmployees,
    createUser,
    updateUser,
    deleteUser,
  } = useUser();

  const [availableEmployees, setAvailableEmployees] = useState<Karyawan[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers({ search: searchTerm });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchUsers]);

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

      <UserTable
        data={users}
        loading={loading}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onSearchChange={setSearchTerm}
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
        noPadding
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
