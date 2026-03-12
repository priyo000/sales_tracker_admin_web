import React from "react";
import { 
  Users, 
  Package, 
  Tag, 
  Layers, 
  Gift 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PromoDashboardProps {
  clusters: unknown[];
  priceRules: unknown[];
  grosirRules: unknown[];
  rewardRules: unknown[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  iconBgColor: string;
  iconColor: string;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  iconBgColor,
  iconColor,
  description,
}) => {
  return (
    <Card className="bg-card hover:bg-muted/10 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground truncate">
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

const PromoDashboard: React.FC<PromoDashboardProps> = ({
  clusters,
  priceRules,
  grosirRules,
  rewardRules,
}) => {
  const totalPromo = priceRules.length + grosirRules.length + rewardRules.length;

  return (
    <div className="flex flex-col space-y-6 animate-in fade-in duration-500 w-full">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Total Cluster"
          value={clusters.length}
          icon={Users}
          iconBgColor="bg-pink-100"
          iconColor="text-pink-600"
          description="Kelompok pelanggan target"
        />
        <StatCard
          title="Promo Aktif"
          value={totalPromo}
          icon={Package}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          description="Semua jenis promo"
        />
        <StatCard
          title="Aturan Harga"
          value={priceRules.length}
          icon={Tag}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          description="Diskon dan harga khusus"
        />
        <StatCard
          title="Promo Grosir"
          value={grosirRules.length}
          icon={Layers}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          description="Harga berdasarkan kuantitas"
        />
        <StatCard
          title="Bonus & Hadiah"
          value={rewardRules.length}
          icon={Gift}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          description="Promo hadiah dan bonus"
        />
      </div>
    </div>
  );
};

export default PromoDashboard;
