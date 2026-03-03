import { useState, useCallback } from "react";
import api from "@/services/api";
import { Notifikasi, NotifikasiFormData } from "../types";
import { toast } from "react-hot-toast";
import { AxiosError } from "axios";

export const useNotifikasi = () => {
  const [notifikasies, setNotifikasies] = useState<Notifikasi[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    per_page: 10,
  });

  const fetchNotifikasies = useCallback(
    async (page = 1, search = "", perPage = 10) => {
      setIsLoading(true);
      try {
        const response = await api.get(
          `/admin/notifikasi?page=${page}&search=${search}&per_page=${perPage}`,
        );
        setNotifikasies(response.data.data || response.data);
        setPagination({
          current_page: response.data.current_page || page,
          last_page: response.data.last_page || 1,
          total: response.data.total || 0,
          per_page: response.data.per_page || perPage,
        });
      } catch (error: unknown) {
        const axiosError = error as AxiosError<{ message: string }>;
        const message =
          axiosError.response?.data?.message ||
          "Gagal mengambil data notifikasi";
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  const sendNotifikasi = async (data: NotifikasiFormData) => {
    setIsLoading(true);
    try {
      await api.post("/admin/notifikasi", data);
      toast.success("Notifikasi berhasil dikirim");
      fetchNotifikasies();
      return true;
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Gagal mengirim notifikasi",
      );
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNotifikasi = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus notifikasi ini?")) return;

    setIsLoading(true);
    try {
      await api.delete(`/admin/notifikasi/${id}`);
      toast.success("Notifikasi berhasil dihapus");
      fetchNotifikasies(pagination.current_page);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message || "Gagal menghapus notifikasi",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return {
    notifikasies,
    isLoading,
    pagination,
    fetchNotifikasies,
    sendNotifikasi,
    deleteNotifikasi,
  };
};
