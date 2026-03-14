import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BestSellingProduct } from './types';

interface BestSellingSectionProps {
    products: BestSellingProduct[];
    filter: string;
    onFilterChange: (value: string) => void;
}

const BestSellingSection: React.FC<BestSellingSectionProps> = ({
    products,
    filter,
    onFilterChange,
}) => {
    return (
        <Card>
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex justify-between items-center">
                    Produk Terlaris
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
            <CardContent className="px-0 py-0">
                <ScrollArea className="h-full">
                    {!products || products.length === 0 ? (
                        <div className="flex h-[150px] items-center justify-center text-sm text-muted-foreground">
                            Belum ada data penjualan produk.
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {products.map((product, index) => (
                                <div
                                    key={product.id}
                                    className="group flex items-center gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                                >
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
                                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                                            Terjual
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default BestSellingSection;
