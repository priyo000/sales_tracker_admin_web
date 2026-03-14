import React from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  size?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  noPadding?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  noPadding = false,
}) => {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-3xl",
    "4xl": "sm:max-w-4xl",
    "5xl": "sm:max-w-5xl",
    "6xl": "sm:max-w-6xl",
    "7xl": "sm:max-w-7xl",
    full: "sm:max-w-[95vw]",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          sizeClasses[size],
          "p-0 overflow-hidden flex flex-col max-h-[90vh] border-none shadow-2xl bg-card rounded-2xl",
          size === "full" && "h-[90vh]",
        )}
      >
        <DialogHeader className="px-5 py-3.5 border-b bg-muted/50 shrink-0 space-y-1">
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground/90 uppercase">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-[10px] text-muted-foreground/80 font-semibold uppercase tracking-widest">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div
          className={cn(
            "flex-1 min-h-0",
            !noPadding ? "p-6 overflow-y-auto" : "overflow-hidden",
          )}
        >
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  type = "warning",
}) => {
  const iconColorMap = {
    danger: "text-destructive bg-destructive/10 border-destructive/20",
    warning: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    info: "text-primary bg-primary/10 border-primary/20",
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-sm p-6 bg-card border-none shadow-2xl">
        <div className="flex flex-col items-center text-center space-y-4">
          <div
            className={cn(
              "p-4 rounded-full border shadow-inner",
              iconColorMap[type],
            )}
          >
            <AlertCircle className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <DialogTitle className="text-xl font-bold text-foreground uppercase tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground font-medium">
              {message}
            </DialogDescription>
          </div>

          <div className="flex w-full gap-3 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 font-bold rounded-xl"
            >
              {cancelText}
            </Button>
            <Button
              variant={type === "danger" ? "destructive" : "default"}
              onClick={onConfirm}
              className="flex-1 h-11 font-bold rounded-xl shadow-lg shadow-primary/20"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
