import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import api from '../../../services/api';
import { GroupRuteMingguan } from '../types';

export const useGroupRute = () => {
    const [groups, setGroups] = useState<GroupRuteMingguan[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchGroups = useCallback(async () => {
        setLoading(true);
        try {
            const response = await api.get('/group-rute-mingguan');
            setGroups(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const createGroup = async (data: Partial<GroupRuteMingguan>) => {
        setLoading(true);
        try {
            await api.post('/group-rute-mingguan', data);
            fetchGroups();
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal membuat template' };
        } finally {
            setLoading(false);
        }
    };

    const updateGroup = async (id: number, data: Partial<GroupRuteMingguan>) => {
        setLoading(true);
        try {
            await api.put(`/group-rute-mingguan/${id}`, data);
            fetchGroups();
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal memperbarui template' };
        } finally {
            setLoading(false);
        }
    };

    const deleteGroup = async (id: number) => {
        setLoading(true);
        try {
            await api.delete(`/group-rute-mingguan/${id}`);
            fetchGroups();
            return { success: true };
        } catch (err: unknown) {
            const error = err as AxiosError<{ message: string }>;
            return { success: false, message: error.response?.data?.message || 'Gagal menghapus template' };
        } finally {
            setLoading(false);
        }
    };

    return { groups, loading, fetchGroups, createGroup, updateGroup, deleteGroup };
};
