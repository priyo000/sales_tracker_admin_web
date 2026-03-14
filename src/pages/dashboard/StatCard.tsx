import React from 'react';
import { type LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    iconBgClass: string;
    iconColorClass: string;
    description: string;
    mom?: {
        percentage: number;
        is_up: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    icon: Icon,
    iconBgClass,
    iconColorClass,
    description,
    mom,
}) => {
    return (
        <Card className="bg-card hover:bg-muted/10 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                <div className={`p-2 ${iconBgClass} rounded-lg`}>
                    <Icon className={`w-4 h-4 ${iconColorClass}`} />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold mb-1 truncate" title={String(value)}>
                    {value}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                    {mom && (
                        <Badge
                            variant={mom.is_up ? "success" : "destructive"}
                            className="text-[9px] px-1 py-0 h-4 flex items-center gap-0.5 rounded-sm shrink-0"
                        >
                            {mom.is_up ? (
                                <ArrowUpRight className="w-2.5 h-2.5" />
                            ) : (
                                <ArrowDownRight className="w-2.5 h-2.5" />
                            )}
                            {mom.percentage}%
                        </Badge>
                    )}
                    <p className="text-xs text-muted-foreground truncate">
                        {description}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
