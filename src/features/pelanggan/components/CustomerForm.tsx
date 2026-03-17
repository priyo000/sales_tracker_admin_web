import React, { useState, useEffect } from "react";
import {
  X,
  Building2,
  Shield,
  Save,
} from "lucide-react";
import { getImageUrl } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useDivisi } from "../../divisi/hooks/useDivisi";
import { usePelanggan } from "../hooks/usePelanggan";
import { Pelanggan, PelangganFormData } from "../types";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CustomerProfileTab from "./CustomerProfileTab";
import CustomerAdministrationTab from "./CustomerAdministrationTab";

interface CustomerFormProps {
  initialData?: Pelanggan | null;
  onSubmit: (data: PelangganFormData) => void;
  onCancel: () => void;
  loading?: boolean;
}

export interface FilterOption {
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
    id_divisi: initialData?.id_divisi || user?.karyawan?.id_divisi || 0,
    no_hp_pribadi: initialData?.no_hp_pribadi || "",
    alamat_usaha: initialData?.alamat_usaha || "",
    latitude: initialData?.latitude || -7.4244,
    longitude: initialData?.longitude || 109.2302,
    cara_pembayaran: initialData?.cara_pembayaran || "Tunai",
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
    kode_pelanggan: initialData?.kode_pelanggan || "",
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
            <CustomerProfileTab
              formData={formData}
              onChange={handleChange}
              onLocationSelect={handleLocationSelect}
              previews={previews}
              onFileChange={handleFileChange}
              onClearFile={clearFile}
              filterOptions={filterOptions}
              onSalesChange={handleSalesChange}
              divisis={divisis}
              user={user}
            />
          </TabsContent>

          <TabsContent value="administrasi" className="m-0 space-y-10 focus:outline-none">
            <CustomerAdministrationTab
              formData={formData}
              onChange={handleChange}
              previews={previews}
              onFileChange={handleFileChange}
              onClearFile={clearFile}
              filterOptions={filterOptions}
              onSalesChange={handleSalesChange}
              isEdit={isEdit}
            />
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
                <Save className="h-4 w-4" />{" "}
                {isEdit ? "Update Database" : "Simpan Pelanggan"}
              </span>
            )}
          </Button>
        </div>
      </Tabs>
    </form>
  );
};

export default CustomerForm;
