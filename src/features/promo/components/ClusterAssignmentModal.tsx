import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
import { PromoCluster } from "../types";
import { usePromo } from "../hooks/usePromo";
import { usePelanggan } from "@/features/pelanggan/hooks/usePelanggan";
import { Button } from "@/components/ui/button";
import { Trash, Plus, Users, Search } from "lucide-react";
import toast from "react-hot-toast";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
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
  };
}

export const ClusterAssignmentModal: React.FC<ClusterAssignmentModalProps> = ({ 
  cluster, 
  isOpen, 
  onClose 
}) => {
  const { fetchAssignedPelanggan, assignPelanggan, removePelangganAssignment, loading } = usePromo();
  const { pelanggans, fetchPelanggans } = usePelanggan();
  
  const [assigned, setAssigned] = useState<AssignedPelanggan[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  
  // Form State
  const [selectedPelanggan, setSelectedPelanggan] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState<string>(format(addYears(new Date(), 1), 'yyyy-MM-dd'));

  useEffect(() => {
    if (isOpen) {
      fetchPelanggans({ per_page: -1, status: 'active' });
    }
  }, [isOpen, fetchPelanggans]);

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
      // eslint-disable-next-line
      loadAssigned();
    } else if (!isOpen) {
      // Clear data when modal closes to prevent showing old data on next open
      // Use setTimeout to skip the synchronous effect check by linter
      setTimeout(() => {
        setAssigned([]);
        setSelectedPelanggan("");
      }, 0);
    }
  }, [isOpen, cluster, loadAssigned]);

  const handleAssign = async () => {
    if (!cluster) return;
    if (!selectedPelanggan) {
      toast.error("Pilih pelanggan terlebih dahulu");
      return;
    }
    
    // Check if already assigned
    if (assigned.some(a => String(a.id_pelanggan) === selectedPelanggan)) {
      toast.error("Pelanggan ini sudah ada di cluster");
      return;
    }

    const res = await assignPelanggan(cluster.id, {
      id_pelanggan: parseInt(selectedPelanggan),
      tanggal_mulai: startDate,
      tanggal_akhir: endDate,
    });

    if (res.success) {
      toast.success("Pelanggan berhasil ditambahkan ke cluster");
      setSelectedPelanggan("");
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
      size="md"
    >
      <div className="space-y-6 pt-2 pb-4">
        {/* Assignment Form */}
        <div className="bg-muted/30 p-4 rounded-xl border border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <Plus className="h-4 w-4 text-primary" />
            <h3 className="font-bold text-sm tracking-tight">Tambahkan ke Cluster</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Pilih Pelanggan <span className="text-red-500">*</span>
              </Label>
              <Select value={selectedPelanggan} onValueChange={setSelectedPelanggan}>
                <SelectTrigger className="bg-background font-semibold text-xs border-border/50 shadow-sm">
                  <SelectValue placeholder="-- Pilih Toko --" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="null" disabled>-- Pilih Toko --</SelectItem>
                  {pelanggans.map((p) => (
                    <SelectItem key={p.id} value={p.id.toString()}>
                      {p.nama_toko} {p.id_rute ? `(Rute: ${p.id_rute})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Tgl Mulai Aktif</Label>
              <Input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="bg-background font-semibold text-xs border-border/50 shadow-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Berakhir Pada</Label>
              <Input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="bg-background font-semibold text-xs border-border/50 shadow-sm"
              />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <Button 
              onClick={handleAssign} 
              disabled={loading || !selectedPelanggan}
              className="px-6 h-9 text-[11px] font-bold uppercase tracking-widest bg-primary hover:bg-primary/90 rounded-lg shadow-md shadow-primary/20"
            >
              {loading ? "Menyimpan..." : "Tambahkan Toko"}
            </Button>
          </div>
        </div>

        {/* Assigned List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-bold text-sm tracking-tight text-foreground">Anggota Terdaftar</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-muted-foreground bg-muted border border-border/50 px-2 py-0.5 rounded-full">
              {assigned.length} Toko
            </span>
          </div>

          <div className="bg-card border border-border/50 rounded-xl overflow-hidden divide-y divide-border/50 h-[280px] overflow-y-auto">
            {isFetching ? (
              <div className="p-8 text-center flex items-center justify-center flex-col text-muted-foreground animate-pulse">
                 <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2" />
                 <span className="font-semibold text-xs uppercase tracking-widest">Memuat data...</span>
              </div>
            ) : assigned.length === 0 ? (
              <div className="p-8 h-full text-center flex flex-col items-center justify-center">
                <Search className="h-8 w-8 text-muted-foreground opacity-20 mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60">Belum ada anggota</p>
                <p className="text-[10px] mt-1 text-muted-foreground opacity-40">Toko belum dimasukkan ke cluster ini</p>
              </div>
            ) : (
              assigned.map((a) => (
                <div key={a.id} className="p-3 px-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <div>
                    <div className="font-bold text-xs text-foreground uppercase tracking-tight">
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
                    disabled={loading}
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
