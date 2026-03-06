import { useState, useCallback } from "react";
import api from "../../../services/api";
import { Rute, RuteFormData } from "../types";
import { AxiosError } from "axios";

export const useRute = () => {
  const [rutes, setRutes] = useState<Rute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pagination, setPagination] = useState<{
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  }>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const fetchRutes = useCallback(
    async (params?: { search?: string; id_divisi?: string | number; page?: number; per_page?: number }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/rute", { params });
        if (response.data.data && Array.isArray(response.data.data)) {
          setRutes(response.data.data);
          if (response.data.current_page) {
            setPagination({
              currentPage: response.data.current_page,
              lastPage: response.data.last_page,
              total: response.data.total,
              perPage: response.data.per_page,
            });
          }
        } else {
          setRutes(response.data.data || []);
        }
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        setError(error.response?.data?.message || "Gagal memuat data rute.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createRute = async (data: RuteFormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/rute", data);
      await fetchRutes();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal membuat rute.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateRute = async (id: number, data: RuteFormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/rute/${id}`, data);
      await fetchRutes();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal memperbarui rute.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const deleteRute = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/rute/${id}`);
      await fetchRutes();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal menghapus rute.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const importRute = async (file: File, id_divisi?: number) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    if (id_divisi) {
      formData.append("id_divisi", id_divisi.toString());
    }

    try {
      const response = await api.post("/rute/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchRutes();
      return { success: true, data: response.data };
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal mengimpor rute.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    rutes,
    loading,
    error,
    fetchRutes,
    createRute,
    updateRute,
    deleteRute,
    importRute,
    pagination,
  };
};
