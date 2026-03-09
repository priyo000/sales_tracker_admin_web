import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, AlertCircle, Info } from "lucide-react";

interface ExportCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (statuses: string[]) => void;
  isLoading: boolean;
}

const STATUS_OPTIONS = [
  { id: "prospect", label: "Prospect" },
  { id: "pending", label: "Pending" },
  { id: "active", label: "Active" },
  { id: "rejected", label: "Rejected" },
  { id: "nonactive", label: "Non-Active" },
];

export const ExportCustomerModal: React.FC<ExportCustomerModalProps> = ({
  isOpen,
  onClose,
  onExport,
  isLoading,
}) => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

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
    onExport(selectedStatuses);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export Pelanggan ke Excel" size="md">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="pt-2 space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
               <AlertCircle className="h-3 w-3" /> Pilih Status Pelanggan
            </h3>
            <div className="rounded-xl border bg-card/50 p-3 space-y-2">
              <div className="flex items-center space-x-2 pb-2 border-b border-border/50">
                <Checkbox
                  id="select-all-customers"
                  checked={selectedStatuses.length === STATUS_OPTIONS.length}
                  onCheckedChange={toggleAll}
                  className="rounded-sm"
                />
                <label
                  htmlFor="select-all-customers"
                  className="text-[11px] font-bold uppercase tracking-tight cursor-pointer"
                >
                  Pilih Semua
                </label>
              </div>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                {STATUS_OPTIONS.map((status) => (
                  <div key={status.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`customer-status-${status.id}`}
                      checked={selectedStatuses.includes(status.id)}
                      onCheckedChange={() => toggleStatus(status.id)}
                      className="rounded-sm"
                    />
                    <label
                      htmlFor={`customer-status-${status.id}`}
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
