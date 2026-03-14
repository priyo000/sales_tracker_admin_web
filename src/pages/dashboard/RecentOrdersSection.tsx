import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { RecentOrder } from './types';

interface RecentOrdersSectionProps {
    orders: RecentOrder[];
    formatCurrency: (amount: number) => string;
    getStatusVariant: (status: string) => "default" | "success" | "warning" | "destructive";
}

const RecentOrdersSection: React.FC<RecentOrdersSectionProps> = ({
    orders,
    formatCurrency,
    getStatusVariant,
}) => {
    return (
        <Card className="flex-1 flex flex-col">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-base flex justify-between items-center">
                    Pesanan Terbaru
                    <Badge variant="secondary" className="font-normal text-xs">
                        {orders?.length || 0} recent
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0 flex-1 relative">
                <div className="absolute inset-0">
                    <ScrollArea className="h-full">
                        {orders.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                                Belum ada pesanan terbaru.
                            </div>
                        ) : (
                            <div className="space-y-0">
                                {orders.map((order) => (
                                    <div
                                        key={order.id}
                                        className="group flex items-start gap-4 p-4 border-b last:border-0 hover:bg-muted/40 transition-colors"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                            <ShoppingCart className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0 pr-2">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 pr-2 min-w-0">
                                                    <span className="text-sm font-semibold truncate text-foreground">
                                                        {order.nama_toko || 'Toko tidak diketahui'}
                                                    </span>
                                                    <Badge
                                                        variant={getStatusVariant(order.status)}
                                                        className="text-[9px] px-1.5 py-0 h-4 uppercase tracking-wider shrink-0"
                                                    >
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
                                                    <span className="font-semibold text-foreground">
                                                        {formatCurrency(order.total_tagihan)}
                                                    </span>
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
    );
};

export default RecentOrdersSection;
