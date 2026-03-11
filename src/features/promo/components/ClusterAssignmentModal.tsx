import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { PromoCluster } from "../types";
import { usePromo } from "../hooks/usePromo";
import { usePelanggan } from "@/features/pelanggan/hooks/usePelanggan";
import { Button } from "@/components/ui/button";
import { Trash, Plus, Users, Search, Store } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { format, addYears } from "date-fns";
import { Label } from "@/components/ui/label";

interface ClusterAssignmentModalProps {
  cluster: PromoCluster | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AssignedPelanggan {
  id: number;
  id_pelanggan: number;
  id_promo_cluster: number;
  tanggal_mulai: string;
  tanggal_akhir: string;
  pelanggan?: {
    id: number;
    nama_toko: string;
    kode_pelanggan?: string;
  };
}

// Custom hook for debouncing search query
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ClusterAssignmentModal: React.FC<ClusterAssignmentModalProps> = ({ 
  cluster, 
  isOpen, 
  onClose 
}) => {
  const { fetchAssignedPelanggan, assignPelanggan, removePelangganAssignment, loading: promoLoading } = usePromo();
  const { pelanggans, fetchPelanggans, loading: pelangganLoading } = usePelanggan();
  
  const [assigned, setAssigned] = useState<AssignedPelanggan[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Form State
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));

  // Load Assigned Pelanggan
  const loadAssigned = useCallback(async () => {
    if (!cluster) return;
    setIsFetching(true);
    const res = await fetchAssignedPelanggan(cluster.id);
    if (res.success) {
      setAssigned(res.data);
    }
    setIsFetching(false);
  }, [cluster, fetchAssignedPelanggan]);

  // Handle Modal Open / Close
  useEffect(() => {
    if (isOpen && cluster) {
      // eslint-disable-next-line
      loadAssigned();
      setSearchQuery(""); // Reset search on open
    } else if (!isOpen) {
      // Clear data when modal closes
      setTimeout(() => {
        setAssigned([]);
        setSearchQuery("");
      }, 0);
    }
  }, [isOpen, cluster, loadAssigned]);

  // Handle Debounced Search trigger
  useEffect(() => {
    if (isOpen && debouncedSearch.length >= 2) {
      fetchPelanggans({ search: debouncedSearch, status: 'active', per_page: 20 });
    } else if (isOpen && debouncedSearch.length < 2) {
      // Clear suggestions if too short
      fetchPelanggans({ status: 'active', per_page: 0 }); // A dummy call or we can ignore
    }
  }, [debouncedSearch, isOpen, fetchPelanggans]);

  const handleAssign = async (pelangganId: number) => {
    if (!cluster) return;
    
    // Check if already assigned
    if (assigned.some(a => a.id_pelanggan === pelangganId)) {
      toast.error("Pelanggan ini sudah ada di cluster");
      return;
    }

    const res = await assignPelanggan(cluster.id, {
      id_pelanggan: pelangganId,
      tanggal_mulai: startDate,
      tanggal_akhir: endDate,
    });

    if (res.success) {
      toast.success("Pelanggan berhasil ditambahkan");
      loadAssigned();
    } else {
      toast.error(res.message || "Gagal menambahkan pelanggan");
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!cluster) return;
    const res = await removePelangganAssignment(cluster.id, assignmentId);
    if (res.success) {
      toast.success("Pelanggan dikeluarkan dari cluster");
      loadAssigned();
    } else {
      toast.error(res.message || "Gagal mengeluarkan pelanggan");
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={cluster?.nama_cluster ? `Kelola Cluster: ${cluster.nama_cluster}` : "Kelola Pelanggan Cluster"}
      size="xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 pb-4 h-[550px]">
        {/* Left Side: Search & Add */}
        <div className="flex flex-col h-full border-r border-border/50 pr-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm tracking-tight">Cari & Tambahkan Toko</h3>
            </div>
            
            <div className="space-y-3 p-3 bg-muted/40 rounded-xl border border-border/50 mb-4">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Masa Berlaku Awal</Label>
                <Input 
                  type="date" 
                  value={startDate} 
                  onChange={(e) => setStartDate(e.target.value)} 
                  className="bg-card font-semibold text-xs border-border/50 shadow-sm h-8"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Masa Berlaku Akhir</Label>
                <Input 
                  type="date" 
                  value={endDate} 
                  onChange={(e) => setEndDate(e.target.value)} 
                  className="bg-card font-semibold text-xs border-border/50 shadow-sm h-8"
                />
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ketik minimal 2 huruf nama toko/kode..."
                className="pl-9 bg-card font-semibold shadow-sm border-border/50"
              />
            </div>
          </div>

          <div className="flex-1 bg-card border border-border/50 rounded-xl overflow-hidden divide-y divide-border/50 overflow-y-auto min-h-[200px]">
            {searchQuery.length < 2 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-60">
                <Store className="h-8 w-8 mb-2 opacity-30" />
                <p className="text-xs font-bold uppercase tracking-widest">Ketik Untuk Mencari</p>
                <p className="text-[10px] mt-1">Cari berdasarkan nama atau kode toko.</p>
              </div>
            ) : pelangganLoading ? (
               <div className="h-full flex items-center justify-center flex-col text-muted-foreground animate-pulse p-6">
                 <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                 <span className="font-semibold text-xs uppercase tracking-widest">Mencari Data...</span>
              </div>
            ) : pelanggans.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                <Search className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest opacity-60">Toko Tidak Ditemukan</p>
              </div>
            ) : (
              pelanggans.map((p) => {
                const isAlreadyAssigned = assigned.some(a => a.id_pelanggan === p.id);
                return (
                  <div key={p.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div className="pr-3">
                      <div className="font-bold text-xs text-foreground uppercase tracking-tight line-clamp-1">
                        {p.nama_toko}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 opacity-70">
                        {p.kode_pelanggan || "Tanpa Kode"} {p.id_rute ? `• Rute ${p.id_rute}` : ''}
                      </div>
                    </div>
                    <Button 
                      size="sm"
                      variant={isAlreadyAssigned ? "outline" : "default"}
                      className={`h-7 px-3 text-[10px] font-bold uppercase shrink-0 rounded-lg ${
                        !isAlreadyAssigned ? "bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20" : ""
                      }`}
                      onClick={() => handleAssign(p.id)}
                      disabled={promoLoading || isAlreadyAssigned}
                    >
                      {isAlreadyAssigned ? "Sudah Di Cluster" : "Tambahkan"}
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Assigned List */}
        <div className="flex flex-col h-full pl-2">
          <div className="flex items-center justify-between mb-4 mt-2 lg:mt-0">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold text-sm tracking-tight text-foreground">Anggota Terdaftar</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full">
              {assigned.length} Toko
            </span>
          </div>

          <div className="flex-1 bg-card border border-border/50 rounded-xl overflow-hidden divide-y divide-border/50 overflow-y-auto">
            {isFetching ? (
              <div className="h-full flex items-center justify-center flex-col text-muted-foreground animate-pulse">
                 <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                 <span className="font-semibold text-xs uppercase tracking-widest">Memuat data...</span>
              </div>
            ) : assigned.length === 0 ? (
              <div className="h-full text-center flex flex-col items-center justify-center p-6">
                <Users className="h-8 w-8 text-muted-foreground opacity-20 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Belum ada anggota</p>
                <p className="text-[10px] mt-1 text-muted-foreground opacity-40">Toko belum dimasukkan ke cluster ini</p>
              </div>
            ) : (
              assigned.map((a) => (
                <div key={a.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div className="pr-3">
                    <div className="font-bold text-xs text-foreground uppercase tracking-tight line-clamp-1">
                      {a.pelanggan?.nama_toko || "Toko Tidak Dikenal"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-semibold mt-0.5 opacity-60 tabular-nums">
                      {format(new Date(a.tanggal_mulai), 'dd/MM/yyyy')} - {format(new Date(a.tanggal_akhir), 'dd/MM/yyyy')}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 transition-colors rounded-lg"
                    onClick={() => handleRemove(a.id)}
                    title="Keluarkan dari cluster"
                    disabled={promoLoading}
                  >
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
