import React, { useEffect, useState } from "react";
import { Plus, Search, Upload, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useProduk } from "../features/produk/hooks/useProduk";
import { useKategoriProduk } from "../features/produk/hooks/useKategoriProduk";
import ProductTable from "../features/produk/components/ProductTable";
import ProductForm from "../features/produk/components/ProductForm";
import ImportProductModal from "../features/produk/components/ImportProductModal";
import { Modal, ConfirmModal } from "../components/ui/Modal";
import { Produk } from "../features/produk/types";

const ProdukPage: React.FC = () => {
  const {
    produks,
    loading,
    error,
    pagination,
    fetchProduks,
    createProduk,
    updateProduk,
    deleteProduk,
    importProduk,
  } = useProduk();

  const [perPage, setPerPage] = useState(20);

  const {
    kategoris,
    fetchKategoris,
    createKategori,
    deleteKategori,
    loading: katLoading,
  } = useKategoriProduk();

  const [search, setSearch] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isKategoriModalOpen, setIsKategoriModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Produk | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State for inline add-category form inside the modal
  const [newKatNama, setNewKatNama] = useState("");
  const [newKatDesc, setNewKatDesc] = useState("");

  // Initial fetch categories
  useEffect(() => {
    fetchKategoris();
  }, [fetchKategoris]);

  // Filter debounce for products
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProduks({
        search,
        id_kategori: selectedKategori || undefined,
        page: pagination.currentPage,
        per_page: perPage,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedKategori, fetchProduks, pagination.currentPage, perPage]);

  const handlePageChange = (page: number) => {
    fetchProduks({
      search,
      id_kategori: selectedKategori || undefined,
      page,
      per_page: perPage,
    });
  };

  const handlePerPageChange = (newPerPage: number) => {
    setPerPage(newPerPage);
    fetchProduks({
      search,
      id_kategori: selectedKategori || undefined,
      page: 1,
      per_page: newPerPage,
    });
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const handleEdit = (produk: Produk) => {
    setEditingProduct(produk);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      const result = await deleteProduk(deletingId);
      if (result && result.success) {
        toast.success("Produk berhasil dihapus");
        setDeletingId(null);
      } else {
        toast.error(result?.message || "Gagal menghapus produk");
      }
    }
  };

  const handleFormSubmit = async (data: FormData) => {
    let result;
    if (editingProduct) {
      result = await updateProduk(editingProduct.id, data);
    } else {
      result = await createProduk(data);
    }

    if (result.success) {
      toast.success(
        editingProduct
          ? "Produk berhasil diperbarui"
          : "Produk berhasil ditambahkan",
      );
      setIsFormOpen(false);
    } else {
      toast.error(result.message || "Gagal menyimpan produk");
    }
  };

  const handleTambahKategori = async () => {
    if (!newKatNama.trim()) {
      toast.error("Nama kategori tidak boleh kosong.");
      return;
    }
    const result = await createKategori({
      nama_kategori: newKatNama.trim(),
      deskripsi: newKatDesc,
    });
    if (result.success) {
      toast.success("Kategori berhasil ditambahkan.");
      setNewKatNama("");
      setNewKatDesc("");
    } else {
      toast.error(result.message || "Gagal menambah kategori.");
    }
  };

  const handleHapusKategori = async (id: number) => {
    const result = await deleteKategori(id);
    if (result.success) {
      toast.success("Kategori dihapus.");
    } else {
      toast.error(result.message || "Gagal menghapus.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h1 className="text-2xl font-bold text-gray-800">Master Produk</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setIsKategoriModalOpen(true)}
            className="flex items-center justify-center rounded-md bg-white border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 shadow-sm transition-transform active:scale-95 text-sm font-medium"
          >
            <Tag className="mr-2 h-4 w-4" /> Kelola Kategori
          </button>
          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center justify-center rounded-md bg-white border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 shadow-sm transition-transform active:scale-95 text-sm font-medium"
          >
            <Upload className="mr-2 h-4 w-4" /> Import Excel
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 shadow-sm transition-transform active:scale-95 text-sm font-medium"
          >
            <Plus className="mr-2 h-4 w-4" /> Tambah Produk
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        Kelola data produk yang akan dijual oleh sales.
      </p>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 leading-5 placeholder-gray-500 focus:border-indigo-500 focus:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
            placeholder="Cari produk (Nama, Kode, SKU)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="w-full md:w-64">
          <select
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 leading-5 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm shadow-sm"
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
          >
            <option value="">Semua Kategori</option>
            {kategoris.map((kat) => (
              <option key={kat.id} value={kat.id.toString()}>
                {kat.nama_kategori}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Product Table */}
      <ProductTable
        produks={produks}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPerPageChange={handlePerPageChange}
      />

      {/* ===== MODAL: Kelola Kategori (inline, no nested modal) ===== */}
      <Modal
        isOpen={isKategoriModalOpen}
        onClose={() => setIsKategoriModalOpen(false)}
        title="Kelola Kategori Produk"
        size="md"
      >
        <div className="space-y-4">
          {/* Daftar Kategori */}
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 max-h-52 overflow-y-auto">
            {kategoris.length === 0 ? (
              <p className="p-4 text-center text-sm text-gray-400">
                Belum ada kategori. Tambahkan di bawah.
              </p>
            ) : (
              kategoris.map((kat) => (
                <div
                  key={kat.id}
                  className="flex items-center justify-between px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {kat.nama_kategori}
                    </p>
                    {kat.deskripsi && (
                      <p className="text-xs text-gray-400">{kat.deskripsi}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleHapusKategori(kat.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    Hapus
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ── Inline Form Tambah Kategori (no nested Modal) ── */}
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              Tambah Kategori Baru
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  value={newKatNama}
                  onChange={(e) => setNewKatNama(e.target.value)}
                  placeholder="Contoh: Makanan, Minuman, Elektronik"
                  onKeyDown={(e) => e.key === "Enter" && handleTambahKategori()}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600">
                  Deskripsi (Opsional)
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2"
                  value={newKatDesc}
                  onChange={(e) => setNewKatDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleTambahKategori}
                  disabled={katLoading}
                  className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700 disabled:bg-indigo-400"
                >
                  <Plus className="h-4 w-4" />
                  {katLoading ? "Menyimpan..." : "Tambah"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <ImportProductModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImport={importProduk}
      />

      {/* Product Form Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
        size="lg"
      >
        <ProductForm
          key={editingProduct ? editingProduct.id : "create"}
          initialData={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
          isLoading={loading}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
        type="danger"
      />
    </div>
  );
};

export default ProdukPage;
