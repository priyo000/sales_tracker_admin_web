import React from "react";
import { Package, Edit, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { Produk } from "../types";
import { getImageUrl } from "@/lib/utils";

interface ProductTableProps {
  produks: Produk[];
  onEdit: (produk: Produk) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  onPageChange?: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  produks,
  onEdit,
  onDelete,
  loading,
  pagination,
  onPageChange,
  onPerPageChange,
}) => {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Info Barang
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
              Kode / SKU
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Harga
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
              Stok
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {loading ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                <div className="flex items-center justify-center py-4">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                  <span className="ml-2">Memuat data produk...</span>
                </div>
              </td>
            </tr>
          ) : !Array.isArray(produks) || produks.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-6 py-4 text-center text-sm text-gray-500"
              >
                {!Array.isArray(produks)
                  ? "Data produk tidak valid dari server."
                  : "Belum ada data produk."}
              </td>
            </tr>
          ) : (
            produks.map((produk, index) => (
              <tr key={produk?.id || index}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0 rounded bg-indigo-100 flex items-center justify-center text-indigo-500 overflow-hidden">
                      {produk?.gambar_url ? (
                        <img
                          src={getImageUrl(produk.gambar_url) || ""}
                          alt={produk.nama_produk || "Produk"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {produk?.nama_produk || "-"}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-sm text-gray-500">
                          {produk?.satuan || "pcs"}
                        </span>
                        {produk?.kategori &&
                          typeof produk.kategori === "object" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                              {produk.kategori.nama_kategori || "Tanpa Nama"}
                            </span>
                          )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {produk?.kode_barang || "-"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {produk?.sku || "-"}
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm text-gray-500 font-medium">
                  Rp{" "}
                  {(parseFloat(produk?.harga_jual || "0") || 0).toLocaleString(
                    "id-ID",
                  )}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-900 font-bold">
                  {produk?.stok_tersedia ?? 0}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                  <button
                    onClick={() => produk && onEdit(produk)}
                    className="mr-3 text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => produk?.id && onDelete(produk.id)}
                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination Controls */}
      {pagination && pagination.lastPage > 1 && (
        <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <p className="text-sm text-gray-600">
                Menampilkan{" "}
                <span className="font-bold text-gray-900">
                  {produks.length}
                </span>{" "}
                dari{" "}
                <span className="font-bold text-gray-900">
                  {pagination.total}
                </span>{" "}
                total data
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-500">
                  Tampilkan:
                </span>
                <div className="relative">
                  <select
                    className="appearance-none block w-full pl-3 pr-8 py-1 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all cursor-pointer hover:border-gray-400"
                    value={pagination.perPage}
                    onChange={(e) => onPerPageChange?.(Number(e.target.value))}
                  >
                    <option value={10}>10 Baris</option>
                    <option value={20}>20 Baris</option>
                    <option value={50}>50 Baris</option>
                    <option value={100}>100 Baris</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                    <svg
                      className="h-4 w-4 fill-current"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                    >
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <button
                  onClick={() => onPageChange?.(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1)
                  .filter((p) => {
                    if (pagination.lastPage <= 7) return true;
                    return (
                      Math.abs(p - pagination.currentPage) <= 1 ||
                      p === 1 ||
                      p === pagination.lastPage
                    );
                  })
                  .map((p, i, arr) => (
                    <React.Fragment key={p}>
                      {i > 0 && arr[i - 1] !== p - 1 && (
                        <span className="relative inline-flex items-center px-4 py-2 border border-gray-200 bg-white text-sm font-medium text-gray-700 font-mono tracking-tighter">
                          ...
                        </span>
                      )}
                      <button
                        onClick={() => onPageChange?.(p)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-bold transition-all ${
                          pagination.currentPage === p
                            ? "z-10 bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => onPageChange?.(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.lastPage}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
