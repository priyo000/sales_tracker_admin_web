import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { PromoCluster } from "../types";
import { usePromo } from "../hooks/usePromo";
import { usePelanggan } from "@/features/pelanggan/hooks/usePelanggan";
import { useRute } from "@/features/rute/hooks/useRute";
import { Button } from "@/components/ui/button";
import { Trash, Plus, Users, Search, Store, MapPin, CheckSquare, Square, Filter, Users2 } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface ClusterAssignmentModalProps {
  cluster: PromoCluster | null;
  isOpen: boolean;
  onClose: () => void;
}

interface AssignedPelanggan {
  id: number;
  id_pelanggan: number;
  id_promo_cluster: number;
  pelanggan?: {
    id: number;
    nama_toko: string;
    kode_pelanggan?: string;
    alamat_usaha?: string;
  };
}

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
  const { rutes, fetchRutes } = useRute();
  
  const [assigned, setAssigned] = useState<AssignedPelanggan[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoute, setSelectedRoute] = useState<string>("all");
  const debouncedSearch = useDebounce(searchQuery, 400);

  // Selection state for bulk
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const loadAssigned = useCallback(async () => {
    if (!cluster) return;
    setIsFetching(true);
    try {
      const res = await fetchAssignedPelanggan(cluster.id);
      if (res.success && Array.isArray(res.data)) {
        setAssigned(res.data);
      } else {
        setAssigned([]);
      }
    } catch (e) {
      console.error("Failed to load assigned", e);
      setAssigned([]);
    } finally {
      setIsFetching(false);
    }
  }, [cluster, fetchAssignedPelanggan]);

  useEffect(() => {
    if (isOpen && cluster) {
      loadAssigned();
      fetchRutes({ per_page: -1 });
      setSearchQuery("");
      setSelectedRoute("all");
      setSelectedIds([]);
    } else if (!isOpen) {
      setAssigned([]);
      setSearchQuery("");
      setSelectedIds([]);
    }
  }, [isOpen, cluster, loadAssigned, fetchRutes]);

  useEffect(() => {
    if (isOpen) {
      const params: Record<string, unknown> = { status: 'active', per_page: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedRoute !== "all") params.id_rute = selectedRoute;
      
      if (debouncedSearch.length >= 2 || selectedRoute !== "all") {
        fetchPelanggans(params).catch(err => console.error("Search failed", err));
      }
    }
  }, [debouncedSearch, selectedRoute, isOpen, fetchPelanggans]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (!Array.isArray(pelanggans)) return;
    const unassignedResults = pelanggans.filter(p => !assigned.some(a => a.id_pelanggan === p.id));
    if (selectedIds.length === unassignedResults.length && unassignedResults.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unassignedResults.map(p => p.id));
    }
  };

  const handleBulkAssign = async () => {
    if (!cluster || selectedIds.length === 0) return;
    
    try {
      const res = await assignPelanggan(cluster.id, {
        id_pelanggan: selectedIds,
      });

      if (res.success) {
        toast.success(res.message || "Pelanggan berhasil ditambahkan");
        setSelectedIds([]);
        loadAssigned();
      } else {
        toast.error(res.message || "Gagal menambahkan pelanggan");
      }
    } catch (e) {
      console.error("Bulk assign crashed", e);
      toast.error("Terjadi kesalahan sistem saat menambahkan pelanggan");
    }
  };

  const handleRemove = async (assignmentId: number) => {
    if (!cluster) return;
    try {
      const res = await removePelangganAssignment(cluster.id, assignmentId);
      if (res.success) {
        toast.success("Pelanggan dikeluarkan dari cluster");
        loadAssigned();
      } else {
        toast.error(res.message || "Gagal mengeluarkan pelanggan");
      }
    } catch (e) {
      console.error("Remove crashed", e);
      toast.error("Terjadi kesalahan saat mengeluarkan pelanggan");
    }
  };

  const filteredPelanggans = Array.isArray(pelanggans) ? pelanggans : [];
  const safeAssigned = Array.isArray(assigned) ? assigned : [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary text-white rounded-lg shadow-lg shadow-primary/20">
            <Users2 className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight">Manajemen Anggota Cluster</span>
            <span className="text-xs text-muted-foreground font-medium">{cluster?.nama_cluster || "Memuat..."}</span>
          </div>
        </div>
      }
      size="5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-[650px] -m-6 divide-x divide-border overflow-hidden">
        {/* Left Side: Search & Add (3 parts) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-muted/5">
          <div className="p-6 pb-0 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-foreground">Cari & Tambah Toko</h3>
                <p className="text-xs text-muted-foreground">Pilih toko yang ingin dimasukkan ke dalam cluster ini.</p>
              </div>
              <Badge variant="secondary" className="font-medium text-[11px] px-3 py-1">
                Permanent Assignment
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari toko..."
                  className="pl-9 h-10 bg-background border-border shadow-sm text-sm"
                />
              </div>

              <div className="relative">
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger className="h-10 bg-background border-border shadow-sm text-sm">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Semua Rute" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rute</SelectItem>
                    {Array.isArray(rutes) && rutes.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.nama_rute}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
               <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-9 text-xs font-semibold gap-2 hover:bg-muted"
                    onClick={handleSelectAll}
                    disabled={filteredPelanggans.length === 0}
                  >
                    {selectedIds.length > 0 && selectedIds.length === filteredPelanggans.filter(p => !safeAssigned.some(a => a.id_pelanggan === p.id)).length ? (
                      <CheckSquare className="h-4 w-4 text-primary" />
                    ) : (
                      <Square className="h-4 w-4 opacity-40" />
                    )}
                    Pilih Semua
                  </Button>
                  
                  {selectedIds.length > 0 && (
                    <div className="text-xs font-semibold text-primary">
                       {selectedIds.length} toko dipilih
                    </div>
                  )}
               </div>

               <Button 
                onClick={handleBulkAssign} 
                disabled={selectedIds.length === 0 || promoLoading}
                size="sm"
                className="h-9 px-6 font-bold shadow-md animate-in slide-in-from-right-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Tambah ke Cluster
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-2 space-y-1">
            {pelangganLoading ? (
              <div className="h-full flex items-center justify-center py-20">
                 <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filteredPelanggans.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-60">
                 <Search className="h-10 w-10 text-muted-foreground mb-4" />
                 <p className="text-sm font-semibold">Toko Tidak Ditemukan</p>
                 <p className="text-xs text-muted-foreground mt-1">Coba kata kunci lain atau pilih rute berbeda.</p>
              </div>
            ) : (
              filteredPelanggans.map((p) => {
                const isAlreadyAssigned = safeAssigned.some(a => a.id_pelanggan === p.id);
                const isSelected = selectedIds.includes(p.id);
                
                return (
                  <div 
                    key={p.id} 
                    className={cn(
                      "group p-3 flex items-center border rounded-xl transition-all mb-2",
                      isAlreadyAssigned ? "bg-muted/30 border-dashed opacity-70" : "hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
                      isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                    )}
                    onClick={() => !isAlreadyAssigned && handleToggleSelect(p.id)}
                  >
                    <div className="mr-3">
                       <Checkbox 
                        checked={isSelected || isAlreadyAssigned} 
                        disabled={isAlreadyAssigned}
                        className="rounded h-5 w-5 border-border data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-semibold text-[13px] text-foreground truncate">
                          {p.nama_toko}
                        </span>
                        {p.kode_pelanggan && (
                          <Badge variant="secondary" className="text-[10px] font-medium px-1.5 opacity-70">
                            {p.kode_pelanggan}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground truncate">
                        <MapPin className="h-3 w-3 opacity-50" />
                        <span className="truncate">{p.alamat_usaha}</span>
                      </div>
                    </div>
                    
                    {!isAlreadyAssigned && (
                       <div className="flex items-center">
                          <Button 
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 rounded-full border-primary/20 text-primary p-0 shadow-sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSelect(p.id);
                            }}
                          >
                             <Plus className="h-4 w-4" />
                          </Button>
                       </div>
                    )}
                    {isAlreadyAssigned && (
                      <Badge variant="outline" className="font-semibold text-[10px] py-0.5 px-2 bg-muted/50">
                        Terdaftar
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Assigned List (2 parts) */}
        <div className="lg:col-span-2 flex flex-col h-full bg-background overflow-hidden shadow-inner">
          <div className="p-6 pb-4 border-b bg-muted/10 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Anggota Aktif</h3>
              </div>
              <Badge className="font-bold text-xs bg-primary shadow-sm px-3 rounded-full">
                {safeAssigned.length} Toko
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground font-medium">Toko yang saat ini terdaftar di cluster ini.</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {isFetching ? (
              <div className="h-full flex items-center justify-center p-20">
                 <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : safeAssigned.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-40">
                <Users className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <p className="text-sm font-bold text-muted-foreground">Cluster Masih Kosong</p>
                <p className="text-xs mt-2 text-muted-foreground font-medium">Belum ada toko yang ditugaskan.</p>
              </div>
            ) : (
              safeAssigned.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all group">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-semibold text-[13px] text-foreground tracking-tight truncate mb-0.5">
                      {a.pelanggan?.nama_toko || "Toko Tidak Dikenal"}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-70 truncate">
                       <MapPin className="h-3 w-3" />
                       <span className="truncate">{a.pelanggan?.alamat_usaha || "Alamat tidak tersedia"}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-lg shadow-sm bg-white border border-border/50"
                    onClick={() => handleRemove(a.id)}
                    disabled={promoLoading}
                  >
                    <Trash className="h-4 w-4" />
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
