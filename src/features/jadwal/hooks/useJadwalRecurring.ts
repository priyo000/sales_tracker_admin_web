import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { JadwalRecurring, RecurringBulkData, KaryawanGroupRute, WeekContext } from '../types';
import { AxiosError } from 'axios';

export const useJadwalRecurring = () => {
    const [patterns, setPatterns] = useState<JadwalRecurring[]>([]);
    const [assignedGroups, setAssignedGroups] = useState<KaryawanGroupRute[]>([]);
    const [weekContext, setWeekContext] = useState<WeekContext | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPatterns = useCallback(async (id_karyawan?: number) => {
        setLoading(true);
        setError(null);
        try {
            const params = id_karyawan ? { id_karyawan } : {};
            const response = await api.get('/jadwal-recurring', { params });
            // The API now returns { patterns: [], groups: [] }
            setPatterns(response.data.patterns);
            setAssignedGroups(response.data.groups);
            return response.data;
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || error.message || 'Gagal memuat master jadwal.');
            return { patterns: [], groups: [] };
        } finally {
            setLoading(false);
        }
    }, []);

    const updatePatterns = async (data: RecurringBulkData) => {
        // Don't set global loading here to avoid table flicker
        setError(null);
        try {
            await api.post('/jadwal-recurring/bulk', data);
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal memperbarui master jadwal.';
            return { success: false, message: msg };
        } 
    };

    /** Minggu berjalan + slot pola aktif, supaya admin tak perlu menebak. */
    const fetchWeekContext = useCallback(async (tanggal?: string) => {
        try {
            const response = await api.get('/jadwal-recurring/week-context', {
                params: tanggal ? { tanggal } : {},
            });
            setWeekContext(response.data.data);
            return response.data.data as WeekContext;
        } catch {
            // Non-kritis: grid tetap dapat dipakai tanpa indikator ini.
            setWeekContext(null);
            return null;
        }
    }, []);

    /**
     * Generate ulang jadwal harian sekarang. Tanpa ini, perubahan master jadwal
     * baru terlihat setelah cron tengah malam.
     */
    const regenerate = async (id_karyawan?: number) => {
        setRegenerating(true);
        try {
            const response = await api.post('/jadwal-recurring/regenerate',
                id_karyawan ? { id_karyawan } : {});
            return { success: true, message: response.data.message as string };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return {
                success: false,
                message: error.response?.data?.message || 'Gagal men-generate jadwal.',
            };
        } finally {
            setRegenerating(false);
        }
    };

    const setGroup = async (id_karyawan: number, minggu_ke: number, id_group_rute: number | null) => {
        try {
            await api.post('/jadwal-recurring/set-group', {
                id_karyawan,
                minggu_ke,
                id_group_rute
            });
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal mengatur template grup' };
        }
    };

    const importMasterJadwal = async (file: File) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await api.post('/jadwal-recurring/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchPatterns();
            return { success: true, data: response.data };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal mengimpor master jadwal.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        patterns,
        assignedGroups,
        weekContext,
        regenerating,
        loading,
        error,
        fetchPatterns,
        fetchWeekContext,
        updatePatterns,
        setGroup,
        regenerate,
        importMasterJadwal,
        setAssignedGroups // Expose for optimistic updates
    };
};
