import React, { useEffect, useState } from "react";
import { Tag, Plus, Users, Package, Gift, BarChart3, Layers, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency } from "@/lib/utils";
import { usePromo } from "@/features/promo/hooks/usePromo";
import { ClusterTable } from "@/features/promo/components/ClusterTable";
import { PriceRuleTable } from "@/features/promo/components/PriceRuleTable";
import { GrosirTable } from "@/features/promo/components/GrosirTable";
import { HadiahTable } from "@/features/promo/components/HadiahTable";
import { Button } from "@/components/ui/button";
import { Modal, ConfirmModal } from "@/components/ui/Modal";
import { ClusterForm } from "@/features/promo/components/ClusterForm";
import { PriceRuleForm } from "@/features/promo/components/PriceRuleForm";
import { GrosirForm } from "@/features/promo/components/GrosirForm";
import { HadiahForm } from "@/features/promo/components/HadiahForm";
import { ClusterAssignmentModal } from "@/features/promo/components/ClusterAssignmentModal";
import { PromoCluster, PromoAturanHarga, PromoGrosir, PromoHadiah, PromoCampaign } from "@/features/promo/types";
import PromoDashboard from "@/features/promo/components/PromoDashboard";

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
        <PromoDashboard
          clusters={clusters}
          priceRules={priceRules}
          grosirRules={grosirRules}
          rewardRules={rewardRules}
        />
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
        <div className="p-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-muted/30 p-5 rounded-2xl border border-border/50">
               <div className="col-span-1 md:col-span-2">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1.5 opacity-70 flex items-center gap-1.5">
                    <Tag className="h-3 w-3" /> Nama Program
                  </div>
                  <div className="font-black text-xl text-foreground leading-tight tracking-tight uppercase">
                    {selectedCampaignView?.nama_promo}
                  </div>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 flex items-center gap-1.5 opacity-70">
                      <Calendar className="h-3 w-3" /> Masa Berlaku
                    </div>
                    <div className="font-bold text-sm bg-background/50 px-2 py-1 rounded inline-block">
                      {selectedCampaignView?.tanggal_mulai ? new Date(selectedCampaignView.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'} — {selectedCampaignView?.tanggal_akhir ? new Date(selectedCampaignView.tanggal_akhir).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 flex items-center gap-1.5 opacity-70">
                      <Users className="h-3 w-3" /> Target Cluster
                    </div>
                    <div className="font-black text-xs text-primary bg-primary/5 border border-primary/10 px-2 py-1 rounded-lg inline-block">
                      {selectedCampaignView?.cluster?.nama_cluster || 'Seluruh Pelanggan'}
                    </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 flex items-center gap-1.5 opacity-70">
                      <Layers className="h-3 w-3" /> Jenis Program
                    </div>
                    <div className="font-black uppercase text-[11px] text-orange-600 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full inline-block">
                      {selectedCampaignView?.jenis_promo?.replace('_', ' ')}
                    </div>
                  </div>
                  {selectedCampaignView?.divisi && (
                    <div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black mb-1 flex items-center gap-1.5 opacity-70">
                        <Package className="h-3 w-3" /> Divisi
                      </div>
                      <div className="font-bold text-xs bg-muted border border-border/50 px-2 py-1 rounded inline-block">
                        {selectedCampaignView.divisi.nama_divisi}
                      </div>
                    </div>
                  )}
               </div>
            </div>
            
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                  <span className="font-black text-xs uppercase tracking-widest text-muted-foreground">Daftar Item &amp; Ketentuan Benefit</span>
                </div>
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black px-3 py-1 text-[11px]">
                  {selectedCampaignView?.jenis_promo === 'grosir'
                    ? `${selectedCampaignView.items_count || [...new Set(((selectedCampaignView?.items ?? []) as any[]).map((i) => i.id_produk))].length} Produk`
                    : `${selectedCampaignView?.items?.length || 0} Aturan`}
                </Badge>
            </div>

            <div className="max-h-[450px] overflow-y-auto border border-border/50 rounded-2xl bg-card shadow-sm">
                <table className="w-full text-sm text-left border-collapse">
                    <thead className="bg-muted/50 text-[10px] uppercase font-black text-muted-foreground tracking-widest sticky top-0 shadow-sm z-10">
                       <tr>
                          <th className="px-5 py-4 border-b w-[45%]">Pemicu / Target Produk</th>
                          <th className="px-5 py-4 border-b border-l bg-primary/2 text-primary">Detail / Benefit Promo</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                    {/* GROSIR: group by product, show tiers per row */}
                    {selectedCampaignView?.jenis_promo === 'grosir' && (() => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const grouped: Record<number, any[]> = {};
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (selectedCampaignView.items ?? []).forEach((item: any) => {
                          if (!grouped[item.id_produk]) grouped[item.id_produk] = [];
                          grouped[item.id_produk].push(item);
                        });
                        return Object.entries(grouped).map(([produkId, tierItems]) => {
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          const sorted = [...tierItems].sort((a: any, b: any) => a.min_qty - b.min_qty);
                          const produk = sorted[0]?.produk;
                          return (
                            <tr key={produkId} className="hover:bg-muted/30 align-top transition-colors">
                               <td className="px-5 py-4">
                                  <div className="flex flex-col gap-1.5">
                                    <span className="font-bold text-sm text-foreground leading-snug">{produk?.nama_produk || `Produk #${produkId}`}</span>
                                    {produk?.sku && (
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-black text-muted-foreground tracking-wider uppercase border border-border/30">{produk.sku}</span>
                                        {produk.harga_jual && (
                                          <span className="text-[10px] font-bold text-primary italic">Base: {formatCurrency(parseFloat(produk.harga_jual))}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                               </td>
                               <td className="px-5 py-4 border-l bg-primary/0.5">
                                  <div className="flex flex-col gap-2">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {sorted.map((tier: any, ti: number) => (
                                      <div key={tier.id} className="flex items-center gap-3 p-2 rounded-xl bg-background border border-border/30 shadow-sm hover:border-primary/20 transition-all">
                                        <div className="bg-orange-600 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0">
                                          {ti+1}
                                        </div>
                                        <div className="flex-1 flex items-center justify-between min-w-0">
                                          <div className="flex flex-col">
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Minimal Pembelian</span>
                                            <strong className="text-sm font-black text-foreground">{tier.min_qty} <span className="text-[10px] opacity-50 font-bold uppercase ml-0.5">Pcs</span></strong>
                                          </div>
                                          <div className="h-8 w-px bg-border/50 mx-2" />
                                          <div className="flex flex-col items-end">
                                            <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Potongan Harga</span>
                                            {parseFloat(tier.diskon_persen || "0") > 0 ? (
                                              <span className="text-sm font-black text-emerald-600">Diskon {tier.diskon_persen}%</span>
                                            ) : (
                                              <span className="text-sm font-black text-orange-600">{formatCurrency(parseFloat(tier.harga_spesial || "0"))}</span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                               </td>
                            </tr>
                          );
                        });
                    })()}
                    {/* ATURAN HARGA & HADIAH: one row per item */}
                    {selectedCampaignView?.jenis_promo !== 'grosir' && (selectedCampaignView?.items ?? []).map((item) => {
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      const i = item as any;
                      return (
                        <tr key={i.id} className="hover:bg-muted/30 transition-colors align-center">
                          <td className="px-5 py-4">
                            <div className="flex flex-col gap-1.5">
                              <span className="font-bold text-sm text-foreground leading-snug">
                                {i.produk ? i.produk.nama_produk : (i.pemicu ? i.pemicu.nama_produk : 'Global / Syarat Total Nota Khusus')}
                              </span>
                              {i.produk?.sku && (
                                <span className="text-[10px] bg-muted w-fit px-1.5 py-0.5 rounded font-black text-muted-foreground tracking-wider uppercase border border-border/30">{i.produk.sku}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-4 border-l bg-primary/0.5">
                            {selectedCampaignView?.jenis_promo === 'aturan_harga' && (
                              <div className="flex items-center gap-4">
                                {parseFloat(i.diskon_persen || "0") > 0 && (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Potongan %</span>
                                    <span className="font-black text-emerald-600 text-sm">Diskon {i.diskon_persen}%</span>
                                  </div>
                                )}
                                {parseFloat(i.harga_manual || "0") > 0 && (
                                  <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Harga Khusus</span>
                                    <span className="font-black text-orange-600 text-sm">{formatCurrency(parseFloat(i.harga_manual))}</span>
                                  </div>
                                )}
                                {!parseFloat(i.diskon_persen || "0") && !parseFloat(i.harga_manual || "0") && <span className="text-muted-foreground italic text-[11px]">Tidak ada benefit tersimpan</span>}
                              </div>
                            )}
                            {selectedCampaignView?.jenis_promo === 'hadiah' && (
                              <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60 whitespace-nowrap">Syarat Pembelian</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {parseFloat(i.min_amount_pemicu || "0") > 0 && <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-bold">Min. Rp{parseFloat(i.min_amount_pemicu).toLocaleString('id-ID')}</span>}
                                    {parseFloat(i.min_qty_pemicu || "0") > 0 && <span className="bg-muted px-2 py-0.5 rounded text-[11px] font-bold">Min. {i.min_qty_pemicu} Pcs</span>}
                                  </div>
                                </div>
                                <div className="h-8 w-px bg-border/50" />
                                <div className="flex flex-col flex-1">
                                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Hadiah / Bonus</span>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <Gift className="h-4 w-4 text-primary" />
                                    <span className="font-black text-primary text-sm">
                                      {i.hadiah?.nama_produk || 'Item Spesial'} <span className="text-muted-foreground text-[10px] ml-1 bg-primary/10 px-1.5 rounded">x{i.qty_hadiah}</span>
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-black mt-1 uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full w-fit border border-emerald-100">
                                    Tebusan: {formatCurrency(parseFloat(i.harga_tebus || "0"))}
                                  </span>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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
