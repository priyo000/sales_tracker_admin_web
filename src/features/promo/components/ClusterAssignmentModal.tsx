import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { PromoCluster } from "../types";
import { usePromo } from "../hooks/usePromo";
import { usePelanggan } from "@/features/pelanggan/hooks/usePelanggan";
import { useRute } from "@/features/rute/hooks/useRute";
import { Button } from "@/components/ui/button";
import { Trash, Users, Search, Store, MapPin, CheckSquare, Square, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { format, addYears } from "date-fns";
import { Label } from "@/components/ui/label";
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
  tanggal_mulai: string;
  tanggal_akhir: string;
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

  // Form State
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));

  const loadAssigned = useCallback(async () => {
    if (!cluster) return;
    setIsFetching(true);
    const res = await fetchAssignedPelanggan(cluster.id);
    if (res.success) {
      setAssigned(res.data);
    }
    setIsFetching(false);
  }, [cluster, fetchAssignedPelanggan]);

  useEffect(() => {
    if (isOpen && cluster) {
      loadAssigned();
      fetchRutes({ per_page: -1 });
      setSearchQuery("");
      setSelectedRoute("all");
      setSelectedIds([]);
    } else if (!isOpen) {
      setTimeout(() => {
        setAssigned([]);
        setSearchQuery("");
        setSelectedIds([]);
      }, 0);
    }
  }, [isOpen, cluster, loadAssigned, fetchRutes]);

  useEffect(() => {
    if (isOpen) {
      const params: any = { status: 'active', per_page: 50 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (selectedRoute !== "all") params.id_rute = selectedRoute;
      
      // Fetch if either search is present or route is filtered
      if (debouncedSearch.length >= 2 || selectedRoute !== "all") {
        fetchPelanggans(params);
      }
    }
  }, [debouncedSearch, selectedRoute, isOpen, fetchPelanggans]);

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const unassignedResults = pelanggans.filter(p => !assigned.some(a => a.id_pelanggan === p.id));
    if (selectedIds.length === unassignedResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(unassignedResults.map(p => p.id));
    }
  };

  const handleBulkAssign = async () => {
    if (!cluster || selectedIds.length === 0) return;
    
    const res = await assignPelanggan(cluster.id, {
      id_pelanggan: selectedIds, // Backend now supports array
      tanggal_mulai: startDate,
      tanggal_akhir: endDate,
    });

    if (res.success) {
      toast.success(res.message || "Pelanggan berhasil ditambahkan");
      setSelectedIds([]);
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
      title={cluster?.nama_cluster ? `Kelola Partisipan: ${cluster.nama_cluster}` : "Kelola Pelanggan Cluster"}
      size="5xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-0 h-[650px] -m-6 divide-x divide-border">
        {/* Left Side: Search & Add (3 parts) */}
        <div className="lg:col-span-3 flex flex-col h-full bg-muted/10">
          <div className="p-6 pb-0 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Cari Pelanggan</h3>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ribuan data terskala asinkron</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <Label className="text-[9px] font-bold uppercase text-muted-foreground mb-1">Masa Berlaku Default</Label>
                   <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-1">
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)} 
                        className="bg-transparent border-none outline-none text-[10px] font-bold p-1 w-28"
                      />
                      <span className="text-muted-foreground opacity-30 px-1">-</span>
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)} 
                        className="bg-transparent border-none outline-none text-[10px] font-bold p-1 w-28"
                      />
                   </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Search className="h-full w-full" />
                </div>
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Nama toko, kode, atau alamat..."
                  className="pl-9 h-10 bg-background font-semibold border-border/50 focus:border-primary/50 transition-all rounded-xl"
                />
              </div>

              <div className="relative">
                <Select value={selectedRoute} onValueChange={setSelectedRoute}>
                  <SelectTrigger className="h-10 bg-background border-border/50 font-semibold text-xs rounded-xl">
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Filter Berdasarkan Rute" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Rute</SelectItem>
                    {rutes.map((r) => (
                      <SelectItem key={r.id} value={r.id.toString()}>{r.nama_rute}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-border/50">
               <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-[10px] font-bold uppercase tracking-widest gap-2 bg-background border border-border/50"
                    onClick={handleSelectAll}
                    disabled={pelanggans.length === 0}
                  >
                    {selectedIds.length === pelanggans.filter(p => !assigned.some(a => a.id_pelanggan === p.id)).length && pelanggans.length > 0 ? (
                      <CheckSquare className="h-3.5 w-3.5 text-primary" />
                    ) : (
                      <Square className="h-3.5 w-3.5 opacity-30" />
                    )}
                    Pilih Semua Hasil
                  </Button>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    {selectedIds.length} terpilih dari {pelanggans.length} hasil
                  </span>
               </div>
               
               <Button 
                size="sm"
                disabled={selectedIds.length === 0 || promoLoading}
                onClick={handleBulkAssign}
                className="h-8 px-5 bg-primary text-white font-bold text-[10px] uppercase shadow-lg shadow-primary/20 rounded-lg hover:bg-primary/90 transition-all active:scale-95"
               >
                 <Plus className="h-3.5 w-3.5 mr-2" />
                 Tambahkan {selectedIds.length} Toko
               </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 pt-0 divide-y divide-border/30">
            {(!searchQuery && selectedRoute === "all") ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 opacity-40">
                <Store className="h-16 w-16 mb-4 text-muted-foreground opacity-20" />
                <p className="font-black text-xs uppercase tracking-[0.2em] mb-1">Pencarian Cepat</p>
                <p className="text-[10px] font-bold max-w-[250px]">Ketik nama toko atau pilih rute untuk menyaring ribuan data pelanggan.</p>
              </div>
            ) : pelangganLoading ? (
               <div className="h-full flex items-center justify-center flex-col py-20">
                 <div className="h-8 w-8 border-3 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                 <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">Menghubungkan ke Database...</span>
              </div>
            ) : pelanggans.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center py-20 opacity-30">
                <Search className="h-12 w-12 mb-4" />
                <p className="text-xs font-black uppercase tracking-widest">Data Tidak Ditemukan</p>
              </div>
            ) : (
              pelanggans.map((p) => {
                const isAlreadyAssigned = assigned.some(a => a.id_pelanggan === p.id);
                const isSelected = selectedIds.includes(p.id);
                return (
                  <div 
                    key={p.id} 
                    className={`group flex items-center p-4 transition-all border-l-2 ${
                      isSelected ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-muted/30'
                    } ${isAlreadyAssigned ? 'opacity-50 pointer-events-none grayscale' : ''}`}
                    onClick={() => !isAlreadyAssigned && handleToggleSelect(p.id)}
                  >
                    <div className="mr-4">
                       <Checkbox 
                        checked={isSelected || isAlreadyAssigned} 
                        disabled={isAlreadyAssigned}
                        className="rounded-md h-5 w-5 border-2"
                      />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-xs text-foreground uppercase tracking-tight truncate">
                          {p.nama_toko}
                        </span>
                        {p.kode_pelanggan && (
                          <Badge variant="secondary" className="text-[8px] h-4 font-black uppercase tracking-widest px-1.5 opacity-60">
                            {p.kode_pelanggan}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-semibold text-muted-foreground opacity-80 truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {p.alamat_usaha}
                        </span>
                        {p.id_rute && (
                          <span className="flex items-center gap-1 bg-muted px-1.5 py-0.5 rounded text-[9px]">
                            Rute ID: {p.id_rute}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {!isAlreadyAssigned && (
                       <Button 
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-background border shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleSelect(p.id);
                        }}
                      >
                         <Plus className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {isAlreadyAssigned && (
                      <Badge variant="outline" className="font-bold text-[8px] uppercase tracking-wider py-1">
                        Sudah Terdaftar
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Assigned List (2 parts) */}
        <div className="lg:col-span-2 flex flex-col h-full bg-background overflow-hidden">
          <div className="p-6 pb-4 border-b bg-card">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-bold text-sm tracking-tight text-foreground">Anggota Terdaftar</h3>
              </div>
              <Badge variant="default" className="text-[10px] font-black uppercase bg-primary text-white shadow-lg shadow-primary/20 px-3 py-1 rounded-full">
                {assigned.length} Toko
              </Badge>
            </div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Daftar toko yang tergabung di cluster ini</p>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/50">
            {isFetching ? (
              <div className="h-full flex items-center justify-center flex-col p-20 animate-pulse">
                 <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-3" />
                 <span className="font-bold text-[9px] uppercase tracking-[.2em] text-muted-foreground">Syncing...</span>
              </div>
            ) : assigned.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-30">
                <div className="p-4 bg-muted rounded-full mb-4">
                  <Users className="h-10 w-10 text-muted-foreground" />
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-relaxed">Cluster masih kosong</p>
                <p className="text-[9px] mt-2 max-w-[150px] font-semibold">Tentukan target customer menggunakan form pencarian di sebelah kiri.</p>
              </div>
            ) : (
              assigned.map((a) => (
                <div key={a.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-all group">
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="font-black text-xs text-foreground uppercase tracking-tight block truncate mb-1">
                      {a.pelanggan?.nama_toko || "Toko Tidak Dikenal"}
                    </div>
                    <div className="flex items-center gap-2">
                       <Badge variant="outline" className="text-[8px] font-bold opacity-60 h-4 border-none p-0">
                         Periode:
                       </Badge>
                       <span className="text-[9px] font-black text-muted-foreground flex items-center gap-1 tabular-nums">
                         {format(new Date(a.tanggal_mulai), 'dd/MM/yy')} <span className="opacity-30">➔</span> {format(new Date(a.tanggal_akhir), 'dd/MM/yy')}
                       </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                    onClick={() => handleRemove(a.id)}
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
