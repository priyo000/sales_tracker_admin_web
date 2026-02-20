import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Divisi, DivisiFormData } from '../types';
import { AxiosError } from 'axios';

export const useDivisi = () => {
    const [divisis, setDivisis] = useState<Divisi[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDivisis = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/divisi');
            setDivisis(response.data.data);
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
        deleteDivisi
    };
};
