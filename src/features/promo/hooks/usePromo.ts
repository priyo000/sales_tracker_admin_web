import { useState, useCallback } from "react";
import api from "../../../services/api";
import { AxiosError } from "axios";
import { PromoCluster, PromoCampaign } from "../types";

export const usePromo = () => {
  const [clusters, setClusters] = useState<PromoCluster[]>([]);
  const [priceRules, setPriceRules] = useState<PromoCampaign[]>([]);
  const [grosirRules, setGrosirRules] = useState<PromoCampaign[]>([]);
  const [rewardRules, setRewardRules] = useState<PromoCampaign[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClusters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/promo-cluster");
      setClusters(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data cluster");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPriceRules = useCallback(async (grouped = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/promo/aturan-harga?group=${grouped}`);
      setPriceRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data aturan harga");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGrosirRules = useCallback(async (grouped = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/promo/grosir?group=${grouped}`);
      setGrosirRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data harga grosir");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRewardRules = useCallback(async (grouped = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/promo/hadiah?group=${grouped}`);
      setRewardRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data promo hadiah");
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Cluster Operations ---
  const createCluster = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.post("/promo-cluster", data);
      await fetchClusters();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal membuat cluster" };
    } finally {
      setLoading(false);
    }
  };

  const updateCluster = async (id: number, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.put(`/promo-cluster/${id}`, data);
      await fetchClusters();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal memperbarui cluster" };
    } finally {
      setLoading(false);
    }
  };

  const deleteCluster = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/promo-cluster/${id}`);
      await fetchClusters();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal menghapus cluster" };
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignedPelanggan = useCallback(async (clusterId: number) => {
    try {
      const response = await api.get(`/promo-cluster/${clusterId}/pelanggan`);
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal memuat pelanggan di cluster" };
    }
  }, []);

  const assignPelanggan = useCallback(async (clusterId: number, data: Record<string, unknown>) => {
    try {
      const response = await api.post(`/promo-cluster/${clusterId}/assign`, data);
      await fetchClusters();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal memasukkan pelanggan ke cluster" };
    }
  }, [fetchClusters]);

  const removePelangganAssignment = useCallback(async (clusterId: number, assignmentId: number) => {
    try {
      await api.delete(`/promo-cluster/${clusterId}/pelanggan/${assignmentId}`);
      await fetchClusters();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal mengeluarkan pelanggan dari cluster" };
    }
  }, [fetchClusters]);

  // --- Price Rule Operations ---
  const createPriceRule = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.post("/promo/aturan-harga", data);
      await fetchPriceRules();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal membuat aturan harga" };
    } finally {
      setLoading(false);
    }
  };

  const updatePriceRule = async (id: number, data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.put(`/promo/aturan-harga/${id}`, data);
      await fetchPriceRules();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal memperbarui aturan harga" };
    } finally {
      setLoading(false);
    }
  };

  const deletePriceRule = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/promo/aturan-harga/${id}`);
      await fetchPriceRules();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal menghapus aturan harga" };
    } finally {
      setLoading(false);
    }
  };

  // --- Grosir Operations ---
  const createGrosirRule = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.post("/promo/grosir", data);
      await fetchGrosirRules();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal membuat aturan grosir" };
    } finally {
      setLoading(false);
    }
  };

  const deleteGrosirRule = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/promo/grosir/${id}`);
      await fetchGrosirRules();
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal menghapus aturan grosir" };
    } finally {
      setLoading(false);
    }
  };

  // --- Hadiah Operations ---
  const createRewardRule = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const response = await api.post("/promo/hadiah", data);
      await fetchRewardRules();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal membuat promo hadiah" };
    } finally {
      setLoading(false);
    }
  };

  const deleteRewardRule = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/promo/hadiah/${id}`);
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal menghapus promo hadiah" };
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: number) => {
    setLoading(true);
    try {
      await api.delete(`/promo/campaign/${id}`);
      return { success: true };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      return { success: false, message: error.response?.data?.message || "Gagal menghapus campaign" };
    } finally {
      setLoading(false);
    }
  };

  return {
    clusters,
    priceRules,
    grosirRules,
    rewardRules,
    loading,
    error,
    fetchClusters,
    fetchPriceRules,
    fetchGrosirRules,
    fetchRewardRules,
    createCluster,
    updateCluster,
    deleteCluster,
    fetchAssignedPelanggan,
    assignPelanggan,
    removePelangganAssignment,
    createPriceRule,
    updatePriceRule,
    deletePriceRule,
    createGrosirRule,
    deleteGrosirRule,
    createRewardRule,
    deleteRewardRule,
    deleteCampaign,
  };
};
