import { Trash, Calendar, Target, Layers, Package, Eye, MoreHorizontal } from "lucide-react";
import { PromoCampaign } from "../types";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HadiahTableProps {
  rules: PromoCampaign[];
  loading: boolean;
  onDelete: (row: PromoCampaign) => void;
  onView?: (campaign: PromoCampaign) => void;
  onCancel?: (id: number) => void;
}

const getStatusBadge = (status?: string) => {
  switch (status) {
    case 'PENDING':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">PENDING</Badge>;
    case 'BERLANGSUNG':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">BERLANGSUNG</Badge>;
    case 'BATAL':
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">BATAL</Badge>;
    case 'SELESAI':
      return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">SELESAI</Badge>;
    default:
      return <Badge variant="secondary">{status || '-'}</Badge>;
  }
};

export const HadiahTable: React.FC<HadiahTableProps> = ({ 
  rules, 
  loading, 
  onDelete,
  onView,
  onCancel,
}) => {
  const batchColumns: ColumnDef<PromoCampaign>[] = [
    {
      key: "nama_promo",
      header: "Nama Promo",
      cell: (row) => (
        <div className="flex items-center gap-3 py-1">
          <div className="h-9 w-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="font-bold text-foreground capitalize">
              {row.nama_promo}
            </div>
            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> {row.items_count} Item
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (row) => (
        <div className={row.status === 'BATAL' || row.status === 'SELESAI' ? 'opacity-60' : ''}>
          {getStatusBadge(row.status)}
        </div>
      ),
    },
    {
      key: "pemicu",
      header: "Syarat",
      cell: (row) => (
        <div className="text-xs">
          {row.pemicu_summary || (row.jenis_pemicu === 'total_nota' ? `Min. Rp ${parseFloat(row.min_amount_pemicu || '0').toLocaleString('id-ID')}` : '-')}
        </div>
      ),
    },
    {
      key: "hadiah",
      header: "Hadiah",
      cell: (row) => (
        <div className="font-semibold text-primary text-xs">
          {typeof row.hadiah === 'object' ? row.hadiah?.nama_produk : String(row.hadiah || "")} ({row.qty_hadiah}x)
        </div>
      ),
    },
    {
      key: "target",
      header: "Target",
      cell: (row) => (
        row.cluster ? (
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px]">
            <Target className="h-3 w-3 mr-1" /> {row.cluster.nama_cluster}
          </Badge>
        ) : (
          <Badge variant="outline" className="text-[10px]">Semua Pelanggan</Badge>
        )
      ),
    },
    {
      key: "masa_berlaku",
      header: "Masa Berlaku",
      cell: (row) => (
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground tabular-nums opacity-80">
          <Calendar className="h-3.5 w-3.5 opacity-50" />
          <span>{row.tanggal_akhir ? formatDate(row.tanggal_akhir) : '-'}</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (row) => (
        <div className="flex justify-end gap-1">
          {onView && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10" onClick={() => onView(row)}>
                <Eye className="h-4 w-4" />
            </Button>
          )}
          {onCancel && (row.status === 'PENDING' || row.status === 'BERLANGSUNG') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCancel(row.id)} className="text-red-600">
                  Batalkan
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(row)} className="text-red-600">
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {(!onCancel || row.status === 'BATAL' || row.status === 'SELESAI') && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => onDelete(row)}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={rules}
      columns={batchColumns}
      loading={loading}
      searchPlaceholder="Cari nama promo..."
      rowKey={(r) => r.id}
      emptyMessage="Belum ada promo hadiah yang ditemukan."
    />
  );
};
