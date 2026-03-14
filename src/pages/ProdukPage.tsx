import React, { useEffect, useState } from "react";
import { Plus, Package, FileUp } from "lucide-react";
import toast from "react-hot-toast";
import { useProduk } from "../features/produk/hooks/useProduk";
import ProductTable from "../features/produk/components/ProductTable";
import ProductForm from "../features/produk/components/ProductForm";
import ImportProductModal from "../features/produk/components/ImportProductModal";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Produk } from "../features/produk/types";
import { Button } from "@/components/ui/button";

const ProdukPage: React.FC = () => {
  const {
    produks,
    loading,
    error: hookError,
    pagination,
    fetchProduks,
    createProduk,
    updateProduk,
    deleteProduk,
    importProduk,
  } = useProduk();

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProduks({ page, search: searchTerm, per_page: perPage });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, page, perPage, fetchProduks]);

  const handleOpenModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditProduct = (product: Produk) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleCreateOrUpdateProduct = async (formData: FormData) => {
    let result;
    if (editingProduct) {
      result = await updateProduk(editingProduct.id, formData);
    } else {
      result = await createProduk(formData);
    }

    if (result.success) {
      toast.success(
        editingProduct ? "Produk diperbarui" : "Produk baru ditambahkan",
      );
      setIsModalOpen(false);
      setEditingProduct(null);
      fetchProduks({ page, search: searchTerm });
    } else {
      toast.error(result.message || "Gagal menyimpan produk");
    }
  };

  const handleDeleteProduct = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteProduk(deletingId);
      if (result.success) {
        toast.success("Produk berhasil dihapus");
        setDeletingId(null);
        fetchProduks({ page, search: searchTerm });
      } else {
        toast.error(result.message || "Gagal menghapus produk");
      }
    }
  };

  const handleImportSuccess = async () => {
    setIsImportModalOpen(false);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/30">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Katalog Produk
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Kelola daftar SKU, harga, dan ketersediaan stok.
            </p>
          </div>
        </div>
      </div>

      {hookError && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {hookError}
        </div>
      )}

      <ProductTable
        produks={produks}
        loading={loading}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
        pagination={pagination}
        onPageChange={setPage}
        onPerPageChange={(pp) => {
          setPerPage(pp);
          setPage(1);
        }}
        onSearchChange={(val) => {
          setSearchTerm(val);
          setPage(1);
        }}
        toolbar={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportModalOpen(true)}
              className="gap-2 border-primary/20 text-primary hover:bg-primary/5 shadow-sm h-9"
            >
              <FileUp className="h-4 w-4" /> Import
            </Button>
            <Button
              onClick={handleOpenModal}
              className="gap-2 shadow-md shadow-primary/10 h-9"
            >
              <Plus className="h-4 w-4" /> Tambah Produk
            </Button>
          </div>
        }
      />

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Data Produk" : "Tambah Produk Baru"}
        size="4xl"
      >
        <ProductForm
          initialData={editingProduct || undefined}
          onSubmit={handleCreateOrUpdateProduct}
          onCancel={() => setIsModalOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Import Modal */}
      <ImportProductModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importProduk as (file: File) => Promise<any>}
        onSuccess={handleImportSuccess}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini?"
        type="danger"
        confirmText="Hapus"
      />
    </div>
  );
};

export default ProdukPage;
