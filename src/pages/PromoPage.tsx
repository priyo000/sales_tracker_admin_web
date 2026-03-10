import { 
  Tag, 
  Users, 
  Package, 
  Gift, 
  BarChart3, 
  Plus, 
  Search,
} from "lucide-react";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePromo } from "@/features/promo/hooks/usePromo";
import { ClusterList } from "@/features/promo/components/ClusterList";
import { PriceRuleList } from "@/features/promo/components/PriceRuleList";

const PromoPage = () => {
  const { 
    clusters, 
    priceRules, 
    grosirRules, 
    rewardRules, 
    loading, 
    fetchClusters, 
    fetchPriceRules, 
    fetchGrosirRules, 
    fetchRewardRules 
  } = usePromo();

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Manajemen Promo" 
        description="Pusat kendali harga, cluster, dan program promosi toko"
        icon={Tag}
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="dashboard" className="gap-2">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="clusters" className="gap-2" onClick={() => fetchClusters()}>
            <Users className="h-4 w-4" /> Promo Clusters
          </TabsTrigger>
          <TabsTrigger value="prices" className="gap-2" onClick={() => fetchPriceRules()}>
            <Package className="h-4 w-4" /> Harga & Diskon
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2" onClick={() => fetchRewardRules()}>
            <Gift className="h-4 w-4" /> Bonus & Hadiah
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-linear-to-br from-white to-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary italic">Total Cluster</CardDescription>
                <CardTitle className="text-3xl font-black">{clusters.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-bold italic opacity-70">Grosir, VIP, & Special</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest italic">Promo Aktif</CardDescription>
                <CardTitle className="text-3xl font-black">{priceRules.length + rewardRules.length + grosirRules.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground font-bold italic opacity-70">Sedang Berjalan</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-2 border-dashed border-muted bg-muted/20">
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground font-black italic uppercase opacity-40">Statistik Promo (Segera Hadir)</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4 outline-none">
          <div className="flex justify-between items-center">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="pl-9 pr-4 py-2 w-full bg-white border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold italic placeholder:font-black placeholder:uppercase"
                placeholder="Cari Cluster..."
              />
            </div>
            <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 font-black italic uppercase tracking-wider text-xs px-6">
              <Plus className="h-4 w-4" /> Tambah Cluster
            </Button>
          </div>
          
          <ClusterList 
            clusters={clusters} 
            loading={loading}
            onEdit={() => {}}
            onDelete={() => {}}
            onViewCustomers={() => {}}
          />
        </TabsContent>

        <TabsContent value="prices" className="space-y-4 outline-none">
          <div className="flex justify-between items-center">
             <div className="flex gap-2">
                <Button variant="outline" className="gap-2 rounded-xl text-xs font-black italic uppercase">
                  <Package className="h-4 w-4" /> Aturan Harga
                </Button>
                <Button variant="ghost" className="gap-2 rounded-xl text-xs font-black italic uppercase opacity-50" onClick={() => fetchGrosirRules()}>
                  <BarChart3 className="h-4 w-4" /> Grosir/Tiering
                </Button>
             </div>
             <Button className="gap-2 rounded-xl font-black italic uppercase tracking-wider text-xs px-6">
              <Plus className="h-4 w-4" /> Buat Aturan
            </Button>
          </div>

          <PriceRuleList rules={priceRules} loading={loading} />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 outline-none text-center p-12 bg-muted/30 rounded-3xl border-2 border-dashed border-muted">
           <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
           <p className="text-muted-foreground font-black italic uppercase opacity-40">Fitur Hadiah & Tebus Murah Sedang Disiapkan</p>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromoPage;
