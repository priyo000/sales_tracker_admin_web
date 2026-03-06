import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertCircle, Info } from "lucide-react";
import { DateRange } from "react-day-picker";
import { format as formatFile } from "date-fns";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

interface ExportOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (statuses: string[], dateRange: {startDate: string, endDate: string}) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { id: "pending", label: "Pending" },
  { id: "proses", label: "Proses" },
  { id: "dikirim", label: "Dikirim" },
  { id: "sukses", label: "Sukses" },
  { id: "batal", label: "Batal" },
];

export const ExportOrderModal: React.FC<ExportOrderModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isLoading,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const toggleStatus = (statusId: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(statusId)
        ? prev.filter((id) => id !== statusId)
        : [...prev, statusId]
    );
  };

  const toggleAll = () => {
    if (selectedStatuses.length === STATUS_OPTIONS.length) {
      setSelectedStatuses([]);
    } else {
      setSelectedStatuses(STATUS_OPTIONS.map((s) => s.id));
    }
  };

  const handleExport = () => {
    const startDate = dateRange?.from ? formatFile(dateRange.from, "yyyy-MM-dd") : "";
    const endDate = dateRange?.to ? formatFile(dateRange.to, "yyyy-MM-dd") : "";
    
    onExport(selectedStatuses, { startDate, endDate });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Pesanan ke Excel" size="md">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-3 w-3" /> Rentang Tanggal
            </h3>
            <DatePickerWithRange date={dateRange} onChange={setDateRange} className="w-full" />
          </div>
          
          <div className="pt-2 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pilih Status</h3>
            <div className="rounded-xl border bg-card/50 p-3 space-y-2">
              <div className="flex items-center space-x-2 pb-2 border-b border-border/50">
                <Checkbox
                  id="select-all"
                  checked={selectedStatuses.length === STATUS_OPTIONS.length}
                  onCheckedChange={toggleAll}
                  className="rounded-sm"
                />
                <label
                  htmlFor="select-all"
                  className="text-[11px] font-bold uppercase tracking-tight cursor-pointer"
                >
                  Pilih Semua
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => toggleStatus(status.id)}
                      className="rounded-sm"
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="text-[10px] font-semibold cursor-pointer"
                    >
                      {status.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {selectedStatuses.length === 0 && (
          <div className="flex items-center gap-2 p-2 text-[9px] font-bold uppercase tracking-tight text-blue-700 bg-blue-50/50 rounded-lg border border-blue-100 italic">
            <Info className="h-3 w-3" />
            <span>Semua status akan di-export otomatis.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={isLoading}
            className="h-9 px-6 text-[10px] font-bold uppercase tracking-wider text-muted-foreground rounded-lg"
          >
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isLoading}
            className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white rounded-lg gap-2 shadow-md shadow-primary/20"
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            {isLoading ? "Memproses..." : "Download Excel"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
