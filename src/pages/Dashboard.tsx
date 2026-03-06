import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
    Users, 
    ShoppingCart, 
    Package, 
    Map as MapIcon, 
    CheckCircle,
    Activity,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';


import toast from 'react-hot-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

interface SalesChartData {
    name: string;
    total: number;
}

interface BestSellingProduct {
    id: number;
    nama_produk: string;
    kode_barang: string;
    total_terjual: number;
}

interface TopSalesman {
    id: number;
    nama: string;
    total_penjualan: number;
    jumlah_pesanan: number;
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
    pesanan_bulan_ini: number;
    total_omset: number;
    total_pelanggan: number;
    total_produk: number;
    total_sales: number;
    total_rute: number;
    pelanggan_baru_bulan_ini: number;
    recent_orders: RecentOrder[];
    sales_chart?: SalesChartData[];
    best_selling_products?: BestSellingProduct[];
    top_salesman?: TopSalesman[];
    omset_mom?: {
        percentage: number;
        is_up: boolean;
    };
    pesanan_mom?: {
        percentage: number;
        is_up: boolean;
    };
    pelanggan_baru_mom?: {
        percentage: number;
        is_up: boolean;
    };
}

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
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
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
                        <CardTitle className="text-sm font-medium text-muted-foreground">Omset Bulan Ini</CardTitle>
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <DollarSign className="w-4 h-4 text-emerald-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1 truncate" title={formatCurrency(stats.total_omset)}>
                            {formatCurrency(stats.total_omset)}
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {stats.omset_mom && (
                                <Badge variant={stats.omset_mom.is_up ? "success" : "destructive"} className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded-sm shrink-0">
                                    {stats.omset_mom.is_up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                    {stats.omset_mom.percentage}%
                                </Badge>
                            )}
                            <p className="text-xs text-muted-foreground truncate">
                                Dibanding Bulan Lalu
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pesanan Bulan Ini</CardTitle>
                        <div className="p-2 bg-indigo-100 rounded-lg">
                            <ShoppingCart className="w-4 h-4 text-indigo-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{stats.pesanan_bulan_ini}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {stats.pesanan_mom && (
                                <Badge variant={stats.pesanan_mom.is_up ? "success" : "destructive"} className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded-sm shrink-0">
                                    {stats.pesanan_mom.is_up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                    {stats.pesanan_mom.percentage}%
                                </Badge>
                            )}
                            <p className="text-xs text-muted-foreground truncate">
                                Dibanding Bulan Lalu
                            </p>
                        </div>
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
                        <p className="text-xs text-muted-foreground">
                            Toko / Customer terdaftar
                        </p>
                    </CardContent>
                </Card>
                
                <Card className="bg-card hover:bg-muted/10 transition-colors">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Pelanggan Baru Bulan Ini</CardTitle>
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <Users className="w-4 h-4 text-orange-600" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold mb-1">{stats.pelanggan_baru_bulan_ini}</div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                            {stats.pelanggan_baru_mom && (
                                <Badge variant={stats.pelanggan_baru_mom.is_up ? "success" : "destructive"} className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded-sm shrink-0">
                                    {stats.pelanggan_baru_mom.is_up ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                                    {stats.pelanggan_baru_mom.percentage}%
                                </Badge>
                            )}
                            <p className="text-xs text-muted-foreground truncate">
                                Dibanding Bulan Lalu
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3 lg:gap-6">
                {/* Left Column Container */}
                <div className="col-span-1 lg:col-span-2 flex flex-col gap-4 lg:gap-6 order-2 lg:order-1">
                    {/* Chart Section */}
                    <Card className="shadow-sm flex flex-col h-[400px]">
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
                        <CardContent className="px-2 flex-grow min-h-[250px] pb-6">
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
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex justify-between items-center">
                                Pesanan Terbaru
                                <Badge variant="secondary" className="font-normal text-xs">{stats.recent_orders?.length || 0} recent</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 py-0 flex-1 relative min-h-[300px]">
                            <div className="absolute inset-0">
                                <ScrollArea className="h-full">
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
                                                        <div className="flex items-center gap-2 pr-2 min-w-0">
                                                            <span className="text-sm font-semibold truncate text-foreground">
                                                                {order.nama_toko || 'Toko tidak diketahui'}
                                                            </span>
                                                            <Badge variant={getStatusVariant(order.status)} className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider shrink-0">
                                                                {order.status}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                                                            {order.tanggal}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <span className="truncate">{order.no_pesanan}</span>
                                                        {order.total_tagihan !== undefined && order.total_tagihan > 0 ? (
                                                            <span className="font-semibold text-foreground">{formatCurrency(order.total_tagihan)}</span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
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
                                    <div className="p-3 bg-teal-100/50 rounded-full mb-3">
                                        <CheckCircle className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <span className="text-2xl font-bold">{stats.total_pesanan}</span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-widest mt-1 font-semibold text-center">Pesanan</span>
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
                    <Card>
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex justify-between items-center">
                                Produk Terlaris
                                <Select value={productFilter} onValueChange={setProductFilter}>
                                    <SelectTrigger className="h-7 w-[130px] pr-2 text-xs">
                                        <SelectValue placeholder="Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_time" className="text-xs">Semua Waktu</SelectItem>
                                        <SelectItem value="this_year" className="text-xs">Tahun Ini</SelectItem>
                                        <SelectItem value="this_month" className="text-xs">Bulan Ini</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 py-0">
                            <ScrollArea className="h-full max-h-[260px]">
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
                                                        {product.kode_barang}
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
                    
                    {/* Top Salesman List */}
                    <Card className="flex-1 flex flex-col">
                        <CardHeader className="pb-3 border-b">
                            <CardTitle className="text-base flex justify-between items-center">
                                Top Salesman
                                <Select value={salesmanFilter} onValueChange={setSalesmanFilter}>
                                    <SelectTrigger className="h-7 w-[130px] pr-2 text-xs">
                                        <SelectValue placeholder="Periode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all_time" className="text-xs">Semua Waktu</SelectItem>
                                        <SelectItem value="this_year" className="text-xs">Tahun Ini</SelectItem>
                                        <SelectItem value="this_month" className="text-xs">Bulan Ini</SelectItem>
                                    </SelectContent>
                                </Select>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-0 py-0 flex-1 relative min-h-[300px]">
                            <div className="absolute inset-0">
                                <ScrollArea className="h-full">
                                    {!stats.top_salesman || stats.top_salesman.length === 0 ? (
                                    <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                        Belum ada data sales.
                                    </div>
                                ) : (
                                    <div className="space-y-0">
                                        {stats.top_salesman.map((sales) => (
                                            <div key={sales.id} className="group flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors">
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                                    {sales.nama.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex flex-col flex-1 min-w-0 pr-2">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-semibold truncate text-foreground pr-2">
                                                            {sales.nama}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                        <Badge variant="secondary" className="px-1.5 py-0 h-4 text-[10px] mr-2 font-normal">
                                                            {sales.jumlah_pesanan} Transaksi
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-sm text-emerald-600">
                                                        {formatCurrency(sales.total_penjualan)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                </ScrollArea>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
