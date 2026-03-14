import { useCrudResource } from "@/hooks/useCrudResource";
import { handleApiError } from "@/lib/utils";
import api from "@/services/api";
import { Rute, RuteFormData } from "../types";

export const useRute = () => {
  const crud = useCrudResource<Rute>("/rute", { resourceName: "rute" });

  const importRute = async (file: File, id_divisi?: number) => {
    crud.setLoading(true);
    crud.setError(null);
    const formData = new FormData();
    formData.append("file", file);
    if (id_divisi) {
      formData.append("id_divisi", id_divisi.toString());
    }
    try {
      const response = await api.post("/rute/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await crud.fetchItems();
      return { success: true, data: response.data };
    } catch (err) {
      const result = handleApiError(err, "Gagal mengimpor rute.");
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  return {
    rutes: crud.items,
    loading: crud.loading,
    error: crud.error,
    fetchRutes: crud.fetchItems,
    createRute: (data: RuteFormData) => crud.createItem(data),
    updateRute: (id: number, data: RuteFormData) => crud.updateItem(id, data),
    deleteRute: (id: number) => crud.deleteItem(id),
    importRute,
    pagination: crud.pagination,
  };
};
