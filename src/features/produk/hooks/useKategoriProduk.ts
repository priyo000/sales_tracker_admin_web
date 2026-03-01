import { useState, useCallback } from "react";
import api from "../../../services/api";
import { KategoriProduk } from "../types";
import { AxiosError } from "axios";

export const useKategoriProduk = () => {
  const [kategoris, setKategoris] = useState<KategoriProduk[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKategoris = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/kategori-produk");
      setKategoris(response.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal memuat kategori.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createKategori = async (data: {
    nama_kategori: string;
    deskripsi?: string;
  }) => {
    setLoading(true);
    try {
      await api.post("/kategori-produk", data);
      await fetchKategoris();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal menambah kategori.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateKategori = async (
    id: number,
    data: { nama_kategori: string; deskripsi?: string },
  ) => {
    setLoading(true);
    try {
      await api.put(`/kategori-produk/${id}`, data);
      await fetchKategoris();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal mengubah kategori.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const deleteKategori = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/kategori-produk/${id}`);
      await fetchKategoris();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal menghapus kategori.";
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    kategoris,
    loading,
    error,
    fetchKategoris,
    createKategori,
    updateKategori,
    deleteKategori,
  };
};
