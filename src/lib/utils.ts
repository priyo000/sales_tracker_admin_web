import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { BASE_URL } from "@/services/api"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(path?: string | null) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  
  // Ensure the path starts with a slash
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // If the path doesn't start with /storage, prepend it
  // (unless it's already an absolute-looking path which we handled above)
  if (!normalizedPath.startsWith("/storage/")) {
    normalizedPath = `/storage${normalizedPath}`;
  }
  
  return `${BASE_URL}${normalizedPath}`;
}
