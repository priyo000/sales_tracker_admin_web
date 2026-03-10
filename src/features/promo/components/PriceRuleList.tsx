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

interface PriceRuleListProps {
  rules: PromoAturanHarga[];
  loading: boolean;
}

export const PriceRuleList = ({ rules, loading }: PriceRuleListProps) => {
  if (loading && rules.length === 0) {
    return <div className="p-8 text-center text-muted-foreground italic">Memuat data aturan harga...</div>;
  }

  if (rules.length === 0) {
    return <div className="p-8 text-center text-muted-foreground italic">Belum ada aturan harga khusus.</div>;
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-bold">Produk</TableHead>
            <TableHead className="font-bold">Cluster</TableHead>
            <TableHead className="font-bold">Aturan</TableHead>
            <TableHead className="font-bold">Masa Berlaku</TableHead>
            <TableHead className="font-bold text-center">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule) => (
            <TableRow key={rule.id} className="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div className="font-semibold">{rule.produk?.nama_produk || 'Produk Unknown'}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{rule.produk?.sku}</div>
              </TableCell>
              <TableCell>
                {rule.cluster ? (
                  <Badge variant="outline" className="font-medium bg-blue-50 text-blue-700 border-blue-200">
                    {rule.cluster.nama_cluster}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="font-medium">Semua Pelanggan</Badge>
                )}
              </TableCell>
              <TableCell>
                {rule.harga_manual ? (
                  <div className="font-bold text-primary">
                    {formatCurrency(parseFloat(rule.harga_manual))}
                  </div>
                ) : (
                  <div className="font-bold text-orange-600">
                    Potongan {rule.diskon_persen}%
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div className="text-xs">
                  {new Date(rule.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(rule.tanggal_akhir).toLocaleDateString('id-ID')}
                </div>
              </TableCell>
              <TableCell className="text-center">
                {new Date(rule.tanggal_akhir) >= new Date() ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200">Aktif</Badge>
                ) : (
                  <Badge variant="destructive" className="bg-red-50 text-red-600 border-red-200">Expired</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
