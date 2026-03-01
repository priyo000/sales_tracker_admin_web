import React from "react";
import { Package, Edit, Trash } from "lucide-react";
import { Produk } from "../types";
import { getImageUrl } from "@/lib/utils";

interface ProductTableProps {
  produks: Produk[];
  onEdit: (produk: Produk) => void;
  onDelete: (id: number) => void;
  loading?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  produks,
  onEdit,
  onDelete,
  loading,
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
    </div>
  );
};

export default ProductTable;
