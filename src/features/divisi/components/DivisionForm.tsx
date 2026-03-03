import React, { useState } from "react";
import { DivisiFormData } from "../types";
import {
  Building2,
  LocateFixed,
  Shield,
  LucideIcon,
  Save,
  X,
  User,
  Users,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DivisionFormProps {
  initialData?: DivisiFormData;
  onSubmit: (data: DivisiFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const FormField = ({
  label,
  required,
  children,
  icon: Icon,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
}) => (
  <div className="space-y-2">
    <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">
      {Icon && <Icon className="h-3 w-3 text-primary" />}
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
  </div>
);

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
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        <FormField label="Nama Divisi" icon={Building2} required>
          <Input
            type="text"
            required
            className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
            placeholder="Contoh: Sales & Marketing, Gudang, Logistik..."
            value={namaDivisi}
            onChange={(e) => setNamaDivisi(e.target.value)}
          />
        </FormField>

        <FormField label="Radiu Toleransi Check-in" icon={LocateFixed} required>
          <div className="relative">
            <Input
              type="number"
              min="0"
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold pr-16"
              placeholder="Contoh: 100"
              value={radiusToleransi}
              onChange={(e) => setRadiusToleransi(Number(e.target.value))}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <span className="text-[10px] font-black uppercase text-muted-foreground">
                meter
              </span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground font-medium italic mt-1 uppercase tracking-tight">
            * Maksimal jarak yang diperbolehkan saat sales check-in di lokasi
            toko.
          </p>
        </FormField>

        <FormField
          label="Jangkauan Data Pelanggan (View Scope)"
          icon={Shield}
          required
        >
          <div className="grid grid-cols-1 gap-3">
            {[
              {
                id: "SELF",
                label: "Hanya Diri Sendiri",
                desc: "Sales hanya melihat pelanggan miliknya sendiri.",
                icon: User,
              },
              {
                id: "DIVISION",
                label: "Satu Divisi",
                desc: "Sales melihat semua pelanggan dalam satu divisi.",
                icon: Users,
              },
              {
                id: "COMPANY",
                label: "Satu Perusahaan",
                desc: "Sales melihat semua data pelanggan perusahaan.",
                icon: Globe,
              },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  setViewScope(opt.id as "SELF" | "DIVISION" | "COMPANY")
                }
                className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                  viewScope === opt.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border/50 bg-card hover:bg-muted/50"
                }`}
              >
                <div
                  className={`p-2.5 rounded-xl ${viewScope === opt.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                >
                  <opt.icon className="h-4 w-4" />
                </div>
                <div>
                  <span
                    className={`block text-xs font-black uppercase tracking-tight ${viewScope === opt.id ? "text-primary" : "text-foreground"}`}
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

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-12 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Simpan Perubahan" : "Tambah Divisi Sekarang"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};

export default DivisionForm;
