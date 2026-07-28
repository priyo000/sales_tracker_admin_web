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

  const bulkUpdateStatus = async (
    ids: number[],
    status: "active" | "nonactive",
  ) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      const response = await api.post("/pelanggan/bulk-status", { ids, status });
      return {
        success: true as const,
        data: response.data,
        message: response.data?.message as string | undefined,
      };
    } catch (err) {
      const result = handleApiError(
        err,
        "Gagal mengubah status pelanggan terpilih.",
      );
      crud.setError(result.message);
      return result;
    } finally {
      crud.setLoading(false);
    }
  };

  const toPelangganPayload = (data: PelangganFormData) => {
    const payload: Record<string, unknown> = { ...data };

    // Never send empty string for nullable unique fields.
    if (!payload.kode_pelanggan) {
      delete payload.kode_pelanggan;
    }

    // Company-owned customers use null, not 0.
    if (
      payload.id_sales_pembuat === 0 ||
      payload.id_sales_pembuat === "0" ||
      payload.id_sales_pembuat === ""
    ) {
      payload.id_sales_pembuat = null;
    }

    if (payload.id_divisi === 0 || payload.id_divisi === "0") {
      delete payload.id_divisi;
    }

    // Drop file fields when no new upload is selected.
    if (!payload.foto_toko) delete payload.foto_toko;
    if (!payload.foto_ktp) delete payload.foto_ktp;

    return payload;
  };

  // The API expects file uploads as multipart/form-data. A plain JSON body
  // serializes File objects to "{}", which fails the image|mimes validation.
  const toFormData = (payload: Record<string, unknown>): FormData => {
    const formData = new FormData();
    for (const [key, value] of Object.entries(payload)) {
      if (value === undefined || value === null) continue;
      if (value instanceof File) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
    return formData;
  };

  const createPelanggan = async (data: PelangganFormData) => {
    crud.setLoading(true);
    crud.setError(null);
    try {
      const response = await api.post(
        "/pelanggan",
        toFormData(toPelangganPayload(data)),
      );
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
      // POST + _method=PUT: Laravel method spoofing, required for multipart uploads.
      const formData = toFormData(toPelangganPayload(data));
      formData.append("_method", "PUT");
      const response = await api.post(`/pelanggan/${id}`, formData);
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
    bulkUpdateStatus,
    createPelanggan,
    updatePelanggan,
    importPelanggan: (file: File) => crud.importItems(file),
    fetchFilterOptions,
    exportPelanggan,
    pagination: crud.pagination,
  };
};
