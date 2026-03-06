import React from "react";
import { Label } from "./label";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
  description?: string;
}

export const FormField = ({
  label,
  required,
  children,
  icon: Icon,
  className,
  description,
}: FormFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <Label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-muted-foreground/80">
      {Icon && <Icon className="h-3 w-3 text-primary shrink-0" />}
      {label}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
    {children}
    {description && (
      <p className="text-[10px] text-muted-foreground font-medium italic mt-1 uppercase tracking-tight">
        {description}
      </p>
    )}
  </div>
);
