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
} from "lucide-react";
import { Produk, ProductFormData } from "../types";
import { useKategoriProduk } from "../hooks/useKategoriProduk";
import { BASE_URL } from "../../../services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">
          {imagePreview
            ? "Klik perbesar atau hapus foto"
            : "Format: JPG, PNG, WEBP (Maks 2MB)"}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="kode_barang" className="flex items-center gap-2">
            <Fingerprint className="h-3.5 w-3.5 text-primary" /> Kode Barang
          </Label>
          <Input
            id="kode_barang"
            className="h-11 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.kode_barang}
            onChange={(e) =>
              setFormData({ ...formData, kode_barang: e.target.value })
            }
            placeholder="Auto-generated if empty"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sku" className="flex items-center gap-2">
            <Package className="h-3.5 w-3.5 text-primary" /> SKU
          </Label>
          <Input
            id="sku"
            required
            className="h-11 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="SKU-XXXXX"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="nama_produk" className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-primary" /> Nama Produk
          </Label>
          <Input
            id="nama_produk"
            required
            className="h-11 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.nama_produk}
            onChange={(e) =>
              setFormData({ ...formData, nama_produk: e.target.value })
            }
            placeholder="Nama lengkap produk"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="kategori" className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-primary" /> Kategori
          </Label>
          <Select
            value={formData.id_kategori}
            onValueChange={(val) =>
              setFormData({ ...formData, id_kategori: val })
            }
          >
            <SelectTrigger className="h-11 bg-background border-border/50 shadow-sm">
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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="harga_jual" className="flex items-center gap-2">
          <Banknote className="h-3.5 w-3.5 text-primary" /> Harga Jual (Open
          Price)
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-black text-muted-foreground mr-2">
            RP
          </span>
          <Input
            id="harga_jual"
            type="number"
            required
            className="h-11 pl-10 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.harga_jual}
            onChange={(e) =>
              setFormData({ ...formData, harga_jual: e.target.value })
            }
            placeholder="0"
          />
        </div>
        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-tight italic">
          * Harga dapat disesuaikan oleh sales saat transaksi berlangsung.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="stok_tersedia" className="flex items-center gap-2">
            <Database className="h-3.5 w-3.5 text-primary" /> Stok Awal
          </Label>
          <Input
            id="stok_tersedia"
            type="number"
            required
            className="h-11 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.stok_tersedia}
            onChange={(e) =>
              setFormData({ ...formData, stok_tersedia: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="satuan" className="flex items-center gap-2">
            <Ruler className="h-3.5 w-3.5 text-primary" /> Satuan
          </Label>
          <Input
            id="satuan"
            required
            className="h-11 bg-background border-border/50 focus-visible:ring-primary shadow-sm"
            value={formData.satuan}
            onChange={(e) =>
              setFormData({ ...formData, satuan: e.target.value })
            }
            placeholder="Pcs, Box, Pack"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-bold">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          className="h-11 px-6 uppercase tracking-widest text-muted-foreground hover:text-foreground"
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="h-11 px-8 uppercase tracking-widest font-black shadow-lg shadow-primary/20"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              MENYIMPAN...
            </span>
          ) : (
            "Simpan Produk"
          )}
        </Button>
      </div>
    </form>
  );
};
export default ProductForm;
