import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Produk } from '../types';
import { AxiosError } from 'axios';

export const useProduk = () => {
    const [produks, setProduks] = useState<Produk[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProduks = useCallback(async (params?: { search?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/produk', { params });
            setProduks(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || error.message || 'Failed to fetch products');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createProduk = async (data: FormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/produk', data);
            await fetchProduks();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menambah produk.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateProduk = async (id: number, data: FormData) => {
        setLoading(true);
        setError(null);
        try {
            // Ensure method spoofing is present if not already added by UI
            if (!data.has('_method')) {
                data.append('_method', 'PUT');
            }
            await api.post(`/produk/${id}`, data);
            await fetchProduks();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal mengubah produk.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteProduk = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/produk/${id}`);
            await fetchProduks();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menghapus produk.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        produks,
        loading,
        error,
        fetchProduks,
        createProduk,
        updateProduk,
        deleteProduk
    };
};
