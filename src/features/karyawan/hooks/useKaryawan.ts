import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Karyawan, KaryawanFormData } from '../types';
import { AxiosError } from 'axios';

export const useKaryawan = () => {
    const [karyawans, setKaryawans] = useState<Karyawan[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [divisiOptions, setDivisiOptions] = useState<{ id: number, nama_divisi: string }[]>([]);

    const fetchDivisiOptions = useCallback(async () => {
        try {
            const response = await api.get('/divisi'); // Assuming this endpoint exists or should be created
            setDivisiOptions(response.data.data);
        } catch (err) {
            console.error('Failed to fetch divisions', err);
        }
    }, []);

    const fetchKaryawans = useCallback(async (params?: { search?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/karyawan', { params });
            setKaryawans(response.data.data);
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setError(error.response?.data?.message || error.message || 'Gagal memuat data karyawan.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createKaryawan = async (data: KaryawanFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/karyawan', data);
            await fetchKaryawans();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal menambah karyawan.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateKaryawan = async (id: number, data: KaryawanFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.put(`/karyawan/${id}`, data);
            await fetchKaryawans();
            return { success: true };
        } catch (err) {
             const error = err as AxiosError<{ message: string }>;
             const msg = error.response?.data?.message || 'Gagal memperbarui data karyawan.';
             setError(msg);
             return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteKaryawan = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/karyawan/${id}`);
            await fetchKaryawans();
            return { success: true };
        } catch (err) {
             const error = err as AxiosError<{ message: string }>;
             const msg = error.response?.data?.message || 'Gagal menghapus karyawan.';
             setError(msg);
             return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    const importKaryawan = async (file: File) => {
        setLoading(true);
        setError(null);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await api.post('/karyawan/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            await fetchKaryawans();
            return { success: true };
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            const msg = error.response?.data?.message || 'Gagal mengimport data karyawan.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        karyawans,
        divisiOptions,
        loading,
        error,
        fetchKaryawans,
        fetchDivisiOptions,
        createKaryawan,
        updateKaryawan,
        deleteKaryawan,
        importKaryawan
    };
};
