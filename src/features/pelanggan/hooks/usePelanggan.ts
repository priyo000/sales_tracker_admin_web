import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Pelanggan, PelangganFormData } from '../types';
import { AxiosError } from 'axios';

export const usePelanggan = () => {
    const [pelanggans, setPelanggans] = useState<Pelanggan[]>([]);
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
        perPage: 20
    });

    const fetchPelanggans = useCallback(async (params?: { 
        search?: string, 
        status?: string, 
        per_page?: number, 
        page?: number,
        id_sales?: number,
        id_karyawan?: number 
    }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/pelanggan', { params });
            if (response.data.data && Array.isArray(response.data.data)) {
                setPelanggans(response.data.data);
                if (response.data.current_page) {
                    setPagination({
                        currentPage: response.data.current_page,
                        lastPage: response.data.last_page,
                        total: response.data.total,
                        perPage: response.data.per_page
                    });
                }
            } else {
                setPelanggans(response.data); // Fallback for non-paginated -1
            }
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
            const response = await api.post('/pelanggan/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            await fetchPelanggans();
            return { success: true, data: response.data };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal mengimport pelanggan';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const fetchFilterOptions = useCallback(async (params?: { only_with_data?: boolean }) => {
        try {
            const response = await api.get('/pelanggan/filter-options', { params });
            return response.data.data;
        } catch (err) {
            console.error('Failed to fetch filter options', err);
            return [];
        }
    }, []);

    return {
        pelanggans,
        loading,
        error,
        fetchPelanggans,
        updateStatus,
        createPelanggan,
        updatePelanggan,
        importPelanggan,
        fetchFilterOptions,
        pagination
    };
};
