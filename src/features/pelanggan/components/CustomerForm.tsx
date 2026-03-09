import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Building2,
  Phone,
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
  Layers,
  CheckCircle2,
  Save,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { usePelanggan } from "../hooks/usePelanggan";
import { Pelanggan, PelangganFormData } from "../types";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { SectionHeader } from "@/components/ui/SectionHeader";

interface CustomerFormProps {
  initialData?: Pelanggan | null;
  onSubmit: (data: PelangganFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface FilterOption {
  id: number;
  nama_lengkap: string;
  jabatan: string;
  id_divisi?: number;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
}) => {
  const isEdit = !!initialData;
  const { user } = useAuth();
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
  }, [fetchFilterOptions, fetchDivisis]);

  const [formData, setFormData] = useState<PelangganFormData>({
    nama_toko: initialData?.nama_toko || "",
    nama_pemilik: initialData?.nama_pemilik || "",
    id_divisi: initialData?.id_divisi || 0,
    no_hp_pribadi: initialData?.no_hp_pribadi || "",
    alamat_usaha: initialData?.alamat_usaha || "",
    latitude: initialData?.latitude || -7.4244,
    longitude: initialData?.longitude || 109.2302,
    cara_pembayaran: initialData?.cara_pembayaran || "Cash",
    sistem_pembayaran: initialData?.sistem_pembayaran || "Cash",
    limit_kredit_awal: initialData?.limit_kredit_awal || 0,
    top_hari: initialData?.top_hari || 0,
    nama_bank: initialData?.nama_bank || "",
    no_rekening: initialData?.no_rekening || "",
    atas_nama_rekening: initialData?.atas_nama_rekening || "",
    cabang_bank: initialData?.cabang_bank || "",
    catatan_lain: initialData?.catatan_lain || "",
    id_sales_pembuat: initialData?.id_sales_pembuat || 0,
    status: initialData?.status || "active",
    provinsi_usaha: initialData?.provinsi_usaha || "",
    kota_usaha: initialData?.kota_usaha || "",
    kecamatan_usaha: initialData?.kecamatan_usaha || "",
    klasifikasi_outlet: initialData?.klasifikasi_outlet || "",
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
    foto_toko: getImageUrl(initialData?.foto_toko_url) || null,
    foto_ktp: getImageUrl(initialData?.foto_ktp_url) || null,
  });

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSalesChange = (val: string) => {
    if (val === "none") {
      setFormData((prev) => ({
        ...prev,
        id_sales_pembuat: null,
        // If user has division, use it, otherwise keep previous or set to 0 to trigger selection
        id_divisi: user?.karyawan?.id_divisi || prev.id_divisi,
      }));
      return;
    }

    const salesId = parseInt(val);
    const selectedSales = filterOptions.find((opt) => opt.id === salesId);
    setFormData((prev) => ({
      ...prev,
      id_sales_pembuat: salesId,
      id_divisi: selectedSales?.id_divisi || prev.id_divisi,
    }));
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
      [type]:
        type === "foto_toko"
          ? getImageUrl(initialData?.foto_toko_url) || null
          : getImageUrl(initialData?.foto_ktp_url) || null,
    }));
  };

  const handleLocationSelect = (
    lat: number,
    lng: number,
    address?: string,
    city?: string,
    district?: string,
    state?: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
      alamat_usaha: address || prev.alamat_usaha,
      provinsi_usaha: state || prev.provinsi_usaha,
      kota_usaha: city || prev.kota_usaha,
      kecamatan_usaha: district || prev.kecamatan_usaha,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalData: PelangganFormData = {
      ...formData,
      foto_toko: files.foto_toko,
      foto_ktp: files.foto_ktp,
    };

    onSubmit(finalData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-2">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="flex justify-center">
          <TabsList className="grid w-full grid-cols-2 max-w-md h-9 bg-muted/50 p-1 rounded-xl">
            <TabsTrigger
              value="profil"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[10px] uppercase tracking-wider gap-2"
            >
              <Building2 className="h-3.5 w-3.5" /> Profil & Alamat
            </TabsTrigger>
            <TabsTrigger
              value="administrasi"
              className="rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md transition-all font-bold text-[10px] uppercase tracking-wider gap-2"
            >
              <Shield className="h-3.5 w-3.5" /> Administrasi & Finansial
            </TabsTrigger>
          </TabsList>
        </div>

        <div>
          <TabsContent value="profil" className="m-0 space-y-6 focus:outline-none">
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
                            onChange={(e) => handleChange("nama_toko", e.target.value)}
                            required
                            className="h-9 bg-muted/30 border-border/50 text-sm font-semibold focus-visible:ring-primary shadow-sm"
                          />
                        </FormField>

                        <FormField label="Pemilik / Penanggung Jawab" icon={User} required>
                          <Input
                            placeholder="Nama Lengkap Pemilik"
                            value={formData.nama_pemilik}
                            onChange={(e) => handleChange("nama_pemilik", e.target.value)}
                            required
                            className="h-9 bg-muted/30 border-border/50 text-sm font-semibold focus-visible:ring-primary shadow-sm"
                          />
                        </FormField>

                        <FormField label="Kategori / Klasifikasi" icon={Layers}>
                          <Select
                            value={formData.klasifikasi_outlet}
                            onValueChange={(val) => handleChange("klasifikasi_outlet", val)}
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

                        {/* Special Case: If "MILIK PERUSAHAAN" is selected AND current user doesn't have a fixed division (Admin/SuperAdmin) */}
                        {formData.id_sales_pembuat === null && !user?.karyawan?.id_divisi && (
                           <FormField label="Tentukan Divisi Pelanggan" icon={Layers} required>
                           <Select
                             value={formData.id_divisi.toString()}
                             onValueChange={(val) => handleChange("id_divisi", parseInt(val))}
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
                            onValueChange={(val) => handleChange("status", val)}
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
                          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3"> Foto Toko / Lokasi </label>
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
                                        onChange={(e) => handleFileChange(e, "foto_toko")}
                                      />
                                    </label>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => clearFile("foto_toko")}
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
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary/60">
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
                          onChange={(e) => handleChange("no_hp_pribadi", e.target.value)}
                          required
                          className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                        />
                      </FormField>

                      <FormField label="Telepon Kantor" icon={Phone}>
                        <Input
                          placeholder="(021) XXXXXXXX"
                          value={formData.no_hp_kontak || ""}
                          onChange={(e) => handleChange("no_hp_kontak", e.target.value)}
                          className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                        />
                      </FormField>

                      <FormField label="Nama Kontak Person" icon={User}>
                        <Input
                          placeholder="Nama Kontak person"
                          value={formData.nama_kontak_person || ""}
                          onChange={(e) => handleChange("nama_kontak_person", e.target.value)}
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
                            onChange={(e) => handleChange("alamat_usaha", e.target.value)}
                            required
                            rows={3}
                            className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none"
                          />
                        </FormField>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <FormField label="Provinsi">
                            <Input
                              value={formData.provinsi_usaha || ""}
                              onChange={(e) => handleChange("provinsi_usaha", e.target.value)}
                              placeholder="Provinsi"
                              className="h-9 bg-muted/30 border-border/50 text-xs font-semibold"
                            />
                          </FormField>
                          <FormField label="Kota / Kabupaten">
                            <Input
                              value={formData.kota_usaha || ""}
                              onChange={(e) => handleChange("kota_usaha", e.target.value)}
                              placeholder="Kota"
                              className="h-9 bg-muted/30 border-border/50 text-xs font-semibold"
                            />
                          </FormField>
                          <FormField label="Kecamatan">
                            <Input
                              value={formData.kecamatan_usaha || ""}
                              onChange={(e) => handleChange("kecamatan_usaha", e.target.value)}
                              placeholder="Kecamatan"
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
                            Pastikan Pin Lokasi Di Peta Akurat. Digunakan untuk verifikasi kunjungan sales.
                          </p>
                        </div>
                      </div>

                      <div className="relative h-[300px] rounded-xl overflow-hidden border-2 border-border/50 shadow-inner group">
                        <MapPicker
                          lat={formData.latitude}
                          lng={formData.longitude}
                          onChange={handleLocationSelect}
                          hideSearch={false}
                          height="h-full"
                        />
                        <div className="absolute top-3 left-3 right-3 z-50 pointer-events-none">
                          <div className="bg-white/90 backdrop-blur shadow-md border border-border/50 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-primary text-center">
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
                    <Card className="border border-border/50 shadow-sm bg-card">
                      <CardContent className="p-6 space-y-4">
                        <SectionHeader
                          icon={CreditCard}
                          title="Kebijakan Pembayaran"
                          description="Termin & limit transaksi"
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                          <FormField label="Metode Transaksi" icon={Briefcase}>
                            <Select
                              value={formData.cara_pembayaran}
                              onValueChange={(val) => handleChange("cara_pembayaran", val)}
                            >
                              <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
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
                              <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold">
                                <SelectValue placeholder="Pilih Sistem" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash">Cash (Lunas Langsung)</SelectItem>
                                <SelectItem value="Kredit">Kredit (Tempo)</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormField>

                          {formData.sistem_pembayaran === "Kredit" && (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-primary/5 rounded-xl border border-primary/20 animate-in zoom-in-95 duration-500 shadow-inner">
                              <FormField label="Limit Kredit Awal" icon={CreditCard}>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">Rp</span>
                                  <Input
                                    type="number"
                                    value={formData.limit_kredit_awal}
                                    onChange={(e) => handleChange("limit_kredit_awal", parseFloat(e.target.value))}
                                    className="h-9 pl-10 bg-card border-border/50 text-sm font-semibold"
                                  />
                                </div>
                              </FormField>

                              <FormField label="Durasi Jatuh Tempo" icon={Clock}>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={formData.top_hari}
                                    onChange={(e) => handleChange("top_hari", parseInt(e.target.value))}
                                    className="h-9 pr-12 bg-card border-border/50 text-sm font-semibold"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground uppercase">Hari</span>
                                </div>
                              </FormField>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bank Account Info Card */}
                    {(formData.cara_pembayaran === "Transfer" || formData.cara_pembayaran === "Giro") && (
                      <Card className="border border-border/50 shadow-sm bg-card animate-in slide-in-from-left-4 duration-500">
                        <CardContent className="p-6 space-y-4">
                          <SectionHeader
                            icon={Landmark}
                            title="Rekening Bank"
                            description="Info transfer"
                          />

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField label="Nama Bank">
                              <Input
                                placeholder="Misal: BCA, Mandiri, BRI"
                                value={formData.nama_bank}
                                onChange={(e) => handleChange("nama_bank", e.target.value)}
                                className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                              />
                            </FormField>
                            <FormField label="Kantor Cabang">
                              <Input
                                placeholder="Nama Cabang"
                                value={formData.cabang_bank}
                                onChange={(e) => handleChange("cabang_bank", e.target.value)}
                                className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                              />
                            </FormField>
                            <FormField label="Nomor Rekening">
                              <Input
                                placeholder="XXXXXXXXXXXX"
                                value={formData.no_rekening}
                                onChange={(e) => handleChange("no_rekening", e.target.value)}
                                className="h-9 bg-muted/30 border-border/50 font-mono text-sm font-semibold tracking-wider"
                              />
                            </FormField>
                            <FormField label="Atas Nama Pemilik">
                              <Input
                                placeholder="Nama sesuai buku tabungan"
                                value={formData.atas_nama_rekening}
                                onChange={(e) => handleChange("atas_nama_rekening", e.target.value)}
                                className="h-9 bg-muted/30 border-border/50 text-sm font-semibold"
                              />
                            </FormField>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-10">
                    {/* Sales Assignment Card */}
                    <Card className="border border-border/50 shadow-sm bg-card">
                      <CardContent className="p-6 space-y-4">
                        <SectionHeader
                          icon={User}
                          title="Penanggung Jawab"
                          description="Tentukan sales person utama"
                        />

                        <div className="pt-1">
                           <FormField label="Penanggung Jawab (Sales)" icon={User} required>
                             <Select
                               value={formData.id_sales_pembuat?.toString() || "none"}
                               onValueChange={handleSalesChange}
                               required
                             >
                              <SelectTrigger className="h-9 bg-muted/30 border-border/50 shadow-sm font-semibold text-primary">
                                <SelectValue placeholder="Pilih Sales Person" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none" className="font-bold text-amber-600">
                                  🏢 MILIK PERUSAHAAN (NON-TO)
                                </SelectItem>
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
                    <Card className="border border-border/50 shadow-sm bg-card">
                      <CardContent className="p-6 space-y-4">
                        <SectionHeader
                          icon={LucideImage}
                          title="Identitas"
                          description="Foto KTP pemilik"
                        />

                        <div className="pt-1">
                           <div className="flex flex-col items-center gap-4">
                            <div className="relative group w-full max-w-sm aspect-[1.6/1] rounded-2xl overflow-hidden border-2 border-dashed border-primary/30 bg-muted/10 shadow-lg transition-all hover:bg-muted/20 hover:border-primary/50">
                              {previews.foto_ktp ? (
                                <>
                                  <img
                                    src={previews.foto_ktp}
                                    alt="Preview KTP"
                                    className="h-full w-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                                  />
                                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                    <div className="flex gap-2">
                                       <label className="h-9 w-9 bg-white text-primary hover:bg-white/90 rounded-full flex items-center justify-center cursor-pointer shadow-xl transition-transform hover:scale-110 active:scale-95">
                                          <LucideImage className="h-4 w-4" />
                                          <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => handleFileChange(e, "foto_ktp")}
                                          />
                                       </label>
                                       <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => clearFile("foto_ktp")}
                                        className="h-9 w-9 rounded-full shadow-xl hover:scale-110 active:scale-95 transition-transform"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer group">
                                  <div className="p-4 bg-primary/10 rounded-full mb-2 group-hover:bg-primary/20 transition-colors">
                                    <LucideImage className="h-8 w-8 text-primary opacity-60" />
                                  </div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-primary/60 text-center px-4">
                                    Unggah Foto KTP (Landscape)
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
                            <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-tighter opacity-60 italic bg-muted/50 px-3 py-1.5 rounded-full border border-border/50">
                              <Info className="h-3 w-3" /> JPG, PNG (Maks 2MB). Pastikan Teks Terbaca Jelas.
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Notes Field */}
                    <FormField label="Catatan Internal / Khusus" icon={Info}>
                      <Textarea
                        placeholder="Catatan tambahan..."
                        value={formData.catatan_lain}
                        onChange={(e) => handleChange("catatan_lain", e.target.value)}
                        rows={4}
                        className="bg-muted/30 border-border/50 focus-visible:ring-primary shadow-sm resize-none text-xs font-semibold"
                      />
                    </FormField>
                  </div>
                </div>
              </TabsContent>
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border font-semibold">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="h-9 px-8 text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-lg"
          >
            <X className="mr-2 h-3.5 w-3.5" /> Batal
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="h-9 px-10 text-[10px] font-bold uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] rounded-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="h-4 w-4" /> {isEdit ? "Update Database" : "Simpan Pelanggan"}
              </span>
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  );
};

export default CustomerForm;
