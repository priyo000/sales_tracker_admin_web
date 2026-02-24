import { useState, useCallback } from 'react';
import api from '@/services/api';
import { Notifikasi, NotifikasiFormData } from '../types';
import { toast } from 'react-hot-toast';

export const useNotifikasi = () => {
    const [notifikasies, setNotifikasies] = useState<Notifikasi[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });

    const fetchNotifikasies = useCallback(async (page = 1, search = '') => {
        setIsLoading(true);
        try {
            const response = await api.get(`/admin/notifikasi?page=${page}&search=${search}`);
            setNotifikasies(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total,
            });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengambil data notifikasi');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const sendNotifikasi = async (data: NotifikasiFormData) => {
        setIsLoading(true);
        try {
            await api.post('/admin/notifikasi', data);
            toast.success('Notifikasi berhasil dikirim');
            fetchNotifikasies();
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal mengirim notifikasi');
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    const deleteNotifikasi = async (id: number) => {
        if (!confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;
        
        setIsLoading(true);
        try {
            await api.delete(`/admin/notifikasi/${id}`);
            toast.success('Notifikasi berhasil dihapus');
            fetchNotifikasies(pagination.current_page);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Gagal menghapus notifikasi');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        notifikasies,
        isLoading,
        pagination,
        fetchNotifikasies,
        sendNotifikasi,
        deleteNotifikasi,
    };
};
