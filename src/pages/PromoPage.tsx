import React, { useEffect, useState } from "react";
import { Tag, Plus, Users, Package, Gift, BarChart3, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { usePromo } from "@/features/promo/hooks/usePromo";
import { ClusterTable } from "@/features/promo/components/ClusterTable";
import { PriceRuleTable } from "@/features/promo/components/PriceRuleTable";
import { GrosirTable } from "@/features/promo/components/GrosirTable";
import { HadiahTable } from "@/features/promo/components/HadiahTable";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { ClusterForm } from "@/features/promo/components/ClusterForm";
import { PriceRuleForm } from "@/features/promo/components/PriceRuleForm";
import { GrosirForm } from "@/features/promo/components/GrosirForm";
import { HadiahForm } from "@/features/promo/components/HadiahForm";
import { ClusterAssignmentModal } from "@/features/promo/components/ClusterAssignmentModal";
import { PromoCluster, PromoAturanHarga, PromoGrosir, PromoHadiah, PromoCampaign } from "@/features/promo/types";

type PromoTab = "dashboard" | "clusters" | "prices" | "rewards";

const PromoPage: React.FC = () => {
  const {
    clusters,
    priceRules,
    grosirRules,
    rewardRules,
    loading,
    error,
    fetchClusters,
    fetchPriceRules,
    fetchGrosirRules,
    fetchRewardRules,
    createCluster,
    updateCluster,
    deleteCluster,
    createPriceRule,
    updatePriceRule,
    createGrosirRule,
    createRewardRule,
    deleteCampaign
  } = usePromo();

  const [activeTab, setActiveTab] = useState<PromoTab>("dashboard");
  const [priceSubTab, setPriceSubTab] = useState<"standard" | "grosir">("standard");

  // Modal States
  const [isClusterModalOpen, setIsClusterModalOpen] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState<PromoCluster | undefined>(undefined);
  const [assignmentCluster, setAssignmentCluster] = useState<PromoCluster | null>(null);
  
  const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
  const [selectedPriceRule, setSelectedPriceRule] = useState<PromoAturanHarga | PromoCampaign | undefined>(undefined);
  
  const [isGrosirModalOpen, setIsGrosirModalOpen] = useState(false);
  const [selectedGrosirRule, setSelectedGrosirRule] = useState<PromoGrosir | PromoCampaign | undefined>(undefined);
  
  const [isHadiahModalOpen, setIsHadiahModalOpen] = useState(false);
  const [selectedHadiahRule, setSelectedHadiahRule] = useState<PromoHadiah | PromoCampaign | undefined>(undefined);
  
  const [deletingClusterId, setDeletingClusterId] = useState<number | null>(null);
  const [deletingPriceRuleId, setDeletingPriceRuleId] = useState<number | null>(null);
  const [deletingGrosirId, setDeletingGrosirId] = useState<number | null>(null);
  const [deletingHadiahId, setDeletingHadiahId] = useState<number | null>(null);

  useEffect(() => {
    fetchClusters();
  }, [fetchClusters]);

  // Tab change handlers
  const handleTabChange = (tab: PromoTab) => {
    setActiveTab(tab);
    if (tab === "clusters") fetchClusters();
    if (tab === "prices") {
        if (priceSubTab === "standard") fetchPriceRules(true);
        else fetchGrosirRules(true);
    }
    if (tab === "rewards") fetchRewardRules(true);
  };

  useEffect(() => {
    if (activeTab === "prices") {
        if (priceSubTab === "standard") fetchPriceRules(true);
        else fetchGrosirRules(true);
    }
    if (activeTab === "rewards") fetchRewardRules(true);
  }, [activeTab, priceSubTab, fetchPriceRules, fetchGrosirRules, fetchRewardRules]);

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Manajemen Promo</h1>
            <p className="text-sm text-muted-foreground mt-1">Kelola cluster, aturan harga, dan program promo toko.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">

          {activeTab === "clusters" && (
            <Button onClick={() => handleOpenClusterModal()} className="gap-2 shadow-sm h-9">
              <Plus className="h-4 w-4" /> Tambah Cluster
            </Button>
          )}
          {activeTab === "prices" && (
            priceSubTab === "standard" ? (
              <Button onClick={() => { setSelectedPriceRule(undefined); setIsPriceModalOpen(true); }} className="gap-2 shadow-sm h-9">
                <Plus className="h-4 w-4" /> Buat Aturan Harga
              </Button>
            ) : (
                <Button onClick={() => { setSelectedGrosirRule(undefined); setIsGrosirModalOpen(true); }} className="gap-2 shadow-sm h-9 bg-orange-600 hover:bg-orange-700">
                    <Layers className="h-4 w-4" /> Buat Harga Grosir
                </Button>
            )
          )}
          {activeTab === "rewards" && (
              <Button onClick={() => { setSelectedHadiahRule(undefined); setIsHadiahModalOpen(true); }} className="gap-2 shadow-sm h-9 bg-emerald-600 hover:bg-emerald-700">
                  <Gift className="h-4 w-4" /> Buat Promo Hadiah
              </Button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 border border-destructive/20 text-sm text-destructive font-medium">
          {error}
        </div>
      )}

      <div className="flex p-1 bg-muted/50 rounded-xl w-fit border border-border/50">
        {[
          { id: "dashboard", label: "Dashboard", icon: BarChart3 },
          { id: "clusters", label: "Promo Clusters", icon: Users },
          { id: "prices", label: "Harga & Grosir", icon: Package },
          { id: "rewards", label: "Bonus & Hadiah", icon: Gift },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id as PromoTab)}
            className={cn(
              "flex items-center gap-2 px-6 py-2 text-xs font-semibold transition-all rounded-lg",
              activeTab === tab.id
                ? "bg-primary text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted",
            )}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-300">
            <Card className="shadow-sm border-border/50">
               <CardHeader className="pb-2">
                 <CardDescription className="text-xs font-semibold uppercase tracking-wider">Total Cluster</CardDescription>
                 <CardTitle className="text-3xl font-bold">{clusters.length}</CardTitle>
               </CardHeader>
            </Card>
            <Card className="shadow-sm border-border/50">
               <CardHeader className="pb-2">
                 <CardDescription className="text-xs font-semibold uppercase tracking-wider">Promo Aktif</CardDescription>
                 <CardTitle className="text-3xl font-bold text-primary">{priceRules.length + grosirRules.length + rewardRules.length}</CardTitle>
               </CardHeader>
            </Card>
        </div>
      )}

      {(activeTab === "clusters" || activeTab === "prices" || activeTab === "rewards") && (
        <div className="animate-in fade-in duration-300">
            {activeTab === "clusters" && <ClusterTable clusters={clusters} loading={loading} onEdit={handleOpenClusterModal} onDelete={setDeletingClusterId} onViewCustomers={setAssignmentCluster} />}
            {activeTab === "prices" && (
                priceSubTab === "standard" ? (
                    <PriceRuleTable rules={priceRules} loading={loading} onDelete={setDeletingPriceRuleId} onGrosirToggle={() => { setPriceSubTab("grosir"); fetchGrosirRules(true); }} />
                ) : (
                    <GrosirTable rules={grosirRules} loading={loading} onDelete={setDeletingGrosirId} onPriceToggle={() => { setPriceSubTab("standard"); fetchPriceRules(true); }} />
                )
            )}
            {activeTab === "rewards" && <HadiahTable rules={rewardRules} loading={loading} onDelete={setDeletingHadiahId} />}
        </div>
      )}

      {/* MODALS */}
      <Modal isOpen={isClusterModalOpen} onClose={() => setIsClusterModalOpen(false)} title={selectedCluster ? "Edit Cluster" : "Tambah Cluster Promo"} size="md">
        <ClusterForm initialData={selectedCluster} onSubmit={handleClusterSubmit} onCancel={() => setIsClusterModalOpen(false)} loading={loading} />
      </Modal>

      {/* Forms */}
      <Modal isOpen={isPriceModalOpen} onClose={() => { setIsPriceModalOpen(false); setSelectedPriceRule(undefined); }} title={selectedPriceRule ? "Edit Aturan Harga" : "Buat Aturan Harga Baru"} size="5xl">
        <PriceRuleForm 
          clusters={clusters} 
          initialData={selectedPriceRule as PromoAturanHarga} 
          onSubmit={async (data: Record<string, unknown>) => {
            const res = selectedPriceRule ? await updatePriceRule(selectedPriceRule.id, data) : await createPriceRule(data);
            if (res.success) {
                setIsPriceModalOpen(false);
                fetchPriceRules(true);
            }
          }} 
          onCancel={() => { setIsPriceModalOpen(false); setSelectedPriceRule(undefined); }} 
          loading={loading} 
        />
      </Modal>

      <Modal isOpen={isGrosirModalOpen} onClose={() => { setIsGrosirModalOpen(false); setSelectedGrosirRule(undefined); }} title={selectedGrosirRule ? "Edit Grosir" : "Buat Harga Grosir Baru"} size="4xl">
        <GrosirForm 
          clusters={clusters} 
          initialData={selectedGrosirRule as PromoGrosir} 
          onSubmit={async (data: Record<string, unknown>) => {
            const res = await createGrosirRule(data);
            if (res.success) {
                setIsGrosirModalOpen(false);
                fetchGrosirRules(true);
            }
          }} 
          onCancel={() => { setIsGrosirModalOpen(false); setSelectedGrosirRule(undefined); }} 
          loading={loading} 
        />
      </Modal>

      <Modal isOpen={isHadiahModalOpen} onClose={() => { setIsHadiahModalOpen(false); setSelectedHadiahRule(undefined); }} title={selectedHadiahRule ? "Edit Hadiah" : "Buat Promo Hadiah Baru"} size="4xl">
        <HadiahForm 
          clusters={clusters} 
          initialData={selectedHadiahRule as PromoHadiah} 
          onSubmit={async (data: Record<string, unknown>) => {
            const res = await createRewardRule(data);
            if (res.success) {
                setIsHadiahModalOpen(false);
                fetchRewardRules(true);
            }
          }} 
          onCancel={() => { setIsHadiahModalOpen(false); setSelectedHadiahRule(undefined); }} 
          loading={loading} 
        />
      </Modal>

      <ClusterAssignmentModal cluster={assignmentCluster} isOpen={!!assignmentCluster} onClose={() => setAssignmentCluster(null)} />

      <ConfirmModal isOpen={!!deletingClusterId} onClose={() => setDeletingClusterId(null)} onConfirm={() => deleteCluster(deletingClusterId!).then(() => setDeletingClusterId(null))} title="Hapus Cluster" message="Apakah Anda yakin ingin menghapus cluster ini?" type="danger" />
      <ConfirmModal 
        isOpen={!!deletingPriceRuleId} 
        onClose={() => setDeletingPriceRuleId(null)} 
        onConfirm={async () => {
          const res = await deleteCampaign(deletingPriceRuleId!);
          if (res.success) {
            toast.success("Campaign berhasil dihapus");
            fetchPriceRules(true);
          }
          setDeletingPriceRuleId(null);
        }} 
        title="Hapus Campaign" 
        message="Menghapus campaign akan menghapus SEMUA aturan harga di dalamnya. Lanjutkan?" 
        type="danger" 
      />

      <ConfirmModal 
        isOpen={!!deletingGrosirId} 
        onClose={() => setDeletingGrosirId(null)} 
        onConfirm={async () => {
          const res = await deleteCampaign(deletingGrosirId!);
          if (res.success) {
            toast.success("Campaign grosir berhasil dihapus");
            fetchGrosirRules(true);
          }
          setDeletingGrosirId(null);
        }} 
        title="Hapus Campaign Grosir" 
        message="Menghapus campaign akan menghapus SEMUA aturan grosir di dalamnya. Lanjutkan?" 
        type="danger" 
      />

      <ConfirmModal 
        isOpen={!!deletingHadiahId} 
        onClose={() => setDeletingHadiahId(null)} 
        onConfirm={async () => {
          const res = await deleteCampaign(deletingHadiahId!);
          if (res.success) {
            toast.success("Campaign promo hadiah berhasil dihapus");
            fetchRewardRules(true);
          }
          setDeletingHadiahId(null);
        }} 
        title="Hapus Campaign Hadiah" 
        message="Menghapus campaign akan menghapus SEMUA promo hadiah di dalamnya. Lanjutkan?" 
        type="danger" 
      />
    </div>
  );
};

export default PromoPage;
