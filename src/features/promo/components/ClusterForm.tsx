import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Type, FileText, CheckCircle2, LayoutGrid, X, Save } from "lucide-react";
import { useDivisi } from "@/features/divisi/hooks/useDivisi";
import { FormField } from "@/components/ui/FormField";
import { Divisi } from "@/features/divisi/types";
import { useAuth } from "@/hooks/useAuth";

import { PromoCluster } from "../types";

interface ClusterFormProps {
  initialData?: PromoCluster;
  onSubmit: (data: Record<string, unknown>) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const ClusterForm = ({ initialData, onSubmit, onCancel, loading }: ClusterFormProps) => {
  const { divisis, fetchDivisis } = useDivisi();
  const [formData, setFormData] = useState({
    nama_cluster: initialData?.nama_cluster || "",
    deskripsi: initialData?.deskripsi || "",
    is_aktif: initialData?.is_aktif ?? true,
    id_divisi: initialData?.id_divisi ? initialData.id_divisi.toString() : "null",
  });

  useEffect(() => {
    fetchDivisis();
  }, [fetchDivisis]);

  const { user } = useAuth();
  const isSuperOrCompanyAdmin = user?.peran === "super_admin" || user?.peran === "admin_perusahaan";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      is_aktif: formData.is_aktif ? 1 : 0,
      id_divisi: formData.id_divisi && formData.id_divisi !== "null" ? parseInt(formData.id_divisi) : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <div className="space-y-4">
        {isSuperOrCompanyAdmin && (
          <FormField label="Target Divisi" icon={LayoutGrid}>
            <Select 
              value={formData.id_divisi} 
              onValueChange={(val) => setFormData({ ...formData, id_divisi: val })}
            >
              <SelectTrigger className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold">
                <SelectValue placeholder="Global (Semua Divisi)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="null">Global (Semua Divisi)</SelectItem>
                {divisis.map((d: Divisi) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    {d.nama_divisi}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground/60 mt-1 italic">
              Super Admin & Owner bisa menentukan scope cluster ini.
            </p>
          </FormField>
        )}

        <FormField label="Nama Cluster" icon={Type} required>
          <Input
            value={formData.nama_cluster}
            onChange={(e) => setFormData({ ...formData, nama_cluster: e.target.value })}
            placeholder="Contoh: GROSIR LEVEL 1, VIP CUSTOMER..."
            className="h-9 bg-card border-border/50 shadow-sm text-[13px] font-semibold"
            required
          />
        </FormField>

        <FormField label="Deskripsi Cluster" icon={FileText}>
          <Textarea
            value={formData.deskripsi}
            onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
            placeholder="Jelaskan kriteria pelanggan untuk cluster ini..."
            className="bg-card border-border/50 shadow-sm text-[13px] font-semibold min-h-[80px] resize-none"
          />
        </FormField>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div className="space-y-0.5">
              <Label className="text-[11px] font-bold uppercase tracking-tight">Status Aktif</Label>
              <p className="text-[9px] text-muted-foreground uppercase opacity-70">Cluster dapat digunakan di promo</p>
            </div>
          </div>
          <Switch
            checked={formData.is_aktif}
            onCheckedChange={(val) => setFormData({ ...formData, is_aktif: val })}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t font-semibold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground rounded-lg"
          disabled={loading}
        >
          <X className="mr-2 h-3.5 w-3.5" /> Batal
        </Button>
        <Button
          type="submit"
          className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider shadow-md shadow-primary/20 bg-primary hover:bg-primary/90 text-white rounded-lg"
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {initialData ? "Update Cluster" : "Simpan Cluster"}
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
