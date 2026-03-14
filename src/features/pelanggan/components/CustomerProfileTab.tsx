import React from "react";
import {
  User,
  Phone,
  MapPin,
  Camera,
  Store,
  Info,
  Smartphone,
  Layers,
  CheckCircle2,
  X,
} from "lucide-react";
import MapPicker from "./MapPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PelangganFormData } from "../types";

interface FilterOption {
  id: number;
  nama_lengkap: string;
  jabatan: string;
  id_divisi?: number;
}

interface CustomerProfileTabProps {
  formData: PelangganFormData;
  onChange: (name: string, value: string | number) => void;
  onLocationSelect: (
    lat: number,
    lng: number,
    address?: string,
    city?: string,
    district?: string,
    state?: string,
  ) => void;
  previews: { foto_toko: string | null; foto_ktp: string | null };
  onFileChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "foto_toko" | "foto_ktp",
  ) => void;
  onClearFile: (type: "foto_toko" | "foto_ktp") => void;
  filterOptions: FilterOption[];
  onSalesChange: (val: string) => void;
  divisis: Array<{ id: number; nama_divisi: string }>;
  user: { karyawan?: { id_divisi?: number } } | null;
}

export const CustomerProfileTab: React.FC<CustomerProfileTabProps> = ({
  formData,
  onChange,
  onLocationSelect,
  previews,
  onFileChange,
  onClearFile,
  divisis,
  user,
}) => (
  <div className="space-y-6">
    {/* Toko Info Card */}
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <div className="h-1.5 bg-primary" />
      <CardContent className="p-6 space-y-6">
        <SectionHeader
          icon={Store}
          title="Informasi Toko / Outlet"
          description="Data dasar pelanggan"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormField label="Nama Toko / Outlet" icon={Store} required>
              <Input
                placeholder="Contoh: Toko Berkah Jaya"
                value={formData.nama_toko}
                onChange={(e) => onChange("nama_toko", e.target.value)}
                required
                className="h-9 bg-muted/30 border-border/50 text-sm font-semibold focus-visible:ring-primary shadow-sm"
              />
            </FormField>

            <FormField label="Pemilik / Penanggung Jawab" icon={User} required>
              <Input
                placeholder="Nama Lengkap Pemilik"
                value={formData.nama_pemilik}
                onChange={(e) => onChange("nama_pemilik", e.target.value)}
                required
                className="h-9 bg-muted/30 border-border/50 text-sm font-semibold focus-visible:ring-primary shadow-sm"
              />
            </FormField>

            <FormField label="Kategori / Klasifikasi" icon={Layers}>
              <Select
                value={formData.klasifikasi_outlet}
                onValueChange={(val) => onChange("klasifikasi_outlet", val)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grosir">Grosir</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Distributor">Distributor</SelectItem>
                  <SelectItem value="Proyek">Proyek</SelectItem>
                  <SelectItem value="Lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </FormField>

            {formData.id_sales_pembuat === null &&
              !user?.karyawan?.id_divisi && (
                <FormField
                  label="Tentukan Divisi Pelanggan"
                  icon={Layers}
                  required
                >
                  <Select
                    value={formData.id_divisi.toString()}
                    onValueChange={(val) =>
                      onChange("id_divisi", parseInt(val))
                    }
                    required
                  >
                    <SelectTrigger className="h-9 bg-amber-50 border-amber-200 shadow-sm font-semibold text-amber-700 animate-pulse-subtle">
                      <SelectValue placeholder="Pilih Divisi" />
                    </SelectTrigger>
                    <SelectContent>
                      {divisis.map((div) => (
                        <SelectItem key={div.id} value={div.id.toString()}>
                          {div.nama_divisi}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              )}

            <FormField label="Status Outlet" icon={CheckCircle2}>
              <Select
                value={formData.status}
                onValueChange={(val) => onChange("status", val)}
              >
                <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">🟢 Active</SelectItem>
                  <SelectItem value="pending">🟡 Pending</SelectItem>
                  <SelectItem value="nonactive">🔴 Inactive</SelectItem>
                  <SelectItem value="rejected">⚫ Rejected</SelectItem>
                  <SelectItem value="prospect">🔵 Prospect</SelectItem>
                </SelectContent>
              </Select>
            </FormField>
          </div>

          <div className="space-y-4">
            <div className="pt-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                Foto Toko / Lokasi
              </label>
              <div className="relative group w-full aspect-video rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted/10 shadow-lg transition-all hover:bg-muted/20 hover:border-primary/50">
                {previews.foto_toko ? (
                  <>
                    <img
                      src={previews.foto_toko}
                      alt="Preview Toko"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                      <div className="flex gap-2">
                        <label className="h-9 w-9 bg-white text-primary hover:bg-white/90 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-transform hover:scale-110 active:scale-95">
                          <Camera className="h-4 w-4" />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => onFileChange(e, "foto_toko")}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => onClearFile("foto_toko")}
                          className="h-9 w-9 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer transition-colors">
                    <div className="p-4 bg-primary/10 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                      <Camera className="h-8 w-8 text-primary opacity-70" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">
                      Upload Foto Toko
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => onFileChange(e, "foto_toko")}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    {/* Contact Info Card */}
    <Card className="border border-border/50 shadow-sm bg-card">
      <CardContent className="p-6 space-y-6">
        <SectionHeader
          icon={Phone}
          title="Kontak & Komunikasi"
          description="Data komunikasi aktif"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="WhatsApp / No HP" icon={Smartphone} required>
            <Input
              placeholder="0812XXXXXXXX"
              value={formData.no_hp_pribadi}
              onChange={(e) => onChange("no_hp_pribadi", e.target.value)}
              required
              className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
            />
          </FormField>

          <FormField label="Telepon Kantor" icon={Phone}>
            <Input
              placeholder="(021) XXXXXXXX"
              value={formData.no_hp_kontak || ""}
              onChange={(e) => onChange("no_hp_kontak", e.target.value)}
              className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
            />
          </FormField>

          <FormField label="Nama Kontak Person" icon={User}>
            <Input
              placeholder="Nama Kontak person"
              value={formData.nama_kontak_person || ""}
              onChange={(e) => onChange("nama_kontak_person", e.target.value)}
              className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
            />
          </FormField>
        </div>
      </CardContent>
    </Card>

    {/* Location Card */}
    <Card className="border border-border/50 shadow-sm bg-card overflow-hidden">
      <CardContent className="p-6 space-y-6">
        <SectionHeader
          icon={MapPin}
          title="Alamat & Geolocation"
          description="Lokasi fisik outlet dan koordinat peta"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <FormField label="Alamat Lengkap Usaha" icon={MapPin} required>
              <Textarea
                placeholder="Jalan, Blok, Nomor, Kelurahan, Kecamatan, Kota"
                value={formData.alamat_usaha}
                onChange={(e) => onChange("alamat_usaha", e.target.value)}
                required
                rows={3}
                className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <FormField label="Kecamatan">
                <Input
                  value={formData.kecamatan_usaha || ""}
                  onChange={(e) => onChange("kecamatan_usaha", e.target.value)}
                  placeholder="Kecamatan"
                  className="h-9 bg-muted/30 border-border/50 text-xs font-semibold"
                />
              </FormField>
              <FormField label="Kota / Kabupaten">
                <Input
                  value={formData.kota_usaha || ""}
                  onChange={(e) => onChange("kota_usaha", e.target.value)}
                  placeholder="Kota"
                  className="h-9 bg-muted/30 border-border/50 text-xs font-semibold"
                />
              </FormField>
              <FormField label="Provinsi">
                <Input
                  value={formData.provinsi_usaha || ""}
                  onChange={(e) => onChange("provinsi_usaha", e.target.value)}
                  placeholder="Provinsi"
                  className="h-9 bg-muted/30 border-border/50 text-xs font-semibold"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField label="Latitude" icon={MapPin}>
                <Input
                  value={formData.latitude.toString()}
                  readOnly
                  placeholder="0.000000"
                  className="h-9 bg-muted/30 border-border/50 text-[10px] font-mono"
                />
              </FormField>
              <FormField label="Longitude" icon={MapPin}>
                <Input
                  value={formData.longitude.toString()}
                  readOnly
                  placeholder="0.000000"
                  className="h-9 bg-muted/30 border-border/50 text-[10px] font-mono"
                />
              </FormField>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex gap-2 italic">
              <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[9px] text-amber-700 font-semibold uppercase tracking-tight leading-relaxed">
                Pastikan Pin Lokasi Di Peta Akurat. Digunakan untuk verifikasi
                kunjungan sales.
              </p>
            </div>
          </div>

          <div className="h-[350px] rounded-xl overflow-hidden border-2 border-border/50 shadow-inner group transition-all hover:border-primary/30">
            <MapPicker
              lat={formData.latitude}
              lng={formData.longitude}
              onChange={onLocationSelect}
              hideSearch={false}
              height="h-full"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);

export default CustomerProfileTab;
