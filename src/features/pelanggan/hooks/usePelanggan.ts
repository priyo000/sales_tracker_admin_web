import { useCallback } from "react";
import api from "@/services/api";
import { useCrudResource } from "@/hooks/useCrudResource";
import { handleApiError } from "@/lib/utils";
import { Pelanggan, PelangganFormData } from "../types";

export const usePelanggan = () => {
  const crud = useCrudResource<Pelanggan>("/pelanggan", {
    resourceName: "pelanggan",
    autoRefreshOnMutate: false,
  });

  const updateStatus = async (id: number, action: "approve" | "reject") => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      await api.post(`/pelanggan/${id}/${action}`);
      return { success: true as const };
    } catch (err) {
      const result = handleApiError(
        err,
        `Gagal melakukan ${action} pelanggan.`,
      );
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  const createPelanggan = async (data: PelangganFormData) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      const response = await api.post("/pelanggan", data);
      return { success: true as const, data: response.data };
    } catch (err) {
      const result = handleApiError(err, "Gagal menambahkan pelanggan.");
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  const updatePelanggan = async (id: number, data: PelangganFormData) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      const response = await api.put(`/pelanggan/${id}`, data);
      return { success: true as const, data: response.data };
    } catch (err) {
      const result = handleApiError(err, "Gagal memperbarui pelanggan.");
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  const fetchFilterOptions = useCallback(
    async (params?: { only_with_data?: boolean }) => {
      try {
        const response = await api.get("/pelanggan/filter-options", { params });
        return response.data.data;
      } catch {
        return [];
      }
    },
    [],
  );

  const exportPelanggan = async (params: {
    status?: string;
    search?: string;
    id_divisi?: number;
    sales_id?: number;
  }) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      const response = await api.get("/pelanggan/export", {
        params,
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Pelanggan_${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch {
      crud.setError("Gagal mengeksport data pelanggan.");
      return { success: false };
    } finally {
      crud.setLoading(false);
    }
  };

  return {
    pelanggans: crud.items,
    loading: crud.loading,
    error: crud.error,
    fetchPelanggans: crud.fetchItems,
    updateStatus,
    createPelanggan,
    updatePelanggan,
    importPelanggan: (file: File) => crud.importItems(file),
    fetchFilterOptions,
    exportPelanggan,
    pagination: crud.pagination,
  };
};
