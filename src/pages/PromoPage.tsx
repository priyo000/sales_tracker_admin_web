import { 
  Tag, 
  Users, 
  Package, 
  Gift, 
  BarChart3, 
  Plus, 
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { usePromo } from "@/features/promo/hooks/usePromo";
import { ClusterList } from "@/features/promo/components/ClusterList";
import { PriceRuleList } from "@/features/promo/components/PriceRuleList";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { ClusterForm } from "@/features/promo/components/ClusterForm";
import { PriceRuleForm } from "@/features/promo/components/PriceRuleForm";
import { toast } from "react-hot-toast";
import { PromoCluster, PromoAturanHarga } from "@/features/promo/types";

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
    fetchRewardRules,
    createCluster,
    updateCluster,
    deleteCluster,
    createPriceRule,
    updatePriceRule,
    deletePriceRule
  } = usePromo();

  // Modal States
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<PromoCluster | undefined>(undefined);
  
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPriceRule, setSelectedPriceRule] = useState<PromoAturanHarga | undefined>(undefined);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  // Cluster Handlers
  const handleOpenClusterModal = (cluster?: PromoCluster) => {
    setSelectedCluster(cluster);
    setIsClusterModalOpen(true);
  };

  const handleClusterSubmit = async (data: any) => {
    const res = selectedCluster 
      ? await updateCluster(selectedCluster.id, data)
      : await createCluster(data);

    if (res.success) {
      toast.success(selectedCluster ? "Cluster berhasil diperbarui" : "Cluster baru berhasil dibuat");
      setIsClusterModalOpen(false);
    } else {
      toast.error(res.message || "Terjadi kesalahan");
    }
  };

  const handleDeleteCluster = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghapus cluster ini? Semua pelanggan di dalamnya akan kehilangan status clusternya.")) {
      const res = await deleteCluster(id);
      if (res.success) {
        toast.success("Cluster berhasil dihapus");
      } else {
        toast.error(res.message || "Gagal menghapus cluster");
      }
    }
  };

  // Price Rule Handlers
  const handleOpenPriceModal = (rule?: PromoAturanHarga) => {
    setSelectedPriceRule(rule);
    setIsPriceModalOpen(true);
  };

  const handlePriceSubmit = async (data: any) => {
    const res = selectedPriceRule
      ? await updatePriceRule(selectedPriceRule.id, data)
      : await createPriceRule(data);

    if (res.success) {
      toast.success(selectedPriceRule ? "Aturan harga berhasil diperbarui" : "Aturan harga baru aktif");
      setIsPriceModalOpen(false);
    } else {
      toast.error(res.message || "Terjadi kesalahan");
    }
  };

  const handleDeletePriceRule = async (id: number) => {
    if (confirm("Apakah Anda yakin ingin menghentikan promo ini?")) {
      const res = await deletePriceRule(id);
      if (res.success) {
        toast.success("Promo berhasil dihentikan");
      } else {
        toast.error(res.message || "Gagal menghentikan promo");
      }
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Manajemen Promo" 
        description="Pusat kendali harga, cluster, dan program promosi toko"
        icon={Tag}
      />

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-6">
          <TabsTrigger value="dashboard" className="gap-2 font-black italic uppercase tracking-tighter">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="clusters" className="gap-2 font-black italic uppercase tracking-tighter" onClick={() => fetchClusters()}>
            <Users className="h-4 w-4" /> Promo Clusters
          </TabsTrigger>
          <TabsTrigger value="prices" className="gap-2 font-black italic uppercase tracking-tighter" onClick={() => fetchPriceRules()}>
            <Package className="h-4 w-4" /> Harga & Diskon
          </TabsTrigger>
          <TabsTrigger value="rewards" className="gap-2 font-black italic uppercase tracking-tighter" onClick={() => fetchRewardRules()}>
            <Gift className="h-4 w-4" /> Bonus & Hadiah
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-linear-to-br from-white to-primary/5 border-primary/20 shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest text-primary italic">Total Cluster</CardDescription>
                <CardTitle className="text-3xl font-black italic">{clusters.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground font-black italic uppercase opacity-50">Grosir, VIP, & Special</p>
              </CardContent>
            </Card>
            <Card className="bg-linear-to-br from-white to-emerald-500/5 border-emerald-500/10 shadow-sm rounded-3xl overflow-hidden group hover:shadow-md transition-all">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-black uppercase tracking-widest italic">Promo Aktif</CardDescription>
                <CardTitle className="text-3xl font-black italic text-emerald-600">{priceRules.length + rewardRules.length + grosirRules.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[10px] text-muted-foreground font-black italic uppercase opacity-50">Sedang Berjalan</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-2 border-dashed border-muted bg-muted/20 rounded-3xl">
            <CardContent className="h-[300px] flex items-center justify-center">
              <div className="text-center opacity-30">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p className="text-sm font-black italic uppercase tracking-widest">Statistik Promo (Segera Hadir)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clusters" className="space-y-4 outline-none">
          <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-border/50">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                className="pl-11 pr-4 py-2.5 w-full bg-muted/30 border-transparent rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold italic placeholder:font-black placeholder:uppercase placeholder:opacity-30"
                placeholder="Cari Cluster..."
              />
            </div>
            <Button 
              onClick={() => handleOpenClusterModal()}
              className="gap-3 rounded-2xl bg-primary hover:bg-primary/90 font-black italic uppercase tracking-wider text-xs px-8 py-6 shadow-lg shadow-primary/20"
            >
              <Plus className="h-4 w-4" /> Tambah Cluster
            </Button>
          </div>
          
          <ClusterList 
            clusters={clusters} 
            loading={loading}
            onEdit={handleOpenClusterModal}
            onDelete={handleDeleteCluster}
            onViewCustomers={() => toast.success("Fitur Assignment segera hadir")}
          />
        </TabsContent>

        <TabsContent value="prices" className="space-y-4 outline-none">
          <div className="flex justify-between items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-border/50">
             <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl">
                <Button variant="ghost" className="gap-2 rounded-xl text-xs font-black italic uppercase tracking-tight py-2 h-9 px-4 bg-white shadow-sm">
                  <Package className="h-4 w-4" /> Aturan Harga
                </Button>
                <Button variant="ghost" className="gap-2 rounded-xl text-xs font-black italic uppercase tracking-tight py-2 h-9 px-4 opacity-50 hover:opacity-100" onClick={() => fetchGrosirRules()}>
                  <BarChart3 className="h-4 w-4" /> Grosir/Tiering
                </Button>
             </div>
             <Button 
              onClick={() => handleOpenPriceModal()}
              className="gap-3 rounded-2xl bg-primary hover:bg-primary/90 font-black italic uppercase tracking-wider text-xs px-8 py-6 shadow-lg shadow-primary/20"
             >
              <Plus className="h-4 w-4" /> Buat Aturan
            </Button>
          </div>

          <PriceRuleList 
            rules={priceRules} 
            loading={loading} 
            onEdit={handleOpenPriceModal}
            onDelete={handleDeletePriceRule}
          />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4 outline-none text-center p-24 bg-muted/10 rounded-[3rem] border-2 border-dashed border-muted/50">
           <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
           <p className="text-muted-foreground font-black italic uppercase tracking-widest opacity-40">Fitur Hadiah & Tebus Murah Sedang Disiapkan</p>
           <p className="text-[10px] text-muted-foreground mt-2 font-bold italic opacity-30 uppercase tracking-tight">Backend API sudah siap, sedang memoles antarmuka pengguna.</p>
        </TabsContent>
      </Tabs>

      {/* Cluster Modal */}
      <Dialog open={isClusterModalOpen} onOpenChange={setIsClusterModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              {selectedCluster ? "Edit Cluster" : "Cluster Baru"}
            </DialogTitle>
            <DialogDescription className="font-bold italic text-xs uppercase tracking-tight opacity-60">
              Kelompokkan pelanggan untuk mendapatkan harga atau penawaran khusus.
            </DialogDescription>
          </DialogHeader>
          
          <ClusterForm 
            initialData={selectedCluster}
            onSubmit={handleClusterSubmit}
            onCancel={() => setIsClusterModalOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>

      {/* Price Rule Modal */}
      <Dialog open={isPriceModalOpen} onOpenChange={setIsPriceModalOpen}>
        <DialogContent className="max-w-2xl rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              {selectedPriceRule ? "Edit Aturan Harga" : "Aturan Harga Baru"}
            </DialogTitle>
            <DialogDescription className="font-bold italic text-xs uppercase tracking-tight opacity-60">
              Setiap produk bisa memiliki harga berbeda berdasarkan cluster toko.
            </DialogDescription>
          </DialogHeader>
          
          <PriceRuleForm 
            clusters={clusters}
            initialData={selectedPriceRule}
            onSubmit={handlePriceSubmit}
            onCancel={() => setIsPriceModalOpen(false)}
            loading={loading}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PromoPage;
