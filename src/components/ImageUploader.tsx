"use client";

// Reusable image manager: shows the current image list (scraped + uploaded),
// lets the admin upload their own photos to Firebase Storage, remove any
// image, and reorder isn't included here — first image is always the cover.
import { useRef, useState } from "react";
import Image from "next/image";
import { uploadProductImages, deleteProductImage } from "@/lib/storage-client";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  productId: string; // use "temp" for products not yet saved
}

export function ImageUploader({ images, onChange, productId }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);

    const tooBig = files.find((f) => f.size > 8 * 1024 * 1024);
    if (tooBig) {
      toast({ title: "Image too large", description: `${tooBig.name} is over 8MB.`, variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const urls = await uploadProductImages(files, productId);
      onChange([...images, ...urls]);
      toast({ title: `${urls.length} image${urls.length > 1 ? "s" : ""} added`, variant: "success" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleRemove(url: string) {
    onChange(images.filter((img) => img !== url));
    // Best-effort cleanup — don't block the UI on it, and don't fail loudly
    // since the image may be a scraped supplier URL rather than our own upload.
    deleteProductImage(url);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div key={img} className="group relative h-20 w-20 shrink-0 overflow-hidden rounded-md border border-gray-200">
            <Image src={img} alt="" fill sizes="80px" className="object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(img)}
              className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-20 w-20 shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-gray-300 text-gray-400 hover:border-primary-400 hover:text-primary-600 disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
          <span className="text-[10px] font-medium">{uploading ? "Uploading" : "Add photo"}</span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <p className="mt-2 text-xs text-gray-400">
        The first image is used as the cover photo. JPG or PNG, up to 8MB each.
      </p>
    </div>
  );
}
