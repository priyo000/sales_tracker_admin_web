import { useState, useCallback } from "react";
import api from "../../../services/api";
import { PromoCluster, PromoAturanHarga, PromoGrosir, PromoHadiah } from "../types";
import { AxiosError } from "axios";

export const usePromo = () => {
  const [clusters, setClusters] = useState<PromoCluster[]>([]);
  const [priceRules, setPriceRules] = useState<PromoAturanHarga[]>([]);
  const [grosirRules, setGrosirRules] = useState<PromoGrosir[]>([]);
  const [rewardRules, setRewardRules] = useState<PromoHadiah[]>([]);
  
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

  const fetchPriceRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/promo/aturan-harga");
      setPriceRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data aturan harga");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchGrosirRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/promo/grosir");
      setGrosirRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data harga grosir");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRewardRules = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/promo/hadiah");
      setRewardRules(response.data.data);
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      setError(error.response?.data?.message || "Gagal mengambil data promo hadiah");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCluster = async (data: Partial<PromoCluster>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.post("/promo-cluster", data);
      await fetchClusters();
      return { success: true, data: response.data.data };
    } catch (err) {
      const error = err as AxiosError<{ message: string }>;
      const msg = error.response?.data?.message || "Gagal membuat cluster promo";
      setError(msg);
      return { success: false, message: msg };
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
  };
};
