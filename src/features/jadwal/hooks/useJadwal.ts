import { useState, useCallback } from 'react';
import api from '../../../services/api';
import { Jadwal, JadwalFormData, KaryawanOption, RuteOption } from '../types';

export const useJadwal = () => {
    const [jadwals, setJadwals] = useState<Jadwal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Options for Form
    const [karyawanOptions, setKaryawanOptions] = useState<KaryawanOption[]>([]);
    const [ruteOptions, setRuteOptions] = useState<RuteOption[]>([]);

    const fetchJadwals = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get('/jadwal-sales', { params: { date } });
            setJadwals(response.data.data);
        } catch (err: any) {
            setError(err.message || 'Gagal memuat jadwal.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchOptions = useCallback(async () => {
        try {
            const [karyawanRes, ruteRes] = await Promise.all([
                api.get('/karyawan', { params: { role: 'Sales' } }),
                api.get('/rute')
            ]);
            setKaryawanOptions(karyawanRes.data.data);
            setRuteOptions(ruteRes.data.data);
        } catch (err) {
            console.error("Failed fetching options", err);
        }
    }, []);

    const createJadwal = async (data: JadwalFormData) => {
        setLoading(true);
        setError(null);
        try {
            await api.post('/jadwal-sales', data);
            return { success: true };
        } catch (err: any) {
            const msg = err.response?.data?.message || 'Gagal membuat jadwal.';
            setError(msg);
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    };

    return {
        jadwals,
        loading,
        error,
        karyawanOptions,
        ruteOptions,
        fetchJadwals,
        fetchOptions,
        createJadwal
    };
};
