import { useState, useCallback } from "react";
import api from "../../../services/api";
import { AxiosError } from "axios";
import { AvailablePromos } from "../types";

export const useAvailablePromos = () => {
  const [promos, setPromos] = useState<AvailablePromos | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromos = useCallback(async (idPelanggan: number) => {
    console.log('[useAvailablePromos] fetchPromos called, idPelanggan:', idPelanggan);
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/promo/available?id_pelanggan=${idPelanggan}`);
      // console.log('[useAvailablePromos] response:', response.data);
      setPromos(response.data);
      return response.data as AvailablePromos;
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      // console.error('[useAvailablePromos] error:', e.response?.status, e.response?.data);
      const msg = e.response?.data?.message || "Gagal memuat promo tersedia.";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { promos, loading, error, fetchPromos };
};
