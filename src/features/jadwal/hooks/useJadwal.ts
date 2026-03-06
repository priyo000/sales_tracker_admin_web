import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '../../../services/api';
import { Jadwal, JadwalFormData, KaryawanOption, RuteOption } from '../types';

export const useJadwal = () => {
    const [jadwals, setJadwals] = useState<Jadwal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [pagination, setPagination] = useState<{
        currentPage: number;
        lastPage: number;
        total: number;
        perPage: number;
    }>({
        currentPage: 1,
        lastPage: 1,
        total: 0,
        perPage: 20,
    });

    // Options for Form
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([]);
    const [ruteOptions, setRuteOptions] = useState<RuteOption[]>([]);

    const fetchJadwals = useCallback(async (params?: { date?: string, start_date?: string, end_date?: string, search?: string, page?: number, per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/jadwal-sales', { params });
            if (response.data.data && Array.isArray(response.data.data)) {
                setJadwals(response.data.data);
                if (response.data.current_page) {
                    setPagination({
                        currentPage: response.data.current_page,
                        lastPage: response.data.last_page,
                        total: response.data.total,
                        perPage: response.data.per_page,
                    });
                }
            } else {
                setJadwals(response.data.data || []);
            }
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.message || 'Gagal memuat jadwal.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOptions = useCallback(async () => {
        try {
            const [karyawanRes, ruteRes] = await Promise.all([
                api.get('/karyawan', { params: { has_user: true } }),
                api.get('/rute', { params: { all: true } })
            ]);
            setKaryawanOptions(karyawanRes.data.data);
            setRuteOptions(ruteRes.data.data);
        } catch (err) {
            console.error("Failed fetching options", err);
        }
    }, []);

    const createJadwal = async (data: JadwalFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/jadwal-sales', data);
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal membuat jadwal.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteJadwal = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/jadwal-sales/${id}`);
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menghapus jadwal.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateJadwal = async (id: number, data: JadwalFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.put(`/jadwal-sales/${id}`, data);
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal memperbarui jadwal.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        jadwals,
        loading,
        error,
        karyawanOptions,
        ruteOptions,
        fetchJadwals,
        fetchOptions,
        createJadwal,
        updateJadwal,
        deleteJadwal,
        pagination
    };
};
