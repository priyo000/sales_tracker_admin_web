import { useState, useCallback } from "react";
import api from "@/services/api";
import { ProspectSummary, ProspectDetail } from "../types/Prospect";

interface FetchParams {
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  per_page?: number;
}

export const useProspectTracking = () => {
  const [data, setData] = useState<ProspectSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 20,
  });

  const [details, setDetails] = useState<ProspectDetail[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const fetchProspects = useCallback(async (params: FetchParams = {}) => {
    setLoading(true);
    try {
      const response = await api.get("/monitoring/prospect-tracking", { params });
      setData(response.data.data);
      setPagination({
        currentPage: response.data.current_page,
        lastPage: response.data.last_page,
        total: response.data.total,
        perPage: response.data.per_page,
      });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProspectDetails = useCallback(async (id_karyawan: number, date: string) => {
    setLoadingDetails(true);
    try {
      const response = await api.get("/monitoring/prospect-details", {
        params: { id_karyawan, date }
      });
      setDetails(response.data);
    } catch {
      // silently fail
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  return {
    data,
    loading,
    pagination,
    fetchProspects,
    details,
    loadingDetails,
    fetchProspectDetails,
  };
};
