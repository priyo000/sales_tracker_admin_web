import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromoCluster } from "../types";
import { Edit2, Trash2, Users, LayoutGrid } from "lucide-react";

interface ClusterListProps {
  clusters: PromoCluster[];
  loading: boolean;
  onEdit: (cluster: PromoCluster) => void;
  onDelete: (id: number) => void;
  onViewCustomers: (cluster: PromoCluster) => void;
}

export const ClusterList = ({ 
  clusters, 
  loading, 
  onEdit, 
  onDelete,
  onViewCustomers
}: ClusterListProps) => {
  if (loading && clusters.length === 0) {
    return <div className="p-12 text-center text-muted-foreground font-bold italic uppercase opacity-40">Memuat data cluster...</div>;
  }

  if (clusters.length === 0) {
    return <div className="p-12 text-center text-muted-foreground font-bold italic uppercase opacity-40">Belum ada cluster promo yang dibuat.</div>;
  }

  return (
    <div className="border border-border/50 rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50 border-b border-border/10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest pl-6">Nama Cluster</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest">Scope & Divisi</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest">Deskripsi</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest text-center">Toko Terdaftar</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest text-center">Status</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest text-right pr-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster) => (
            <TableRow key={cluster.id} className="hover:bg-muted/30 transition-colors group">
              <TableCell className="pl-6 py-5">
                <div className="font-black italic text-sm text-foreground tracking-tighter">{cluster.nama_cluster.toUpperCase()}</div>
                <div className="text-[9px] text-muted-foreground font-bold italic uppercase tracking-widest opacity-50">CID-{cluster.id.toString().padStart(4, '0')}</div>
              </TableCell>
              <TableCell>
                {cluster.id_divisi ? (
                  <Badge variant="outline" className="font-black italic text-[9px] uppercase tracking-tighter bg-blue-500/5 text-blue-600 border-blue-200">
                    <LayoutGrid className="h-2 w-2 mr-1" /> DIVISI ID: {cluster.id_divisi}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="font-black italic text-[9px] uppercase tracking-tighter bg-emerald-500/5 text-emerald-600 border-emerald-200">
                    GLOBAL (ALL DEPT)
                  </Badge>
                )}
              </TableCell>
              <TableCell className="max-w-xs">
                <div className="text-[11px] font-bold italic text-muted-foreground line-clamp-1">{cluster.deskripsi || 'Tidak ada deskripsi.'}</div>
              </TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 h-8 rounded-xl text-primary font-black italic uppercase text-[10px] tracking-tight hover:bg-primary/10"
                  onClick={() => onViewCustomers(cluster)}
                >
                  <Users className="h-4 w-4" />
                  <span>{cluster.pelanggan_assignments_count || 0} Toko</span>
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Badge 
                  className={`font-black italic text-[9px] uppercase tracking-widest ${
                    cluster.is_aktif 
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" 
                      : "bg-red-500/10 text-red-600 border-red-200"
                  }`}
                >
                  {cluster.is_aktif ? "Aktif" : "Non-Aktif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right pr-6 space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-primary hover:bg-primary/10" 
                  onClick={() => onEdit(cluster)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                  onClick={() => onDelete(cluster.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
