import { useState, useCallback } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";
import { InformasiKunjungan } from "../types/InformasiKunjungan";

interface UseInformasiKunjunganReturn {
  data: InformasiKunjungan[];
  loading: boolean;
  pagination: {
    currentPage: number;
    lastPage: number;
    total: number;
    perPage: number;
  };
  fetchData: (params: {
    start_date?: string;
    end_date?: string;
    page: number;
    per_page: number;
  }) => Promise<void>;
}

export const useInformasiKunjungan = (): UseInformasiKunjunganReturn => {
  const [data, setData] = useState<InformasiKunjungan[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const fetchData = useCallback(
    async (params: {
      start_date?: string;
      end_date?: string;
      page: number;
      per_page: number;
    }) => {
      setLoading(true);
      try {
        const response = await api.get("/monitoring/informasi-kunjungan", {
          params,
        });
        const resData = response.data;
        setData(resData.data);
        setPagination({
          currentPage: resData.current_page,
          lastPage: resData.last_page,
          total: resData.total,
          perPage: resData.per_page,
        });
      } catch {
        toast.error("Gagal mengambil data informasi kunjungan");
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    data,
    loading,
    pagination,
    fetchData,
  };
};
