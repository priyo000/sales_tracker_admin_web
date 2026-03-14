import { useCrudResource } from "@/hooks/useCrudResource";
import { handleApiError } from "@/lib/utils";
import api from "@/services/api";
import { Produk } from "../types";

export const useProduk = () => {
  const crud = useCrudResource<Produk>("/produk", {
    resourceName: "produk",
    autoRefreshOnMutate: false,
  });

  const createProduk = async (data: FormData) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      await api.post("/produk", data);
      return { success: true as const };
    } catch (err) {
      const result = handleApiError(err, "Gagal menambah produk.");
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  const updateProduk = async (id: number, data: FormData) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }
      await api.post(`/produk/${id}`, data);
      return { success: true as const };
    } catch (err) {
      const result = handleApiError(err, "Gagal mengubah produk.");
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  return {
    produks: crud.items,
    loading: crud.loading,
    error: crud.error,
    pagination: crud.pagination,
    fetchProduks: crud.fetchItems,
    createProduk,
    updateProduk,
    deleteProduk: (id: number) => crud.deleteItem(id),
    importProduk: (file: File) => crud.importItems(file),
  };
};
