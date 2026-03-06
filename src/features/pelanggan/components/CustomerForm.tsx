import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Camera,
  CreditCard,
  Briefcase,
  Store,
  Info,
  Smartphone,
  Shield,
  Clock,
  Landmark,
  Image as LucideImage,
  Calendar,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { usePelanggan } from "../hooks/usePelanggan";
import { Pelanggan, PelangganFormData } from "../types";
import { BASE_URL } from "../../../services/api";
import MapPicker from "../../../components/ui/MapPicker";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormField } from "@/components/ui/FormField";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

interface CustomerFormProps {
  initialData?: Pelanggan | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FilterOption {
  id: number;
  nama_lengkap: string;
  jabatan: string;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const isEdit = !!initialData;
  const { divisis, fetchDivisis } = useDivisi();
  const { fetchFilterOptions } = usePelanggan();
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [activeTab, setActiveTab] = useState("profil");

  useEffect(() => {
    fetchDivisis();
    const loadSales = async () => {
      const options = await fetchFilterOptions();
      setFilterOptions(options as FilterOption[]);
    };
    loadSales();
  }, [fetchDivisis, fetchFilterOptions]);

  const [formData, setFormData] = useState<PelangganFormData>({
    nama_toko: initialData?.nama_toko || "",
    nama_pemilik: initialData?.nama_pemilik || "",
    id_divisi: initialData?.id_divisi?.toString() || "",
    email: initialData?.email || "",
    no_telp: initialData?.no_telp || "",
    no_hp: initialData?.no_hp || "",
    alamat_usaha: initialData?.alamat_usaha || "",
    latitude: initialData?.latitude?.toString() || "",
    longitude: initialData?.longitude?.toString() || "",
    cara_pembayaran: initialData?.cara_pembayaran || "Cash",
    sistem_pembayaran: initialData?.sistem_pembayaran || "Cash",
    limit_kredit_awal: initialData?.limit_kredit_awal?.toString() || "0",
    top_hari: initialData?.top_hari?.toString() || "0",
    nama_bank: initialData?.nama_bank || "",
    no_rekening: initialData?.no_rekening || "",
    atas_nama_rekening: initialData?.atas_nama_rekening || "",
    cabang_bank: initialData?.cabang_bank || "",
    catatan_lain: initialData?.catatan_lain || "",
    id_sales_pembuat: initialData?.id_sales_pembuat?.toString() || "",
    status: initialData?.status || "active",
  });

  const [files, setFiles] = useState<{
    foto_toko: File | null;
    foto_ktp: File | null;
  }>({
    foto_toko: null,
    foto_ktp: null,
  });

  const [previews, setPreviews] = useState<{
    foto_toko: string | null;
    foto_ktp: string | null;
  }>({
    foto_toko: initialData?.foto_toko
      ? initialData.foto_toko.startsWith("http")
        ? initialData.foto_toko
        : `${BASE_URL}/storage/${initialData.foto_toko}`
      : null,
    foto_ktp: initialData?.foto_ktp
      ? initialData.foto_ktp.startsWith("http")
        ? initialData.foto_ktp
        : `${BASE_URL}/storage/${initialData.foto_ktp}`
      : null,
  });

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "foto_toko" | "foto_ktp",
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({ ...prev, [type]: file }));
      setPreviews((prev) => ({ ...prev, [type]: URL.createObjectURL(file) }));
    }
  };

  const clearFile = (type: "foto_toko" | "foto_ktp") => {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setPreviews((prev) => ({
      ...prev,
      [type]: initialData?.[type]
        ? initialData[type]!.startsWith("http")
          ? initialData[type]!
          : `${BASE_URL}/storage/${initialData[type]}`
        : null,
    }));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        data.append(key, value);
      }
    });

    if (files.foto_toko) data.append("foto_toko", files.foto_toko);
    if (files.foto_ktp) data.append("foto_ktp", files.foto_ktp);

    if (isEdit) data.append("_method", "PUT");

    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-[85vh] -m-6 mt-0">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col flex-1"
      >
        <div className="px-6 py-4 bg-background border-b border-border/50 sticky top-0 z-10">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto h-12 bg-muted/50 p-1.5 rounded-2xl">
            <TabsTrigger
              value="profil"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black text-[10px] uppercase tracking-widest gap-2"
            >
              <Building2 className="h-4 w-4" /> Profil & Alamat
            </TabsTrigger>
            <TabsTrigger
              value="administrasi"
              className="rounded-xl data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg transition-all font-black text-[10px] uppercase tracking-widest gap-2"
            >
              <Shield className="h-4 w-4" /> Administrasi & Finansial
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-8 max-w-5xl mx-auto pb-12">
              <TabsContent value="profil" className="m-0 space-y-10 focus:outline-none">
                {/* Toko Info Card */}
                <Card className="border-none shadow-2xl bg-card overflow-hidden">
                  <div className="h-2 bg-primary" />
                  <CardContent className="p-8 space-y-8">
                    <SectionHeader
                      icon={Store}
                      title="Informasi Toko / Outlet"
                      description="Data dasar pelanggan dan identitas outlet"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <FormField label="Nama Toko / Outlet" icon={Store} required>
                          <Input
                            placeholder="Contoh: Toko Berkah Jaya"
                            value={formData.nama_toko}
                            onChange={(e) => handleChange("nama_toko", e.target.value)}
                            required
                            className="h-12 bg-muted/30 border-border/50 text-sm font-bold focus-visible:ring-primary shadow-sm"
                          />
                        </FormField>

                        <FormField label="Pemilik / Penanggung Jawab" icon={User} required>
                          <Input
                            placeholder="Nama Lengkap Pemilik"
                            value={formData.nama_pemilik}
                            onChange={(e) => handleChange("nama_pemilik", e.target.value)}
                            required
                            className="h-12 bg-muted/30 border-border/50 text-sm font-bold focus-visible:ring-primary shadow-sm"
                          />
                        </FormField>

                        <FormField label="Divisi Bisnis" icon={Layers} required>
                          <Select
                            value={formData.id_divisi}
                            onValueChange={(val) => handleChange("id_divisi", val)}
                            required
                          >
                            <SelectTrigger className="h-12 bg-muted/30 border-border/50 shadow-sm font-bold">
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
                      </div>

                      <div className="space-y-6">
                        <div className="grid grid-cols-1 gap-6">
                          <FormField label="Status Outlet" icon={CheckCircle2}>
                            <Select
                              value={formData.status}
                              onValueChange={(val) => handleChange("status", val)}
                            >
                              <SelectTrigger className="h-12 bg-muted/30 border-border/50 shadow-sm font-bold">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">🟢 Active</SelectItem>
                                <SelectItem value="pending">🟡 Pending</SelectItem>
                                <SelectItem value="inactive">🔴 Inactive</SelectItem>
                                <SelectItem value="blacklist">⚫ Blacklist</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>

                        <div className="flex flex-col items-center gap-4 p-6 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50 group transition-all hover:bg-muted/30">
                          <div className="relative h-40 w-full rounded-xl overflow-hidden shadow-md">
                            {previews.foto_toko ? (
                              <>
                                <img
                                  src={previews.foto_toko}
                                  alt="Preview Toko"
                                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => clearFile("foto_toko")}
                                    className="rounded-full"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer bg-muted/10">
                                <Camera className="h-10 w-10 text-muted-foreground group-hover:text-primary transition-colors" />
                                <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                  Upload Foto Toko
                                </span>
                                <input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => handleFileChange(e, "foto_toko")}
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
                <Card className="border-none shadow-xl bg-card">
                  <CardContent className="p-8 space-y-8">
                    <SectionHeader
                      icon={Phone}
                      title="Kontak & Komunikasi"
                      description="Nomor telepon dan alamat email aktif"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField label="WhatsApp / No HP" icon={Smartphone} required>
                        <Input
                          placeholder="0812XXXXXXXX"
                          value={formData.no_hp}
                          onChange={(e) => handleChange("no_hp", e.target.value)}
                          required
                          className="h-12 bg-muted/30 border-border/50 text-sm font-bold"
                        />
                      </FormField>

                      <FormField label="Telepon Kantor" icon={Phone}>
                        <Input
                          placeholder="(021) XXXXXXXX"
                          value={formData.no_telp}
                          onChange={(e) => handleChange("no_telp", e.target.value)}
                          className="h-12 bg-muted/30 border-border/50 text-sm font-bold"
                        />
                      </FormField>

                      <FormField label="Email" icon={Mail}>
                        <Input
                          type="email"
                          placeholder="outlet@email.com"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className="h-12 bg-muted/30 border-border/50 text-sm font-bold"
                        />
                      </FormField>
                    </div>
                  </CardContent>
                </Card>

                {/* Location Card */}
                <Card className="border-none shadow-xl bg-card overflow-hidden">
                  <CardContent className="p-8 space-y-8">
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
                            onChange={(e) => handleChange("alamat_usaha", e.target.value)}
                            required
                            rows={4}
                            className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none"
                          />
                        </FormField>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField label="Latitude" icon={MapPin}>
                            <Input
                              value={formData.latitude}
                              readOnly
                              placeholder="0.000000"
                              className="h-11 bg-muted/30 border-border/50 text-xs font-mono"
                            />
                          </FormField>
                          <FormField label="Longitude" icon={MapPin}>
                            <Input
                              value={formData.longitude}
                              readOnly
                              placeholder="0.000000"
                               className="h-11 bg-muted/30 border-border/50 text-xs font-mono"
                            />
                          </FormField>
                        </div>
                        <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3 italic">
                          <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tight leading-relaxed">
                            Pastikan Pin Lokasi Di Peta Akurat. Ini Akan Mempengaruhi Rute Kunjungan Sales Dan Verifikasi Check-in.
                          </p>
                        </div>
                      </div>

                      <div className="relative h-[400px] rounded-2xl overflow-hidden border-2 border-border/50 shadow-inner group">
                        <MapPicker
                          onLocationSelect={handleLocationSelect}
                          initialLat={
                            formData.latitude
                              ? Number(formData.latitude)
                              : undefined
                          }
                          initialLng={
                            formData.longitude
                              ? Number(formData.longitude)
                              : undefined
                          }
                        />
                        <div className="absolute top-4 left-4 right-4 z-[1000] pointer-events-none">
                          <div className="bg-white/90 backdrop-blur shadow-lg border border-border/50 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary text-center">
                            Geser Pin Untuk Menentukan Lokasi
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="administrasi" className="m-0 space-y-10 focus:outline-none">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                  <div className="space-y-10">
                    {/* Payment Settings Card */}
                    <Card className="border-none shadow-xl bg-card">
                      <CardContent className="p-8 space-y-6">
                        <SectionHeader
                          icon={CreditCard}
                          title="Kebijakan Pembayaran"
                          description="Pengaturan termin dan limit transaksi"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <FormField label="Metode Transaksi" icon={Briefcase}>
                            <Select
                              value={formData.cara_pembayaran}
                              onValueChange={(val) => handleChange("cara_pembayaran", val)}
                            >
                              <SelectTrigger className="h-12 bg-muted/30 border-border/50 shadow-sm font-bold">
                                <SelectValue placeholder="Pilih Cara" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash / Tunai</SelectItem>
                                <SelectItem value="Transfer">Transfer Bank</SelectItem>
                                <SelectItem value="Giro">Giro / Cek</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          <FormField label="Tipe Pembayaran" icon={Shield}>
                            <Select
                              value={formData.sistem_pembayaran}
                              onValueChange={(val) => handleChange("sistem_pembayaran", val)}
                            >
                              <SelectTrigger className="h-12 bg-muted/30 border-border/50 shadow-sm font-bold">
                                <SelectValue placeholder="Pilih Sistem" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash (Lunas Langsung)</SelectItem>
                                <SelectItem value="Kredit">Kredit (Tempo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          {formData.sistem_pembayaran === "Kredit" && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-primary/5 rounded-2xl border border-primary/20 animate-in zoom-in-95 duration-500 shadow-inner">
                              <FormField label="Limit Kredit Awal" icon={CreditCard}>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">Rp</span>
                                  <Input
                                    type="number"
                                    value={formData.limit_kredit_awal}
                                    onChange={(e) => handleChange("limit_kredit_awal", e.target.value)}
                                    className="h-12 pl-12 bg-card border-border/50 text-sm font-bold"
                                  />
                                </div>
                              </FormField>

                              <FormField label="Durasi Jatuh Tempo" icon={Clock}>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={formData.top_hari}
                                    onChange={(e) => handleChange("top_hari", e.target.value)}
                                    className="h-12 pr-14 bg-card border-border/50 text-sm font-bold"
                                  />
                                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground uppercase">Hari</span>
                                </div>
                              </FormField>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bank Account Info Card */}
                    {(formData.cara_pembayaran === "Transfer" || formData.cara_pembayaran === "Giro") && (
                      <Card className="border-none shadow-xl bg-card animate-in slide-in-from-left-4 duration-500">
                        <CardContent className="p-8 space-y-6">
                          <SectionHeader
                            icon={Landmark}
                            title="Detail Rekening Bank"
                            description="Informasi rekening untuk pelaporan transfer"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                            <FormField label="Nama Bank">
                              <Input
                                placeholder="Misal: BCA, Mandiri, BRI"
                                value={formData.nama_bank}
                                onChange={(e) => handleChange("nama_bank", e.target.value)}
                                className="h-11 bg-muted/30 border-border/50 text-sm font-bold"
                              />
                            </FormField>
                            <FormField label="Kantor Cabang">
                              <Input
                                placeholder="Nama Cabang"
                                value={formData.cabang_bank}
                                onChange={(e) => handleChange("cabang_bank", e.target.value)}
                                className="h-11 bg-muted/30 border-border/50 text-sm font-bold"
                              />
                            </FormField>
                            <FormField label="Nomor Rekening">
                              <Input
                                placeholder="XXXXXXXXXXXX"
                                value={formData.no_rekening}
                                onChange={(e) => handleChange("no_rekening", e.target.value)}
                                className="h-11 bg-muted/30 border-border/50 font-mono text-sm font-bold tracking-widest"
                              />
                            </FormField>
                            <FormField label="Atas Nama Pemilik">
                              <Input
                                placeholder="Nama sesuai buku tabungan"
                                value={formData.atas_nama_rekening}
                                onChange={(e) => handleChange("atas_nama_rekening", e.target.value)}
                                className="h-11 bg-muted/30 border-border/50 text-sm font-bold"
                              />
                            </FormField>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-10">
                    {/* Sales Assignment Card */}
                    <Card className="border-none shadow-xl bg-card">
                      <CardContent className="p-8 space-y-6">
                        <SectionHeader
                          icon={User}
                          title="Penanggung Jawab Sales"
                          description="Tentukan sales person utama untuk outlet ini"
                        />

                        <div className="pt-4">
                           <FormField label="Sales Representative" icon={User} required>
                            <Select
                              value={formData.id_sales_pembuat}
                              onValueChange={(val) => handleChange("id_sales_pembuat", val)}
                              required
                            >
                              <SelectTrigger className="h-12 bg-muted/30 border-border/50 shadow-sm font-bold">
                                <SelectValue placeholder="Pilih Sales Person" />
                              </SelectTrigger>
                              <SelectContent>
                                {filterOptions.map((opt) => (
                                  <SelectItem key={opt.id} value={opt.id.toString()}>
                                    {opt.nama_lengkap} ({opt.jabatan || "Sales"})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormField>
                        </div>
                      </CardContent>
                    </Card>

                    {/* KTP Card */}
                    <Card className="border-none shadow-xl bg-card">
                      <CardContent className="p-8 space-y-6">
                        <SectionHeader
                          icon={LucideImage}
                          title="Dokumen Identitas"
                          description="Foto KTP pemilik untuk verifikasi administrasi"
                        />

                        <div className="pt-4">
                           <div className="flex flex-col items-center gap-4 p-8 bg-muted/20 rounded-2xl border-2 border-dashed border-border/50 group transition-all hover:bg-muted/30">
                            <div className="relative h-48 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl bg-black/5">
                              {previews.foto_ktp ? (
                                <>
                                  <img
                                    src={previews.foto_ktp}
                                    alt="Preview KTP"
                                    className="h-full w-full object-contain transition-transform group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => clearFile("foto_ktp")}
                                      className="rounded-full"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
                                  <LucideImage className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors mb-3 opacity-50" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center px-4">
                                    Ambil Foto KTP (Landscape)
                                  </span>
                                  <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange(e, "foto_ktp")}
                                  />
                                </label>
                              )}
                            </div>
                            <p className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter opacity-70 italic">
                              Format: JPG, PNG (Maks 2MB). Pastikan Teks Terbaca Jelas.
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes Field */}
                    <FormField label="Catatan Internal / Khusus" icon={Info}>
                      <Textarea
                        placeholder="Contoh: Owner hanya ada di siang hari, toko buka jam 10..."
                        value={formData.catatan_lain}
                        onChange={(e) => handleChange("catatan_lain", e.target.value)}
                        rows={6}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none text-sm font-medium"
                      />
                    </FormField>
                  </div>
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </div>

        {/* Form Actions Footer */}
        <div className="px-8 py-6 bg-background border-t border-border flex items-center justify-end gap-4 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] font-bold">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="h-14 px-10 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-2xl"
          >
            <X className="mr-2 h-4 w-4" /> Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-14 px-14 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-2xl"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <Save className="h-5 w-5" /> {isEdit ? "Update Database" : "Simpan Pelanggan"}
              </span>
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  );
};

export default CustomerForm;
