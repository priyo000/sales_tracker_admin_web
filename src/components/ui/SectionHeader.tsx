import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeader = ({
  icon: Icon,
  title,
  description,
  className,
}: SectionHeaderProps) => (
  <div className={cn("flex items-start gap-4 group", className)}>
    <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors shadow-sm shrink-0">
      <Icon className="h-5 w-5 text-primary" />
    </div>
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
        {title}
      </h3>
      {description && (
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-tight italic opacity-70">
          {description}
        </p>
      )}
    </div>
  </div>
);
