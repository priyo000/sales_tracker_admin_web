import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Rute, RuteFormData } from '../types';
import { AxiosError } from 'axios';

export const useRute = () => {
    const [rutes, setRutes] = useState<Rute[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchRutes = useCallback(async (params?: { search?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/rute', { params });
            setRutes(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Gagal memuat data rute.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createRute = async (data: RuteFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/rute', data);
            await fetchRutes();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal membuat rute.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateRute = async (id: number, data: RuteFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.put(`/rute/${id}`, data);
            await fetchRutes();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal memperbarui rute.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteRute = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/rute/${id}`);
            await fetchRutes();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menghapus rute.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        rutes,
        loading,
        error,
        fetchRutes,
        createRute,
        updateRute,
        deleteRute
    };
};
