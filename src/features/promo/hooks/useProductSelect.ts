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
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState("");
  const [idKategori, setIdKategori] = useState<string>("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    perPage: initialPerPage,
    total: 0,
    lastPage: 1,
  });

  const fetchProduks = useCallback(async (isReset: boolean = true, pageNum: number = 1) => {
    if (isReset) {
      setLoading(true);
      setProduks([]);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const params: Record<string, unknown> = {
        page: pageNum,
        per_page: initialPerPage,
      };
      
      if (search) params.search = search;
      if (idKategori) params.id_kategori = idKategori;

      const response = await api.get("/produk", { params });
      const data = response.data;
      
      if (data && data.data) {
        const newProduks = data.data;
        if (isReset) {
          setProduks(newProduks);
        } else {
          setProduks(prev => [...prev, ...newProduks]);
        }
        const currentPage = data.current_page || 1;
        const lastPage = data.last_page || 1;
        setPagination({
          page: currentPage,
          perPage: data.per_page || initialPerPage,
          total: data.total || 0,
          lastPage: lastPage,
        });
        setHasMore(currentPage < lastPage);
      } else if (Array.isArray(data)) {
        setProduks(isReset ? data : [...produks, ...data]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, idKategori, initialPerPage]);

  // Initial load and when search/kategori changes
  useEffect(() => {
    setPage(1);
    fetchProduks(true, 1);
  }, [search, idKategori]);

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchProduks(false, page);
    }
  }, [page]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleKategoriChange = useCallback((value: string) => {
    setIdKategori(value);
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  const reset = useCallback(() => {
    setSearch("");
    setIdKategori("");
    setPage(1);
    setHasMore(true);
  }, []);

  return {
    produks,
    loading,
    loadingMore,
    search,
    idKategori,
    page,
    pagination,
    hasMore,
    setSearch: handleSearchChange,
    setIdKategori: handleKategoriChange,
    loadMore,
    fetchProduks,
    reset,
  };
};
