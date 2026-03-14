import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { TopSalesman } from './types';

interface TopSalesmanSectionProps {
    salesman: TopSalesman[];
    filter: string;
    onFilterChange: (value: string) => void;
    formatCurrency: (amount: number) => string;
}

const TopSalesmanSection: React.FC<TopSalesmanSectionProps> = ({
    salesman,
    filter,
    onFilterChange,
    formatCurrency,
}) => {
    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex justify-between items-center">
                    Top Salesman
                    <Select value={filter} onValueChange={onFilterChange}>
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
                        {!salesman || salesman.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                Belum ada data sales.
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {salesman.map((sales) => (
                                    <div
                                        key={sales.id}
                                        className="group flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                                    >
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
                                                <Badge
                                                    variant="secondary"
                                                    className="px-1.5 py-0 h-4 text-[10px] mr-2 font-normal"
                                                >
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
    );
};

export default TopSalesmanSection;
