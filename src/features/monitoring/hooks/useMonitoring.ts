import { useState, useCallback } from 'react';
import api from '@/services/api';
import { isAxiosError } from 'axios';
import { MonitoringEmployee, VisitPoint } from '../types';

export const useMonitoring = () => {
    const [loading, setLoading] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recapData, setRecapData] = useState<MonitoringEmployee[]>([]);
    const [selectedEmployeePoints, setSelectedEmployeePoints] = useState<VisitPoint[]>([]);
    const [allPoints, setAllPoints] = useState<VisitPoint[]>([]);

    const fetchDailyRecap = useCallback(async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/monitoring/daily`, { params: { date } });
            setRecapData(response.data);
        } catch (err: unknown) {
            let errorMessage = 'Gagal memuat data monitoring';
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAllPoints = useCallback(async (date: string) => {
        try {
            const response = await api.get(`/monitoring/map`, { params: { date } });
            setAllPoints(response.data);
        } catch (err: unknown) {
            console.error("Failed to fetch map points", err);
        }
    }, []);

    const fetchEmployeeDetails = useCallback(async (employeeId: number, date: string) => {
        setDetailsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/monitoring/employee/${employeeId}`, { params: { date } });
            setSelectedEmployeePoints(response.data);
        } catch (err: unknown) {
            let errorMessage = 'Gagal memuat detail kunjungan';
            if (isAxiosError(err) && err.response?.data?.message) {
                errorMessage = err.response.data.message;
            }
            setError(errorMessage);
        } finally {
            setDetailsLoading(false);
        }
    }, []);

    return {
        loading,
        detailsLoading,
        error,
        recapData,
        selectedEmployeePoints,
        allPoints,
        fetchDailyRecap,
        fetchEmployeeDetails,
        fetchAllPoints
    };
};
