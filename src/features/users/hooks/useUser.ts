import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { User, UserFormData } from '../types';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';

export const useUser = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async (params?: { search?: string; peran?: string }) => {
        setLoading(true);
        try {
            const response = await api.get('/users', { params });
            setUsers(response.data.data);
            setError(null);
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || 'Gagal memuat data pengguna';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAvailableEmployees = useCallback(async () => {
        try {
            const response = await api.get('/available-employees');
            return response.data.data;
        } catch {
            toast.error('Gagal memuat data karyawan yang tersedia');
            return [];
        }
    }, []);

    const createUser = async (data: UserFormData) => {
        setLoading(true);
        try {
            const response = await api.post('/users', data);
            setUsers(prev => [response.data.data, ...prev]);
            toast.success('Pengguna berhasil dibuat');
            return { success: true, data: response.data.data };
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || 'Gagal membuat pengguna';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const updateUser = async (id: number, data: UserFormData) => {
        setLoading(true);
        try {
            const response = await api.put(`/users/${id}`, data);
            setUsers(prev => prev.map(u => u.id === id ? response.data.data : u));
            toast.success('Pengguna berhasil diperbarui');
            return { success: true, data: response.data.data };
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || 'Gagal memperbarui pengguna';
            toast.error(msg);
            return { success: false, error: msg };
        } finally {
            setLoading(false);
        }
    };

    const deleteUser = async (id: number) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini? Hapus pengguna tidak akan menghapus data karyawan.')) return;
        
        setLoading(true);
        try {
            await api.delete(`/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('Pengguna berhasil dihapus');
            return true;
        } catch (err) {
            const axiosError = err as AxiosError<{ message: string }>;
            const msg = axiosError.response?.data?.message || 'Gagal menghapus pengguna';
            toast.error(msg);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return {
        users,
        loading,
        error,
        fetchUsers,
        fetchAvailableEmployees,
        createUser,
        updateUser,
        deleteUser
    };
};
