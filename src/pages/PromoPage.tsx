import React, { useEffect, useState } from "react";
import { Tag, Plus, Users, Package, Gift, BarChart3, Layers } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
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
    deletePriceRule,
    createGrosirRule,
    deleteGrosirRule,
    createRewardRule,
    deleteRewardRule,
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
  
  const [selectedCampaignView, setSelectedCampaignView] = useState<PromoCampaign | undefined>(undefined);
  
  const [deletingClusterId, setDeletingClusterId] = useState<number | null>(null);
  const [targetDeletePriceRule, setTargetDeletePriceRule] = useState<PromoCampaign | null>(null);
  const [targetDeleteGrosir, setTargetDeleteGrosir] = useState<PromoCampaign | null>(null);
  const [targetDeleteHadiah, setTargetDeleteHadiah] = useState<PromoCampaign | null>(null);

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
                    <PriceRuleTable rules={priceRules} loading={loading} onDelete={setTargetDeletePriceRule} onGrosirToggle={() => { setPriceSubTab("grosir"); fetchGrosirRules(true); }} onView={setSelectedCampaignView} />
                ) : (
                    <GrosirTable rules={grosirRules} loading={loading} onDelete={setTargetDeleteGrosir} onPriceToggle={() => { setPriceSubTab("standard"); fetchPriceRules(true); }} onView={setSelectedCampaignView} />
                )
            )}
            {activeTab === "rewards" && <HadiahTable rules={rewardRules} loading={loading} onDelete={setTargetDeleteHadiah} onView={setSelectedCampaignView} />}
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
        isOpen={!!targetDeletePriceRule} 
        onClose={() => setTargetDeletePriceRule(null)} 
        onConfirm={async () => {
          if (!targetDeletePriceRule) return;
          const res = targetDeletePriceRule.is_campaign 
             ? await deleteCampaign(targetDeletePriceRule.id!)
             : await deletePriceRule(targetDeletePriceRule.id);

          if (res.success) {
            toast.success("Aturan harga berhasil dihapus");
            fetchPriceRules(true);
          }
          setTargetDeletePriceRule(null);
        }} 
        title="Hapus Aturan Harga" 
        message={targetDeletePriceRule?.is_campaign ? "Menghapus campaign ini akan menghapus SEMUA aturan harga di dalamnya. Lanjutkan?" : "Menghapus aturan harga ini. Lanjutkan?"} 
        type="danger" 
      />

      <ConfirmModal 
        isOpen={!!targetDeleteGrosir} 
        onClose={() => setTargetDeleteGrosir(null)} 
        onConfirm={async () => {
          if (!targetDeleteGrosir) return;
          const res = targetDeleteGrosir.is_campaign 
             ? await deleteCampaign(targetDeleteGrosir.id!)
             : await deleteGrosirRule(targetDeleteGrosir.id);

          if (res.success) {
            toast.success("Kampanye grosir berhasil dihapus");
            fetchGrosirRules(true);
          }
          setTargetDeleteGrosir(null);
        }} 
        title="Hapus Grosir" 
        message={targetDeleteGrosir?.is_campaign ? "Menghapus campaign ini akan menghapus SEMUA aturan grosir di dalamnya. Lanjutkan?" : "Menghapus aturan grosir ini. Lanjutkan?"} 
        type="danger" 
      />

      <ConfirmModal 
        isOpen={!!targetDeleteHadiah} 
        onClose={() => setTargetDeleteHadiah(null)} 
        onConfirm={async () => {
          if (!targetDeleteHadiah) return;
          const res = targetDeleteHadiah.is_campaign 
             ? await deleteCampaign(targetDeleteHadiah.id!)
             : await deleteRewardRule(targetDeleteHadiah.id);

          if (res.success) {
            toast.success("Promo hadiah berhasil dihapus");
            fetchRewardRules(true);
          }
          setTargetDeleteHadiah(null);
        }} 
        title="Hapus Promo Hadiah" 
        message={targetDeleteHadiah?.is_campaign ? "Menghapus campaign ini akan menghapus SEMUA promo hadiah di dalamnya. Lanjutkan?" : "Menghapus hadiah ini. Lanjutkan?"} 
        type="danger" 
      />

      {/* Campaign Detail View Modal */}
      <Modal isOpen={!!selectedCampaignView} onClose={() => setSelectedCampaignView(undefined)} title="Detail Program Promo" size="5xl">
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-4 gap-4 bg-muted/30 p-4 rounded-xl">
               <div className="col-span-2">
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Nama Program</div>
                  <div className="font-bold text-lg">{selectedCampaignView?.nama_promo}</div>
               </div>
               <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Masa Berlaku</div>
                  <div className="font-bold text-sm">
                    {selectedCampaignView?.tanggal_mulai ? new Date(selectedCampaignView.tanggal_mulai).toLocaleDateString('id-ID') : '-'} s/d {selectedCampaignView?.tanggal_akhir ? new Date(selectedCampaignView.tanggal_akhir).toLocaleDateString('id-ID') : '-'}
                  </div>
               </div>
               <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-1">Jenis Program</div>
                  <div className="font-bold capitalize text-sm text-primary">{selectedCampaignView?.jenis_promo?.replace('_', ' ')}</div>
               </div>
            </div>
            
            <div className="font-bold flex items-center justify-between">
                <span>Daftar Item Produk / Syarat</span>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedCampaignView?.items?.length || 0} Data</Badge>
            </div>
            <div className="max-h-[400px] overflow-y-auto border rounded-xl bg-card">
                <table className="w-full text-sm text-left">
                   <thead className="bg-muted text-xs uppercase font-black text-muted-foreground sticky top-0 shadow-sm z-10">
                      <tr>
                         <th className="px-4 py-3 border-b">Pemicu / Target Produk</th>
                         <th className="px-4 py-3 border-b border-l bg-primary/5 text-primary w-[40%]">Detail / Benefit Promo</th>
                      </tr>
                   </thead>
                   <tbody>
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {selectedCampaignView?.items && selectedCampaignView.items.map((item: any) => (
                         <tr key={item.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 font-semibold text-xs leading-relaxed">
                               {item.produk ? item.produk.nama_produk : (item.pemicu ? item.pemicu.nama_produk : 'Global / Syarat Total Nota Khusus')}
                            </td>
                            <td className="px-4 py-3 border-l text-xs leading-relaxed">
                               {selectedCampaignView?.jenis_promo === 'aturan_harga' && (
                                   <div className="flex flex-col">
                                       {parseFloat(item.diskon_persen || "0") > 0 && <span className="font-bold text-emerald-600">Diskon {item.diskon_persen}%</span>}
                                       {parseFloat(item.harga_spesial || "0") > 0 && <span className="font-bold text-orange-600">Harga Khusus Rp{(parseFloat(item.harga_spesial)).toLocaleString('id-ID')}</span>}
                                   </div>
                               )}
                               {selectedCampaignView?.jenis_promo === 'grosir' && (
                                   <div className="flex flex-col">
                                      <span className="font-medium text-muted-foreground mb-1 border-b pb-1 inline-block w-fit">Min. <strong className="text-foreground">{item.min_qty} Pcs</strong></span>
                                      {parseFloat(item.diskon_persen || "0") > 0 && <span className="font-bold text-emerald-600">Diskon {item.diskon_persen}%</span>}
                                      {parseFloat(item.harga_spesial || "0") > 0 && <span className="font-bold text-orange-600">Harga Grosir Rp{(parseFloat(item.harga_spesial)).toLocaleString('id-ID')}</span>}
                                   </div>
                               )}
                               {selectedCampaignView?.jenis_promo === 'hadiah' && (
                                   <div className="flex flex-col gap-1">
                                      {parseFloat(item.min_amount_pemicu || "0") > 0 && <span className="bg-muted w-fit px-1.5 py-0.5 rounded text-[10px] font-bold">Min. Belanja: Rp{(parseFloat(item.min_amount_pemicu)).toLocaleString('id-ID')}</span>}
                                      {parseFloat(item.min_qty_pemicu || "0") > 0 && <span className="bg-muted w-fit px-1.5 py-0.5 rounded text-[10px] font-bold">Min. Qty: {item.min_qty_pemicu} Pcs</span>}
                                      <span className="font-bold text-primary mt-1 flex items-center gap-1.5">
                                          <Gift className="h-3.5 w-3.5" />
                                          {item.hadiah?.nama_produk || 'Item Spesial'} <span className="text-muted-foreground bg-primary/10 px-1.5 rounded-sm">x{item.qty_hadiah}</span>
                                      </span>
                                      <span className="text-[10px] font-bold mt-1 uppercase text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm w-fit">
                                         Tebusan: Rp{(parseFloat(item.harga_tebus || "0")).toLocaleString('id-ID')}
                                      </span>
                                   </div>
                               )}
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
               {(!selectedCampaignView?.items || selectedCampaignView?.items?.length === 0) && (
                   <div className="p-10 text-center text-muted-foreground text-xs font-semibold flex flex-col items-center gap-2">
                       <Package className="h-8 w-8 opacity-20" />
                       <span>Gagal memuat detail item atau tabel relasi telah berubah.</span>
                   </div>
               )}
            </div>
        </div>
      </Modal>

    </div>
  );
};

export default PromoPage;
