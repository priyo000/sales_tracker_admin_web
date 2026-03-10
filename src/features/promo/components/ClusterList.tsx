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
import { Edit2, Trash2, Users } from "lucide-react";

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
    return <div className="p-8 text-center text-muted-foreground italic">Memuat data cluster...</div>;
  }

  if (clusters.length === 0) {
    return <div className="p-8 text-center text-muted-foreground italic">Belum ada cluster promo yang dibuat.</div>;
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Nama Cluster</TableHead>
            <TableHead className="font-bold">Deskripsi</TableHead>
            <TableHead className="font-bold text-center">Toko</TableHead>
            <TableHead className="font-bold text-center">Status</TableHead>
            <TableHead className="font-bold text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clusters.map((cluster) => (
            <TableRow key={cluster.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-semibold">{cluster.nama_cluster}</TableCell>
              <TableCell className="max-w-xs truncate text-muted-foreground">{cluster.deskripsi || '-'}</TableCell>
              <TableCell className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 text-primary hover:text-primary hover:bg-primary/10"
                  onClick={() => onViewCustomers(cluster)}
                >
                  <Users className="h-4 w-4" />
                  <span>{cluster.pelanggan_assignments_count || 0} Toko</span>
                </Button>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant={cluster.is_aktif ? "default" : "secondary"} className={cluster.is_aktif ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : ""}>
                  {cluster.is_aktif ? "Aktif" : "Non-Aktif"}
                </Badge>
              </TableCell>
              <TableCell className="text-right space-x-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => onEdit(cluster)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDelete(cluster.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
