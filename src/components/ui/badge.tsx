import * as React from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline" | "secondary";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-primary/10 text-primary border-primary/20",
  success: "bg-green-500/10 text-green-600 border-green-500/20",
  warning: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  destructive: "bg-red-500/10 text-red-600 border-red-500/20",
  outline: "border-border text-foreground",
  secondary: "bg-secondary text-secondary-foreground border-transparent",
};

export function Badge({ variant = "default", children, className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
