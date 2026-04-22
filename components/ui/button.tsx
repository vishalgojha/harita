import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "danger";
  asChild?: boolean;
};

export function Button({
  className,
  variant = "default",
  type = "button",
  asChild = false,
  children,
  ...props
}: ButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:cursor-not-allowed disabled:opacity-60",
    {
      "bg-primary text-white hover:bg-[#177e5d]": variant === "default",
      "bg-muted text-foreground hover:bg-[#e2eee8]": variant === "secondary",
      "bg-transparent text-foreground hover:bg-muted": variant === "ghost",
      "bg-rose-600 text-white hover:bg-rose-700": variant === "danger",
    },
    className,
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      className: cn(classes, (children as React.ReactElement<{ className?: string }>).props.className),
    });
  }

  return (
    <button
      type={type}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
}
