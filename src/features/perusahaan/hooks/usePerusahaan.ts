import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Perusahaan, PerusahaanFormData } from '../types';
import { AxiosError } from 'axios';

export const usePerusahaan = () => {
    const [perusahaans, setPerusahaans] = useState<Perusahaan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPerusahaans = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/perusahaan');
            setPerusahaans(response.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Gagal mengambil data perusahaan');
        } finally {
            setLoading(false);
        }
    }, []);

    const createPerusahaan = async (data: PerusahaanFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/perusahaan', data);
            return { success: true, data: response.data.data };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal menambahkan perusahaan' };
        } finally {
            setLoading(false);
        }
    };

    const updatePerusahaan = async (id: number, data: PerusahaanFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.put(`/perusahaan/${id}`, data);
            return { success: true, data: response.data.data };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal memperbarui perusahaan' };
        } finally {
            setLoading(false);
        }
    };

    const deletePerusahaan = async (id: number) => {
        setLoading(true);
        try {
            await api.delete(`/perusahaan/${id}`);
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal menghapus perusahaan' };
        } finally {
            setLoading(false);
        }
    };

    return {
        perusahaans,
        loading,
        error,
        fetchPerusahaans,
        createPerusahaan,
        updatePerusahaan,
        deletePerusahaan
    };
};
