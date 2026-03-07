import { useState, useCallback } from "react";
import api from "@/services/api";
import toast from "react-hot-toast";

export interface KalenderKerjaWeek {
  minggu_ke: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
}

export interface KalenderKerja {
  id?: number;
  id_perusahaan?: number;
  tahun: number;
  bulan: number;
  minggu_ke: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
}

export function useKalenderKerja() {
  const [data, setData] = useState<KalenderKerja[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchKalender = useCallback(async (tahun: number) => {
    setLoading(true);
    try {
      const response = await api.get("/monitoring/kalender-kerja", {
        params: { tahun },
      });
      if (response.data.status === "success") {
        setData(response.data.data);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Gagal memuat data kalender kerja"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const saveMonth = useCallback(
    async (tahun: number, bulan: number, weeks: KalenderKerjaWeek[]) => {
      setSaving(bulan);
      try {
        const response = await api.post("/monitoring/kalender-kerja", {
          tahun,
          bulan,
          weeks,
        });
        if (response.data.status === "success") {
          toast.success(`Kalender bulan ${bulan} berhasil disimpan`);
          // optionally refetch or update local state
          fetchKalender(tahun);
        }
      } catch (error: unknown) {
        const err = error as { response?: { data?: { message?: string } } };
        toast.error(
          err.response?.data?.message || "Gagal menyimpan kalender kerja"
        );
      } finally {
        setSaving(null);
      }
    },
    [fetchKalender]
  );

  return {
    data,
    loading,
    saving,
    fetchKalender,
    saveMonth,
  };
}
