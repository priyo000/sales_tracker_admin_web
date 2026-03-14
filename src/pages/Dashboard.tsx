import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { formatCurrency } from '@/lib/utils';
import {
    Users,
    ShoppingCart,
    Package,
    Map as MapIcon,
    Activity,
    DollarSign,
} from 'lucide-react';

import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

import type { DashboardStats } from './dashboard/types';
import StatCard from './dashboard/StatCard';
import RecentOrdersSection from './dashboard/RecentOrdersSection';
import BestSellingSection from './dashboard/BestSellingSection';
import TopSalesmanSection from './dashboard/TopSalesmanSection';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [productFilter, setProductFilter] = useState('all_time');
    const [salesmanFilter, setSalesmanFilter] = useState('all_time');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard', {
                    params: {
                        product_filter: productFilter,
                        salesman_filter: salesmanFilter
                    }
                });
                setStats(response.data.data);
            } catch {
                toast.error("Gagal memuat data dashboard.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [productFilter, salesmanFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8 h-screen w-full">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Activity className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Memuat data dashboard...</p>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Card className="w-[400px]">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Gagal Memuat Data
                        </CardTitle>
                        <CardDescription>
                            Kami tidak dapat memuat data dashboard. Silakan coba beberapa saat lagi atau hubungi administrator.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const getStatusVariant = (status: string): "default" | "success" | "warning" | "destructive" => {
        switch (status?.toUpperCase()) {
            case 'SUKSES':
            case 'SELESAI':
            case 'DELIVERED':
                return 'success';
            case 'PENDING':
            case 'PROSES':
                return 'warning';
            case 'DIBATALKAN':
            case 'CANCELLED':
                return 'destructive';
            default:
                return 'default';
        }
    };

    return (
        <div className="flex flex-col space-y-6 animate-in fade-in duration-500 w-full p-4 md:p-6 pb-20">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Dashboard Overview</h2>
                    <p className="text-muted-foreground">Monitor performance and business activities here.</p>
                </div>
            </div>

            {/* Top Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Omset Bulan Ini"
                    value={formatCurrency(stats.total_omset)}
                    icon={DollarSign}
                    iconBgClass="bg-emerald-100"
                    iconColorClass="text-emerald-600"
                    description="Dibanding Bulan Lalu"
                    mom={stats.omset_mom}
                />
                <StatCard
                    title="Orderan Pending Bulan Ini"
                    value={formatCurrency(stats.orderan_pending_bulan_ini)}
                    icon={Activity}
                    iconBgClass="bg-amber-100"
                    iconColorClass="text-amber-600"
                    description="Estimasi omset dari pesanan tertunda"
                />
                <StatCard
                    title="Pesanan Bulan Ini"
                    value={stats.pesanan_bulan_ini}
                    icon={ShoppingCart}
                    iconBgClass="bg-indigo-100"
                    iconColorClass="text-indigo-600"
                    description="Dibanding Bulan Lalu"
                    mom={stats.pesanan_mom}
                />
                <StatCard
                    title="Pelanggan Baru Bulan Ini"
                    value={stats.pelanggan_baru_bulan_ini}
                    icon={Users}
                    iconBgClass="bg-orange-100"
                    iconColorClass="text-orange-600"
                    description="Dibanding Bulan Lalu"
                    mom={stats.pelanggan_baru_mom}
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                {/* Left Column Container */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 lg:gap-6 order-2 lg:order-1">
                    {/* Chart Section */}
                    <Card className="shadow-sm flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div>Omset Tahunan</div>
                                <div className="bg-muted px-2 py-1 rounded-md text-xs font-semibold text-muted-foreground">
                                    Tahun {new Date().getFullYear()}
                                </div>
                            </CardTitle>
                            <CardDescription>
                                Total omset penjualan SUKSES per bulan.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-2 grow min-h-108 pb-6">
                            {stats.sales_chart && stats.sales_chart.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.sales_chart} margin={{ top: 10, right: 10, left: 15, bottom: 5 }} barCategoryGap="25%">
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={{stroke: '#e5e7eb'}}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280', fontSize: 13 }}
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={{stroke: '#e5e7eb'}}
                                            tickLine={false}
                                            tick={{ fill: '#6b7280', fontSize: 13 }}
                                            tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}M`}
                                            width={65}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => [formatCurrency(Number(value) || 0), "Omset"]}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                                        />
                                        <Bar
                                            dataKey="total"
                                            fill="hsl(var(--primary))"
                                            radius={[4, 4, 0, 0]}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    Data grafik tidak tersedia
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Recent Orders List */}
                    <RecentOrdersSection
                        orders={stats.recent_orders}
                        formatCurrency={formatCurrency}
                        getStatusVariant={getStatusVariant}
                    />
                </div>

                {/* Right Column Container */}
                <div className="col-span-1 flex flex-col gap-4 lg:gap-6 order-1 lg:order-2">
                    {/* Data Master Stats */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Statistik Master</CardTitle>
                            <CardDescription>Ringkasan data inti operasional</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t">
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-pink-100/50 rounded-full mb-3">
                                        <Users className="w-6 h-6 text-pink-600" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_pelanggan}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold text-center truncate w-full px-1">Pelanggan</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-indigo-100/50 rounded-full mb-3">
                                        <Package className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_produk}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold text-center">Produk</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-rose-100/50 rounded-full mb-3">
                                        <MapIcon className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_rute}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold text-center">Rute</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Selling Products */}
                    <BestSellingSection
                        products={stats.best_selling_products || []}
                        filter={productFilter}
                        onFilterChange={setProductFilter}
                    />

                    {/* Top Salesman List */}
                    <TopSalesmanSection
                        salesman={stats.top_salesman || []}
                        filter={salesmanFilter}
                        onFilterChange={setSalesmanFilter}
                        formatCurrency={formatCurrency}
                    />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
