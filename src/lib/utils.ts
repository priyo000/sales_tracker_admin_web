import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { AxiosError } from "axios"
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

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function handleApiError(
  err: unknown,
  fallbackMsg: string,
): { success: false; message: string } {
  const error = err as AxiosError<{ message?: string; error?: string }>;
  const msg =
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    fallbackMsg;
  return { success: false, message: msg };
}
