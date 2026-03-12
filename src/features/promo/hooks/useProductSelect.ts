import { useState, useEffect, useCallback, useRef } from "react";
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

  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const fetchProduks = useCallback(async (reset: boolean = true) => {
    if (reset) {
      setLoading(true);
      setProduks([]);
      setPage(1);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await api.get("/produk", {
        params: {
          search: search || undefined,
          id_kategori: idKategori || undefined,
          page: reset ? 1 : page,
          per_page: initialPerPage,
        },
      });
      const data = response.data;
      
      if (data && data.data) {
        const newProduks = data.data;
        setProduks(prev => reset ? newProduks : [...prev, ...newProduks]);
        setPagination({
          page: data.current_page || 1,
          perPage: data.per_page || initialPerPage,
          total: data.total || 0,
          lastPage: data.last_page || 1,
        });
        setHasMore(data.current_page < data.last_page);
      } else if (Array.isArray(data)) {
        setProduks(reset ? data : [...produks, ...data]);
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, idKategori, page, initialPerPage]);

  useEffect(() => {
    fetchProduks(true);
  }, [search, idKategori]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleKategoriChange = useCallback((value: string) => {
    setIdKategori(value);
    setPage(1);
  }, []);

  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      setPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    if (!hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  useEffect(() => {
    if (page > 1) {
      fetchProduks(false);
    }
  }, [page]);

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
    loadMoreRef,
  };
};
