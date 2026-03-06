import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, 
    ShoppingCart, 
    Package, 
    Map as MapIcon, 
    CheckCircle,
    Activity,
    Truck,
    DollarSign,
    Star
} from 'lucide-react';

import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface SalesChartData {
    name: string;
    total: number;
}

interface BestSellingProduct {
    id: number;
    nama_produk: string;
    kode_produk: string;
    total_terjual: number;
}

interface RecentOrder {
    id: number;
    no_pesanan: string;
    status: string;
    nama_toko: string;
    tanggal: string;
    total_tagihan?: number;
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
    sales_chart?: SalesChartData[];
    best_selling_products?: BestSellingProduct[];
}

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/admin/dashboard');
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
        return (
            <div className="flex items-center justify-center p-8 h-screen w-full">
                <div className="flex flex-col items-center justify-center space-y-4">
                    <Activity className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading Dashboard metrics...</p>
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
                            Failed to Load Data
                        </CardTitle>
                        <CardDescription>
                            Kami tidak dapat memuat data dashboard. Silakan coba beberapa saat lagi atau hubungi administrator.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

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
                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Omset</CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{formatCurrency(stats.total_omset)}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Total pendapatan diakumulasi
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pesanan Hari Ini</CardTitle>
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{stats.pesanan_hari_ini}</div>
                        <p className="text-xs text-muted-foreground">Dari total {stats.total_pesanan} pesanan</p>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Aktif</CardTitle>
                        <div className="p-2 bg-pink-100 rounded-lg">
                            <Users className="w-4 h-4 text-pink-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{stats.total_pelanggan}</div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Toko / Customer terdaftar
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Sales Tracking</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Truck className="w-4 h-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{stats.total_sales}</div>
                        <p className="text-xs text-muted-foreground">Total armada sales aktif</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-7">
                {/* Chart Section */}
                <Card className="col-span-1 lg:col-span-4 lg:row-span-2 shadow-sm order-2 lg:order-1 flex flex-col">
                    <CardHeader>
                        <CardTitle>Omset Tahunan</CardTitle>
                        <CardDescription>
                            Total omset penjualan SUKSES per bulan untuk tahun ini.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="px-2 flex-grow min-h-[300px]">
                        {stats.sales_chart && stats.sales_chart.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.sales_chart} margin={{ top: 10, right: 10, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 13 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: '#6b7280', fontSize: 13 }}
                                        tickFormatter={(value) => `Rp${value / 1000000}M`}
                                        width={80}
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        formatter={(value: any) => [formatCurrency(Number(value) || 0), "Omset"]}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                                    />
                                    <Bar 
                                        dataKey="total" 
                                        fill="hsl(var(--primary))" 
                                        radius={[4, 4, 0, 0]} 
                                        maxBarSize={50}
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

                {/* Data Master Stats */}
                <div className="col-span-1 lg:col-span-3 order-1 lg:order-2 flex flex-col gap-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Statistik Master</CardTitle>
                            <CardDescription>Ringkasan data inti operasional</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x border-t">
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-teal-100/50 rounded-full mb-3">
                                        <CheckCircle className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_pesanan}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Semua Pesanan</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-indigo-100/50 rounded-full mb-3">
                                        <Package className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_produk}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold">List Produk</span>
                                </div>
                                <div className="flex flex-col items-center justify-center p-6 bg-muted/10 hover:bg-muted/30 transition-colors">
                                    <div className="p-3 bg-rose-100/50 rounded-full mb-3">
                                        <MapIcon className="w-6 h-6 text-rose-500" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_rute}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Total Rute</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Best Selling Products */}
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex justify-between items-center">
                                Produk Terlaris
                                <Badge variant="outline" className="font-normal text-xs bg-amber-50 text-amber-600 border-amber-200">
                                    <Star className="w-3 h-3 mr-1 fill-amber-500 text-amber-500" />
                                    Top 5
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 py-0">
                            <ScrollArea className="h-full max-h-[220px]">
                                {!stats.best_selling_products || stats.best_selling_products.length === 0 ? (
                                    <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                                        Belum ada data penjualan produk.
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {stats.best_selling_products.map((product, index) => (
                                            <div key={product.id} className="group flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-muted-foreground text-xs">
                                                    #{index + 1}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                    <span className="text-sm font-semibold truncate text-foreground">
                                                        {product.nama_produk}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {product.kode_produk}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="font-bold text-sm">{product.total_terjual}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Terjual</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders List */}
                <Card className="col-span-1 lg:col-span-3 order-3">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-base flex justify-between items-center">
                            Pesanan Terbaru
                            <Badge variant="secondary" className="font-normal text-xs">{stats.recent_orders?.length || 0} recent</Badge>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 py-0">
                        <ScrollArea className="h-[250px] lg:h-[310px]">
                            {stats.recent_orders.length === 0 ? (
                                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                    Belum ada pesanan terbaru.
                                </div>
                            ) : (
                                <div className="space-y-0">
                                    {stats.recent_orders.map((order) => (
                                        <div key={order.id} className="group flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                                <ShoppingCart className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm font-semibold truncate text-foreground pr-2">
                                                        {order.nama_toko || 'Toko tidak diketahui'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                                        {order.tanggal}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                                                    <span className="truncate">{order.no_pesanan}</span>
                                                    {order.total_tagihan !== undefined && order.total_tagihan > 0 ? (
                                                        <span className="font-semibold text-foreground">{formatCurrency(order.total_tagihan)}</span>
                                                    ) : null}
                                                </div>
                                                <div className="flex">
                                                    <Badge variant={getStatusVariant(order.status)} className="text-[10px] px-2 py-0 h-4 uppercase tracking-wider">
                                                        {order.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
