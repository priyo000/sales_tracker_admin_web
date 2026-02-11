import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Pelanggan, PelangganFormData } from '../types';
import { AxiosError } from 'axios';

export const usePelanggan = () => {
    const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPelanggans = useCallback(async (params?: { search?: string, status?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/pelanggan', { params });
            // Ideally ensure data is typed correctly or transformed
            setPelanggans(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || error.message || 'Failed to fetch customers');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = async (id: number, action: 'approve' | 'reject') => {
        setLoading(true);
        setError(null);
        try {
            await api.post(`/pelanggan/${id}/${action}`);
            // Optimistic update or refetch
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || `Gagal melakukan ${action} pelanggan.`;
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const createPelanggan = async (data: PelangganFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post('/pelanggan', data);
            return { success: true, data: response.data };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menambahkan pelanggan';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updatePelanggan = async (id: number, data: PelangganFormData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.put(`/pelanggan/${id}`, data);
            return { success: true, data: response.data };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal memperbarui pelanggan';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const importPelanggan = async (file: File) => {
        setLoading(true);
        setError(null);
        const formData = new FormData();
        formData.append('file', file);
        try {
            await api.post('/pelanggan/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchPelanggans();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal mengimport pelanggan';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        pelanggans,
        loading,
        error,
        fetchPelanggans,
        updateStatus,
        createPelanggan,
        updatePelanggan,
        importPelanggan
    };
};
