import React, { useEffect, useState } from "react";
import { Tag, Plus, Users, Package, Gift, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { usePromo } from "@/features/promo/hooks/usePromo";
import { ClusterList } from "@/features/promo/components/ClusterList";
import { PriceRuleList } from "@/features/promo/components/PriceRuleList";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { ClusterForm } from "@/features/promo/components/ClusterForm";
import { PriceRuleForm } from "@/features/promo/components/PriceRuleForm";
import { PromoCluster, PromoAturanHarga } from "@/features/promo/types";

const PromoPage: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<"dashboard" | "clusters" | "prices" | "rewards">("dashboard");

  // Modal States
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<PromoCluster | undefined>(undefined);
  
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPriceRule, setSelectedPriceRule] = useState<PromoAturanHarga | undefined>(undefined);
  
  const [deletingClusterId, setDeletingClusterId] = useState<number | null>(null);
  const [deletingPriceRuleId, setDeletingPriceRuleId] = useState<number | null>(null);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  // Tab change handlers
  const handleTabChange = (tab: "dashboard" | "clusters" | "prices" | "rewards") => {
    setActiveTab(tab);
    if (tab === "clusters") fetchClusters();
    if (tab === "prices") fetchPriceRules();
    if (tab === "rewards") fetchRewardRules();
  };

  // Cluster Handlers
  const handleOpenClusterModal = (cluster?: PromoCluster) => {
    setSelectedCluster(cluster);
    setIsClusterModalOpen(true);
  };

  const handleClusterSubmit = async (data: Record<string, unknown>) => {
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

  const confirmDeleteCluster = async () => {
    if (deletingClusterId) {
      const res = await deleteCluster(deletingClusterId);
      if (res.success) {
        toast.success("Cluster berhasil dihapus");
        setDeletingClusterId(null);
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

  const handlePriceSubmit = async (data: Record<string, unknown>) => {
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

  const confirmDeletePriceRule = async () => {
    if (deletingPriceRuleId) {
      const res = await deletePriceRule(deletingPriceRuleId);
      if (res.success) {
        toast.success("Promo berhasil dihentikan");
        setDeletingPriceRuleId(null);
      } else {
        toast.error(res.message || "Gagal menghentikan promo");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Pattern from JadwalPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manajemen Promo
            </h1>
            <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
              Pusat kendali harga, cluster, dan program promosi toko.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === "clusters" && (
            <Button onClick={() => handleOpenClusterModal()} className="gap-2 shadow-md h-10 px-5">
              <Plus className="h-4 w-4" /> Tambah Cluster
            </Button>
          )}
          {activeTab === "prices" && (
            <Button onClick={() => handleOpenPriceModal()} className="gap-2 shadow-md h-10 px-5">
              <Plus className="h-4 w-4" /> Buat Aturan Harga
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Pattern from JadwalPage */}
      <div className="flex p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
        {[
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "clusters", label: "Promo Clusters", icon: Users },
          { id: "prices", label: "Harga & Diskon", icon: Package },
          { id: "rewards", label: "Bonus & Hadiah", icon: Gift },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as "dashboard" | "clusters" | "prices" | "rewards")}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-xs font-black uppercase tracking-widest transition-all rounded-lg",
              activeTab === tab.id
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Cluster</CardDescription>
                <CardTitle className="text-3xl font-bold">{clusters.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Grosir, VIP, & Special</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold uppercase tracking-wider">Promo Aktif</CardDescription>
                <CardTitle className="text-3xl font-bold text-primary">
                  {priceRules.length + rewardRules.length + grosirRules.length}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">Sedang Berjalan</p>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-2 border-dashed border-muted bg-muted/20 rounded-xl">
            <CardContent className="h-[200px] flex items-center justify-center">
              <div className="text-center opacity-30">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p className="text-sm font-bold uppercase tracking-widest">Statistik Promo (Segera Hadir)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "clusters" && (
        <div className="animate-in fade-in duration-300">
          <ClusterList 
            clusters={clusters} 
            loading={loading}
            onEdit={handleOpenClusterModal}
            onDelete={setDeletingClusterId}
            onViewCustomers={() => toast.success("Fitur Assignment segera hadir")}
          />
        </div>
      )}

      {activeTab === "prices" && (
        <div className="animate-in fade-in duration-300">
          <PriceRuleList 
            rules={priceRules} 
            loading={loading} 
            onEdit={handleOpenPriceModal}
            onDelete={setDeletingPriceRuleId}
            onGrosirToggle={() => fetchGrosirRules()}
          />
        </div>
      )}

      {activeTab === "rewards" && (
        <div className="animate-in fade-in duration-300 text-center p-20 bg-muted/20 rounded-2xl border-2 border-dashed border-muted">
           <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
           <p className="text-muted-foreground font-bold uppercase tracking-widest opacity-40">Fitur Hadiah & Tebus Murah Sedang Disiapkan</p>
        </div>
      )}

      {/* Cluster Modal */}
      <Modal
        isOpen={isClusterModalOpen}
        onClose={() => setIsClusterModalOpen(false)}
        title={selectedCluster ? "Edit Cluster" : "Tambah Cluster Promo"}
        size="md"
      >
        <ClusterForm 
          initialData={selectedCluster}
          onSubmit={handleClusterSubmit}
          onCancel={() => setIsClusterModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Price Rule Modal */}
      <Modal
        isOpen={isPriceModalOpen}
        onClose={() => setIsPriceModalOpen(false)}
        title={selectedPriceRule ? "Edit Aturan Harga" : "Buat Aturan Harga Baru"}
        size="md"
      >
        <PriceRuleForm 
          clusters={clusters}
          initialData={selectedPriceRule}
          onSubmit={handlePriceSubmit}
          onCancel={() => setIsPriceModalOpen(false)}
          loading={loading}
        />
      </Modal>

      {/* Delete Confirmation modals */}
      <ConfirmModal
        isOpen={!!deletingClusterId}
        onClose={() => setDeletingClusterId(null)}
        onConfirm={confirmDeleteCluster}
        title="Hapus Cluster"
        message="Apakah Anda yakin ingin menghapus cluster ini? Toko di dalamnya akan kehilangan status clusternya."
        type="danger"
      />

      <ConfirmModal
        isOpen={!!deletingPriceRuleId}
        onClose={() => setDeletingPriceRuleId(null)}
        onConfirm={confirmDeletePriceRule}
        title="Hentikan Promo"
        message="Apakah Anda yakin ingin menghentikan aturan harga promo ini?"
        type="danger"
      />
    </div>
  );
};

export default PromoPage;
