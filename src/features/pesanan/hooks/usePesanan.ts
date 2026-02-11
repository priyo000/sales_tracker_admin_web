import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Pesanan } from '../types';
import { AxiosError } from 'axios';

export const usePesanan = () => {
    const [pesanans, setPesanans] = useState<Pesanan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPesanans = useCallback(async (params?: { search?: string, status?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/pesanan', { params });
            setPesanans(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Gagal memuat data pesanan.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getPesananDetail = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/pesanan/${id}`);
            return { success: true, data: response.data.data as Pesanan };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal memuat detail pesanan.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        setLoading(true);
        setError(null);
        try {
            await api.put(`/pesanan/${id}/status`, { status });
            await fetchPesanans(); // Refresh list
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || `Gagal mengubah status menjadi ${status}.`;
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        pesanans,
        loading,
        error,
        fetchPesanans,
        getPesananDetail,
        updateStatus
    };
};
