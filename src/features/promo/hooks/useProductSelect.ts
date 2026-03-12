import { useState, useEffect, useCallback } from "react";
import api from "@/services/api";
import { Produk } from "@/features/produk/types";

interface UseProductSelectOptions {
  initialPerPage?: number;
}

interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export const useProductSelect = (options: UseProductSelectOptions = {}) => {
  const { initialPerPage = 30 } = options;
  
  const [produks, setProduks] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: initialPerPage,
    total: 0,
    lastPage: 1,
  });

  const fetchProduks = useCallback(async (searchTerm: string = "", pageNum: number = 1) => {
    setLoading(true);
    try {
      const response = await api.get("/produk", {
        params: {
          search: searchTerm,
          page: pageNum,
          per_page: initialPerPage,
        },
      });
      const data = response.data;
      
      if (data && data.data) {
        setProduks(data.data);
        setPagination({
          page: data.current_page || 1,
          perPage: data.per_page || initialPerPage,
          total: data.total || 0,
          lastPage: data.last_page || 1,
        });
      } else if (Array.isArray(data)) {
        setProduks(data);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  }, [initialPerPage]);

  useEffect(() => {
    fetchProduks(search, page);
  }, [search, page, fetchProduks]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.lastPage) {
      setPage(newPage);
    }
  }, [pagination.lastPage]);

  const reset = useCallback(() => {
    setSearch("");
    setPage(1);
  }, []);

  return {
    produks,
    loading,
    search,
    page,
    pagination,
    setSearch: handleSearchChange,
    setPage: handlePageChange,
    fetchProduks,
    reset,
  };
};
