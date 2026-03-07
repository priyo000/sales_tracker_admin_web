import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { FileDown, Loader2 } from "lucide-react";
import { format } from "date-fns";
import api from "@/services/api";
import toast from "react-hot-toast";

interface ExportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JENIS_LAPORAN = [
  { id: "kunjungan-harian", name: "Kunjungan Harian", enabled: true },
  { id: "laporan-kinerja", name: "Laporan Kinerja", enabled: false },
];

const PERIODE_TYPE = [
  { id: "tanggal", name: "Pilih Tanggal (Range)" },
  { id: "bulanan", name: "Bulanan (Berdasarkan Kalender)" },
];

const MONTHS = [
  { id: "1", name: "Januari" },
  { id: "2", name: "Februari" },
  { id: "3", name: "Maret" },
  { id: "4", name: "April" },
  { id: "5", name: "Mei" },
  { id: "6", name: "Juni" },
  { id: "7", name: "Juli" },
  { id: "8", name: "Agustus" },
  { id: "9", name: "September" },
  { id: "10", name: "Oktober" },
  { id: "11", name: "November" },
  { id: "12", name: "Desember" },
];

export const ExportReportModal: React.FC<ExportReportModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const [jenisLaporan, setJenisLaporan] = useState("kunjungan-harian");
  const [periodeType, setPeriodeType] = useState("tanggal");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [loading, setLoading] = useState(false);

  const years = Array.from({ length: 5 }, (_, i) => String(new Date().getFullYear() - 2 + i));

  const handleExport = async () => {
    if (jenisLaporan !== "kunjungan-harian") {
      toast.error("Jenis laporan ini belum tersedia.");
      return;
    }

    const params: Record<string, string> = { type: periodeType };

    if (periodeType === "tanggal") {
      if (!dateRange?.from || !dateRange?.to) {
        toast.error("Silakan pilih rentang tanggal.");
        return;
      }
      params.start_date = format(dateRange.from, "yyyy-MM-dd");
      params.end_date = format(dateRange.to, "yyyy-MM-dd");
    } else {
      params.month = selectedMonth;
      params.year = selectedYear;
    }

    setLoading(true);
    try {
      const response = await api.get("/reports/export-kunjungan-harian", {
        params,
        responseType: "blob",
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      
      const contentDisposition = response.headers["content-disposition"];
      let fileName = "Laporan_Kunjungan_Harian.xlsx";
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length > 1) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Laporan berhasil diunduh.");
      onClose();
    } catch (error) {
      console.error("Export error:", error);
      const err = error as { response?: { data?: { text?: () => Promise<string> } } };
      const text = await err.response?.data?.text?.();
      let message = "Gagal mengunduh laporan.";
      try {
        if (text) {
          const res = JSON.parse(text);
          message = res.message || message;
        }
      } catch {
        // Ignore JSON parse error
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5 text-primary" />
            Export Laporan Kunjungan
          </DialogTitle>
          <DialogDescription>
            Pilih jenis laporan dan periode yang ingin Anda unduh dalam format Excel (.xlsx).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Jenis Laporan */}
          <div className="space-y-2">
            <Label htmlFor="jenis-laporan" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Jenis Laporan
            </Label>
            <Select value={jenisLaporan} onValueChange={setJenisLaporan}>
              <SelectTrigger id="jenis-laporan">
                <SelectValue placeholder="Pilih jenis laporan" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_LAPORAN.map((item) => (
                  <SelectItem key={item.id} value={item.id} disabled={!item.enabled}>
                    {item.name} {!item.enabled && "(Segera Hadir)"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Periode Type */}
          <div className="space-y-2">
            <Label htmlFor="periode-type" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pilihan Periode
            </Label>
            <div className="flex gap-2">
              {PERIODE_TYPE.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  variant={periodeType === item.id ? "default" : "outline"}
                  className="flex-1 text-xs"
                  onClick={() => setPeriodeType(item.id)}
                >
                  {item.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Configuration based on period type */}
          {periodeType === "tanggal" ? (
            <div className="space-y-2 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Rentang Tanggal
              </Label>
              <DatePickerWithRange 
                date={dateRange} 
                onChange={setDateRange} 
                className="w-full"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Bulan
                </Label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue placeholder="Bulan" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {MONTHS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Tahun
                </Label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tahun" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {years.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-4 border-t gap-2">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={loading || (periodeType === 'tanggal' && !dateRange?.from)}
            className="gap-2 min-w-[120px]"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            Download Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
