import { useState, useCallback } from "react";
import api from "../../../services/api";
import { Pesanan, UpdatePesananData } from "../types";
import { AxiosError } from "axios";

export const usePesanan = () => {
  const [pesanans, setPesanans] = useState<Pesanan[]>([]);
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

  const fetchPesanans = useCallback(
    async (params?: {
      search?: string;
      status?: string;
      start_date?: string;
      end_date?: string;
      id_divisi?: string;
      page?: number;
      per_page?: number;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/pesanan", { params });
        if (response.data.data && Array.isArray(response.data.data)) {
          setPesanans(response.data.data);
          if (response.data.current_page) {
            setPagination({
              currentPage: response.data.current_page,
              lastPage: response.data.last_page,
              total: response.data.total,
              perPage: response.data.per_page,
            });
          }
        } else {
          setPesanans(response.data);
        }
      } catch (err) {
        const error = err as AxiosError<{ message: string }>;
        setError(error.response?.data?.message || "Gagal memuat data pesanan.");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const getPesananDetail = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/pesanan/${id}`);
      return { success: true, data: response.data as Pesanan };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message || "Gagal memuat detail pesanan.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/pesanan/${id}/status`, { status });
      await fetchPesanans(); // Refresh list
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message ||
        `Gagal mengubah status menjadi ${status}.`;
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const updatePesanan = async (id: number, data: UpdatePesananData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`/pesanan/${id}`, data);
      await fetchPesanans(); // Refresh list
      return { success: true, data: response.data as Pesanan };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal mengubah pesanan.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  const exportPesanan = async (params: {
    start_date: string;
    end_date: string;
    status?: string;
    id_divisi?: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/pesanan/export", {
        params,
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Laporan_Pesanan_${params.start_date}_${params.end_date}.xlsx`,
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg =
        error.response?.data?.message || "Gagal mengeksport data pesanan.";
      setError(msg);
      return { success: false, message: msg };
    } finally {
      setLoading(false);
    }
  };

  return {
    pesanans,
    loading,
    error,
    fetchPesanans,
    getPesananDetail,
    updateStatus,
    updatePesanan,
    exportPesanan,
    pagination,
  };
};
