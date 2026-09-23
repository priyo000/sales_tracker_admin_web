import { useState, useCallback } from "react";
import api from "@/services/api";
import { handleApiError } from "@/lib/utils";
import type { Pagination } from "@/hooks/useCrudResource";
import { Kiriman, KirimanFormData } from "../types";

/**
 * Hook fitur Rute Kiriman. Mengikuti pola hook feature lain
 * (lihat useRute.ts): state + fetch + mutasi yang mengembalikan CrudResult.
 */
export const useKiriman = () => {
  const [kirimans, setKirimans] = useState<Kiriman[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const fetchKirimans = useCallback(
    async (params?: Record<string, unknown>): Promise<Kiriman[]> => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/kiriman", { params });
        const data = Array.isArray(response.data?.data)
          ? response.data.data
          : [];
        setKirimans(data);
        if (response.data?.current_page) {
          setPagination({
            currentPage: response.data.current_page,
            lastPage: response.data.last_page,
            total: response.data.total,
            perPage: response.data.per_page,
          });
        }
        return data;
      } catch (err) {
        const result = handleApiError(err, "Gagal memuat daftar kiriman.");
        setError(result.message);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getKiriman = useCallback(
    async (id: number): Promise<Kiriman | null> => {
      try {
        const response = await api.get(`/kiriman/${id}`);
        return response.data?.data ?? response.data ?? null;
      } catch (err) {
        const result = handleApiError(err, "Gagal memuat kiriman.");
        setError(result.message);
        return null;
      }
    },
    [],
  );

  const createKiriman = useCallback(
    async (data: KirimanFormData): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.post("/kiriman", data);
        return { success: true, data: response.data?.data ?? response.data };
      } catch (err) {
        return handleApiError(err, "Gagal menyimpan kiriman.");
      }
    },
    [],
  );

  const updateKiriman = useCallback(
    async (id: number, data: Partial<KirimanFormData>): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.put(`/kiriman/${id}`, data);
        return { success: true, data: response.data?.data ?? response.data };
      } catch (err) {
        return handleApiError(err, "Gagal memperbarui kiriman.");
      }
    },
    [],
  );

  const deleteKiriman = useCallback(
    async (id: number): Promise<{ success: boolean; message?: string }> => {
      try {
        await api.delete(`/kiriman/${id}`);
        return { success: true };
      } catch (err) {
        return handleApiError(err, "Gagal menghapus kiriman.");
      }
    },
    [],
  );

  /** Tambah isi satu rute master ke kiriman (duplikat dilewati backend). */
  const addRute = useCallback(
    async (id: number, idRute: number): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.post(`/kiriman/${id}/rute`, { id_rute: idRute });
        return { success: true, data: response.data };
      } catch (err) {
        return handleApiError(err, "Gagal menambahkan rute.");
      }
    },
    [],
  );

  /** Tambah pelanggan manual ke kiriman. */
  const addPelanggan = useCallback(
    async (id: number, pelangganIds: number[]): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.post(`/kiriman/${id}/pelanggan`, {
          pelanggan_ids: pelangganIds,
        });
        return { success: true, data: response.data };
      } catch (err) {
        return handleApiError(err, "Gagal menambahkan pelanggan.");
      }
    },
    [],
  );

  /** Buang satu pelanggan dari daftar (tombol X). */
  const removeDetail = useCallback(
    async (id: number, detailId: number): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.delete(`/kiriman/${id}/detail/${detailId}`);
        return { success: true, data: response.data };
      } catch (err) {
        return handleApiError(err, "Gagal menghapus pelanggan dari kiriman.");
      }
    },
    [],
  );

  /** Simpan urutan kunjungan hasil drag-drop (urutan lengkap). */
  const setUrutan = useCallback(
    async (id: number, detailIds: number[]): Promise<{ success: boolean; message?: string; data?: Kiriman }> => {
      try {
        const response = await api.post(`/kiriman/${id}/urutan`, {
          detail_ids: detailIds,
        });
        return { success: true, data: response.data };
      } catch (err) {
        return handleApiError(err, "Gagal menyimpan urutan.");
      }
    },
    [],
  );

  return {
    kirimans,
    loading,
    error,
    pagination,
    fetchKirimans,
    getKiriman,
    createKiriman,
    updateKiriman,
    deleteKiriman,
    addRute,
    addPelanggan,
    removeDetail,
    setUrutan,
    setPagination,
  };
};
