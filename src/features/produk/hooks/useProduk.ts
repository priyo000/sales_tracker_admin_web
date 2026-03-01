import { useState, useCallback } from "react";
import api from "../../../services/api";
import { Produk } from "../types";
import { AxiosError } from "axios";

export const useProduk = () => {
  const [produks, setProduks] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduks = useCallback(
    async (params?: { search?: string; id_kategori?: string }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/produk", { params });
        setProduks(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch products",
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createProduk = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      await api.post("/produk", data);
      await fetchProduks();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal menambah produk.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateProduk = async (id: number, data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      // Ensure method spoofing is present if not already added by UI
      if (!data.has("_method")) {
        data.append("_method", "PUT");
      }
      await api.post(`/produk/${id}`, data);
      await fetchProduks();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal mengubah produk.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const deleteProduk = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`/produk/${id}`);
      await fetchProduks();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal menghapus produk.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };
  const importProduk = async (file: File) => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post("/produk/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchProduks();
      return { success: true, data: response.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string; error?: string }>;
      const errData = error.response?.data as
        | {
            message?: string;
            error?: string;
            errors?: Record<string, string[]>;
          }
        | undefined;

      let msg = "Gagal mengimport produk";
      if (error.response?.status === 413) {
        msg = "File terlalu besar (Server Limit).";
      } else if (typeof errData === "string") {
        msg = `Server HTTP Error ${error.response?.status}`;
      } else if (errData) {
        msg = errData.error || errData.message || msg;
        if (errData.errors) {
          const firstError = Object.values(errData.errors)[0] as string[];
          if (firstError && firstError.length > 0) {
            msg = `Validasi gagal: ${firstError[0]}`;
          }
        }
      } else if (error.message) {
        msg = error.message;
      }

      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    produks,
    loading,
    error,
    fetchProduks,
    createProduk,
    updateProduk,
    deleteProduk,
    importProduk,
  };
};
