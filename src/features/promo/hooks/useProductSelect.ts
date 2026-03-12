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

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

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
        setPagination({
          page: data.current_page || 1,
          perPage: data.per_page || initialPerPage,
          total: data.total || 0,
          lastPage: data.last_page || 1,
        });
        setHasMore((data.current_page || 1) < (data.last_page || 1));
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
    setPage(1);
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

  // IntersectionObserver for infinite scroll
  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loadingMore, loadMore]);

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
