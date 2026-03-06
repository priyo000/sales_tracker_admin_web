import React, { useState } from "react";
import { DivisiFormData } from "../types";
import {
  Building2,
  LocateFixed,
  Shield,
  Save,
  X,
  User,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/FormField";

interface DivisionFormProps {
  initialData?: DivisiFormData;
  onSubmit: (data: DivisiFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const DivisionForm: React.FC<DivisionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [namaDivisi, setNamaDivisi] = useState(initialData?.nama_divisi || "");
  const [radiusToleransi, setRadiusToleransi] = useState(
    initialData?.radius_toleransi || 100,
  );
  const [viewScope, setViewScope] = useState<"SELF" | "DIVISION" | "COMPANY">(
    initialData?.view_scope || "SELF",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nama_divisi: namaDivisi,
      radius_toleransi: radiusToleransi,
      view_scope: viewScope,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-4">
        <FormField label="Nama Divisi" icon={Building2} required>
          <Input
            type="text"
            required
            className="h-10 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-semibold"
            placeholder="Sales, Marketing, Gudang..."
            value={namaDivisi}
            onChange={(e) => setNamaDivisi(e.target.value)}
          />
        </FormField>

        <FormField 
          label="Radius Toleransi (Meter)" 
          icon={LocateFixed} 
          required
          description="* Jarak maksimal check-in."
        >
          <div className="relative">
            <Input
              type="number"
              min="0"
              required
              className="h-10 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-semibold pr-16"
              placeholder="100"
              value={radiusToleransi}
              onChange={(e) => setRadiusToleransi(Number(e.target.value))}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                meter
              </span>
            </div>
          </div>
        </FormField>

        <FormField
          label="Jangkauan Data Pelanggan"
          icon={Shield}
          required
        >
          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: "SELF",
                label: "Hanya Diri Sendiri",
                desc: "Hanya pelanggan milik sales tersebut.",
                icon: User,
              },
              {
                id: "DIVISION",
                label: "Satu Divisi",
                desc: "Semua pelanggan dalam divisi ini.",
                icon: Users,
              },
              {
                id: "COMPANY",
                label: "Satu Perusahaan",
                desc: "Semua data pelanggan perusahaan.",
                icon: Globe,
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setViewScope(opt.id as "SELF" | "DIVISION" | "COMPANY")
                }
                className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                  viewScope === opt.id
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border/50 bg-card hover:bg-muted/50"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${viewScope === opt.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <opt.icon className="h-3.5 w-3.5" />
                </div>
                <div>
                  <span
                    className={`block text-[11px] font-bold uppercase tracking-tight ${viewScope === opt.id ? "text-primary" : "text-foreground"}`}
                  >
                    {opt.label}
                  </span>
                  <span className="block text-[10px] text-muted-foreground font-medium mt-0.5">
                    {opt.desc}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </FormField>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t font-semibold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-10 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          disabled={loading}
        >
          <X className="mr-2 h-3.5 w-3.5" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-10 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Simpan Perubahan" : "Simpan Divisi"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default DivisionForm;
