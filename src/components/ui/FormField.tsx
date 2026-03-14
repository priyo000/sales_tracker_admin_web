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
    <Label className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">
      {Icon && <Icon className="h-3 w-3 text-primary/80 shrink-0" />}
      {label}
      {required && <span className="text-destructive font-bold ml-0.5">*</span>}
    </Label>
    {children}
    {description && (
      <p className="text-[10px] text-muted-foreground/70 font-medium px-0.5">
        {description}
      </p>
    )}
  </div>
);
