import React, { useState } from "react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertCircle } from "lucide-react";
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
      <div className="space-y-6">
        <div className="space-y-5">
          <div>
            <h3 className="text-sm font-medium leading-none">Pilih Tanggal Transaksi</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Pilih rentang tanggal transaksi yang ingin diexport.
            </p>
            <DatePickerWithRange date={dateRange} onChange={setDateRange} />
          </div>
          
          <div className="pt-2">
            <h3 className="text-sm font-medium leading-none">Pilih Status</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Pilih satu atau lebih status pesanan yang ingin Anda export. Kosongkan untuk mengekspor semua status.
            </p>

            <div className="rounded-lg border bg-card/50 p-4 space-y-3">
              <div className="flex items-center space-x-2 pb-3 border-b border-border/50">
                <Checkbox
                  id="select-all"
                  checked={selectedStatuses.length === STATUS_OPTIONS.length}
                  onCheckedChange={toggleAll}
                />
                <label
                  htmlFor="select-all"
                  className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  Pilih Semua
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-1">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.id}`}
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => toggleStatus(status.id)}
                    />
                    <label
                      htmlFor={`status-${status.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
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
          <div className="flex items-center gap-2 p-3 text-sm text-blue-700 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span>Semua status akan di-export karena tidak ada yang dipilih.</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            {isLoading ? "Memproses..." : "Download Excel"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
