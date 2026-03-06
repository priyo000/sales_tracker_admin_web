import React, { useEffect, useState } from "react";
import {
  X,
  Upload,
  Package,
  Fingerprint,
  Tag,
  Banknote,
  Database,
  Ruler,
  Save,
} from "lucide-react";
import { Produk, ProductFormData } from "../types";
import { useKategoriProduk } from "../hooks/useKategoriProduk";
import { BASE_URL } from "../../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/ui/FormField";
import { cn } from "@/lib/utils";

interface ProductFormProps {
  initialData?: Produk | null;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const ProductForm: React.FC<ProductFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const { kategoris, fetchKategoris } = useKategoriProduk();

  useEffect(() => {
    fetchKategoris();
  }, [fetchKategoris]);

  const [formData, setFormData] = useState<ProductFormData>({
    kode_barang: initialData?.kode_barang || "",
    sku: initialData?.sku || "",
    nama_produk: initialData?.nama_produk || "",
    id_kategori: initialData?.id_kategori?.toString() || "",
    harga_jual: initialData?.harga_jual?.toString() || "",
    stok_tersedia: initialData?.stok_tersedia?.toString() || "0",
    satuan: initialData?.satuan || "pcs",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(() => {
    if (initialData?.gambar_url) {
      return initialData.gambar_url.startsWith("http")
        ? initialData.gambar_url
        : `${BASE_URL}/storage/${initialData.gambar_url}`;
    }
    return null;
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key as keyof ProductFormData];
      if (val !== "" && val !== null && val !== undefined) {
        data.append(key, val);
      }
    });

    if (selectedImage) {
      data.append("gambar", selectedImage);
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 py-2">
      <div className="space-y-6">
        {/* Image Upload */}
        <div className="flex flex-col items-center gap-4 py-2">
          <div
            className={cn(
              "relative h-40 w-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden group transition-all duration-300 shadow-sm",
              imagePreview
                ? "border-primary/50"
                : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/50",
            )}
          >
            {imagePreview ? (
              <>
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={clearImage}
                    className="rounded-full h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full p-6 text-center">
                <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-muted-foreground mt-2 uppercase tracking-tight">
                  Upload Foto Produk
                </span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest text-center italic">
            {imagePreview
              ? "Klik icon silang untuk hapus foto"
              : "Format: JPG, PNG, WEBP (Maks 2MB)"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Kode Barang" icon={Fingerprint}>
            <Input
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.kode_barang}
              onChange={(e) =>
                setFormData({ ...formData, kode_barang: e.target.value })
              }
              placeholder="Auto-generated jika kosong"
            />
          </FormField>
          <FormField label="SKU" icon={Package} required>
            <Input
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.sku}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="SKU-XXXXX"
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Nama Produk" icon={Tag} required>
            <Input
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.nama_produk}
              onChange={(e) =>
                setFormData({ ...formData, nama_produk: e.target.value })
              }
              placeholder="Nama lengkap produk"
            />
          </FormField>
          <FormField label="Kategori" icon={Tag} required>
            <Select
              value={formData.id_kategori}
              onValueChange={(val) =>
                setFormData({ ...formData, id_kategori: val })
              }
              required
            >
              <SelectTrigger className="h-12 bg-card border-border/50 shadow-sm font-bold">
                <SelectValue placeholder="Pilih Kategori" />
              </SelectTrigger>
              <SelectContent>
                {kategoris.map((kat) => (
                  <SelectItem key={kat.id} value={kat.id.toString()}>
                    {kat.nama_kategori}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField 
          label="Harga Jual" 
          icon={Banknote} 
          required
          description="* Harga dapat disesuaikan oleh sales saat transaksi berlangsung."
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-black text-muted-foreground">
              RP
            </span>
            <Input
              type="number"
              required
              className="h-12 pl-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.harga_jual}
              onChange={(e) =>
                setFormData({ ...formData, harga_jual: e.target.value })
              }
              placeholder="0"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Stok Awal" icon={Database} required>
            <Input
              type="number"
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.stok_tersedia}
              onChange={(e) =>
                setFormData({ ...formData, stok_tersedia: e.target.value })
              }
            />
          </FormField>
          <FormField label="Satuan" icon={Ruler} required>
            <Input
              required
              className="h-12 bg-card border-border/50 focus-visible:ring-primary shadow-sm font-bold"
              value={formData.satuan}
              onChange={(e) =>
                setFormData({ ...formData, satuan: e.target.value })
              }
              placeholder="Pcs, Box, Pack"
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="h-12 px-8 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          <X className="mr-2 h-4 w-4" /> Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-12 px-10 text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-4 w-4" /> Simpan Produk
            </span>
          )}
        </Button>
      </div>
    </form>
  );
};
export default ProductForm;
