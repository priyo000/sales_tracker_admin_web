import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, 
    ShoppingCart, 
    Package, 
    Map as MapIcon, 
    TrendingUp, 
    Clock, 
    CheckCircle 
} from 'lucide-react';

import toast from 'react-hot-toast';

interface RecentOrder {
    id: number;
    no_pesanan: string;
    status: string;
    nama_toko: string;
    tanggal: string;
}

interface DashboardStats {
    total_pesanan: number;
    pesanan_hari_ini: number;
    total_omset: number;
    total_pelanggan: number;
    total_produk: number;
    total_sales: number;
    total_rute: number;
    recent_orders: RecentOrder[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/dashboard');
                setStats(response.data.data);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
                toast.error("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    }

    if (!stats) {
        return <div className="p-8 text-center text-red-500">Gagal memuat data dashboard.</div>;
    }

    const cards = [
        { title: 'Total Omset', value: `Rp ${stats.total_omset.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
        { title: 'Pesanan Hari Ini', value: stats.pesanan_hari_ini, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
        { title: 'Total Pelanggan', value: stats.total_pelanggan, icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
        { title: 'Total Sales', value: stats.total_sales, icon: Users, color: 'text-orange-600', bg: 'bg-orange-100' },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, index) => (
                    <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className={`shrink-0 rounded-md p-3 ${card.bg}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="truncate text-sm font-medium text-gray-500">{card.title}</dt>
                                        <dd className="text-lg font-medium text-gray-900">{card.value}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                {/* Secondary Stats */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <h3 className="mb-4 text-lg font-medium text-gray-900">Statistik Data Master</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3 rounded-lg border p-4">
                            <Package className="h-8 w-8 text-indigo-500" />
                            <div>
                                <p className="text-sm text-gray-500">Total Produk</p>
                                <p className="text-xl font-bold">{stats.total_produk}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3 rounded-lg border p-4">
                            <MapIcon className="h-8 w-8 text-pink-500" />
                            <div>
                                <p className="text-sm text-gray-500">Total Rute</p>
                                <p className="text-xl font-bold">{stats.total_rute}</p>
                            </div>
                        </div>
                         <div className="flex items-center space-x-3 rounded-lg border p-4">
                            <CheckCircle className="h-8 w-8 text-teal-500" />
                            <div>
                                <p className="text-sm text-gray-500">Total Pesanan</p>
                                <p className="text-xl font-bold">{stats.total_pesanan}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="rounded-lg bg-white shadow">
                    <div className="border-b border-gray-200 px-4 py-4 sm:px-6">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">Pesanan Terbaru</h3>
                    </div>
                    <ul className="divide-y divide-gray-200">
                        {stats.recent_orders.length === 0 ? (
                            <li className="px-4 py-4 text-center text-sm text-gray-500">Belum ada pesanan.</li>
                        ) : (
                            stats.recent_orders.map((order) => (
                                <li key={order.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                                    <div className="flex items-center justify-between">
                                        <div className="truncate text-sm font-medium text-indigo-600">
                                            {order.no_pesanan}
                                        </div>
                                        <div className="ml-2 flex shrink-0">
                                            <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex justify-between">
                                        <div className="sm:flex">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Users className="mr-1.5 h-4 w-4 shrink-0 text-gray-400" />
                                                <p>{order.nama_toko || 'Toko'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Clock className="mr-1.5 h-4 w-4 shrink-0 text-gray-400" />
                                            <p>{order.tanggal}</p>
                                        </div>
                                    </div>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
