import { useState, useCallback } from "react";
import api from "@/services/api";
import { handleApiError } from "@/lib/utils";

export interface Pagination {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
}

export type CrudResult<T = unknown> =
  | { success: true; message?: string; data?: T }
  | { success: false; message: string; data?: undefined };

interface UseCrudResourceOptions {
  resourceName: string;
  autoRefreshOnMutate?: boolean;
}

export function useCrudResource<T>(
  endpoint: string,
  options: UseCrudResourceOptions,
) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const { resourceName, autoRefreshOnMutate = true } = options;

  const fetchItems = useCallback(
    async (params?: Record<string, unknown>) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get(endpoint, { params });
        if (response.data.data && Array.isArray(response.data.data)) {
          setItems(response.data.data);
          if (response.data.current_page) {
            setPagination({
              currentPage: response.data.current_page,
              lastPage: response.data.last_page,
              total: response.data.total,
              perPage: response.data.per_page,
            });
          }
        } else {
          setItems(
            Array.isArray(response.data)
              ? response.data
              : response.data.data || [],
          );
        }
      } catch (err) {
        const result = handleApiError(
          err,
          `Gagal memuat data ${resourceName}.`,
        );
        setError(result.message);
      } finally {
        setLoading(false);
      }
    },
    [endpoint, resourceName],
  );

  const createItem = async (data: unknown): Promise<CrudResult> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post(endpoint, data);
      if (autoRefreshOnMutate) await fetchItems();
      return { success: true, data: response.data };
    } catch (err) {
      const result = handleApiError(
        err,
        `Gagal menambah ${resourceName}.`,
      );
      setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (
    id: number,
    data: unknown,
  ): Promise<CrudResult> => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.put(`${endpoint}/${id}`, data);
      if (autoRefreshOnMutate) await fetchItems();
      return { success: true, data: response.data };
    } catch (err) {
      const result = handleApiError(
        err,
        `Gagal memperbarui ${resourceName}.`,
      );
      setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (id: number): Promise<CrudResult> => {
    setLoading(true);
    setError(null);
    try {
      await api.delete(`${endpoint}/${id}`);
      if (autoRefreshOnMutate) await fetchItems();
      return { success: true };
    } catch (err) {
      const result = handleApiError(
        err,
        `Gagal menghapus ${resourceName}.`,
      );
      setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const importItems = async (file: File): Promise<CrudResult> => {
    setLoading(true);
    setError(null);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await api.post(`${endpoint}/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (autoRefreshOnMutate) await fetchItems();
      return { success: true, data: response.data };
    } catch (err) {
      const result = handleApiError(
        err,
        `Gagal mengimport data ${resourceName}.`,
      );
      setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  };

  return {
    items,
    setItems,
    loading,
    setLoading,
    error,
    setError,
    pagination,
    setPagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    importItems,
  };
}
