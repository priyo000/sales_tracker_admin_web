import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Divisi, DivisiFormData } from '../types';
import { AxiosError } from 'axios';

export const useDivisi = () => {
    const [divisis, setDivisis] = useState<Divisi[]>([]);
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

    const fetchDivisis = useCallback(async (params?: { search?: string, page?: number, per_page?: number }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/divisi', { params });
            if (response.data.data && Array.isArray(response.data.data)) {
                setDivisis(response.data.data);
                if (response.data.current_page) {
                    setPagination({
                        currentPage: response.data.current_page,
                        lastPage: response.data.last_page,
                        total: response.data.total,
                        perPage: response.data.per_page,
                    });
                }
            } else {
                setDivisis(response.data.data || []);
            }
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || 'Gagal memuat data divisi.');
        } finally {
            setLoading(false);
        }
    }, []);

    const createDivisi = async (data: DivisiFormData) => {
        setLoading(true);
        try {
            await api.post('/divisi', data);
            await fetchDivisis();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal menambah divisi.' };
        } finally {
            setLoading(false);
        }
    };

    const updateDivisi = async (id: number, data: DivisiFormData) => {
        setLoading(true);
        try {
            await api.put(`/divisi/${id}`, data);
            await fetchDivisis();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal mengubah divisi.' };
        } finally {
            setLoading(false);
        }
    };

    const deleteDivisi = async (id: number) => {
        setLoading(true);
        try {
            await api.delete(`/divisi/${id}`);
            await fetchDivisis();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal menghapus divisi.' };
        } finally {
            setLoading(false);
        }
    };

    return {
        divisis,
        loading,
        error,
        fetchDivisis,
        createDivisi,
        updateDivisi,
        deleteDivisi,
        pagination
    };
};
