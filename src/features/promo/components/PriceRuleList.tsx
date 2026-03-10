import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PromoAturanHarga } from "../types";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Calendar, Target } from "lucide-react";

interface PriceRuleListProps {
  rules: PromoAturanHarga[];
  loading: boolean;
  onEdit: (rule: PromoAturanHarga) => void;
  onDelete: (id: number) => void;
}

export const PriceRuleList = ({ rules, loading, onEdit, onDelete }: PriceRuleListProps) => {
  if (loading && rules.length === 0) {
    return <div className="p-12 text-center text-muted-foreground font-bold italic uppercase opacity-40">Memuat data aturan harga...</div>;
  }

  if (rules.length === 0) {
    return <div className="p-12 text-center text-muted-foreground font-bold italic uppercase opacity-40">Belum ada aturan harga khusus yang aktif.</div>;
  }

  return (
    <div className="border border-border/50 rounded-3xl overflow-hidden bg-white shadow-sm overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50 border-b border-border/10">
          <TableRow className="hover:bg-transparent">
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest pl-6">Produk</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest">Target Scope</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest">Aturan Harga</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest">Masa Berlaku</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest text-center">Status</TableHead>
            <TableHead className="font-black italic uppercase text-[10px] tracking-widest text-right pr-6">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => {
            const isExpired = new Date(rule.tanggal_akhir) < new Date();
            
            return (
              <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors group">
                <TableCell className="pl-6 py-4">
                  <div className="font-black italic text-sm text-foreground">{rule.produk?.nama_produk?.toUpperCase() || 'PRODUK UNKNOWN'}</div>
                  <div className="text-[10px] text-muted-foreground font-bold italic uppercase tracking-tighter">{rule.produk?.sku}</div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {rule.cluster ? (
                      <Badge variant="outline" className="w-fit font-black italic text-[9px] uppercase tracking-tighter bg-blue-500/5 text-blue-600 border-blue-200 py-0.5">
                        <Target className="h-2 w-2 mr-1" /> CLUSTER: {rule.cluster.nama_cluster}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="w-fit font-black italic text-[9px] uppercase tracking-tighter bg-emerald-500/5 text-emerald-600 border-emerald-200 py-0.5">
                        SEMUA PELANGGAN
                      </Badge>
                    )}
                    {rule.id_divisi && (
                      <div className="text-[9px] font-black italic text-muted-foreground uppercase opacity-60">DEPT ID: {rule.id_divisi}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {rule.harga_manual ? (
                    <div className="flex flex-col">
                      <div className="font-black italic text-sm text-primary">
                        {formatCurrency(parseFloat(rule.harga_manual))}
                      </div>
                      <div className="text-[9px] font-bold italic text-muted-foreground uppercase opacity-50">FIXED PRICE LOCK</div>
                    </div>
                  ) : (
                    <div className="flex flex-col">
                      <div className="font-black italic text-sm text-orange-600">
                        -{rule.diskon_persen}%
                      </div>
                      <div className="text-[9px] font-bold italic text-muted-foreground uppercase opacity-50">PERCENTAGE DISCOUNT</div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-[10px] font-bold italic text-muted-foreground uppercase tracking-tight">
                    <Calendar className="h-3 w-3 opacity-40" />
                    <span>{new Date(rule.tanggal_mulai).toLocaleDateString('id-ID')}</span>
                    <span className="opacity-30">→</span>
                    <span>{new Date(rule.tanggal_akhir).toLocaleDateString('id-ID')}</span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge 
                    className={`font-black italic text-[9px] uppercase tracking-widest ${
                      isExpired 
                        ? "bg-red-500/10 text-red-600 border-red-200" 
                        : "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                    }`}
                  >
                    {isExpired ? "Expired" : "Active"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right pr-6 space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-primary hover:bg-primary/10" 
                    onClick={() => onEdit(rule)}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                    onClick={() => onDelete(rule.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};
