import React from "react";
import { LoaderCircle } from "lucide-react";

const variants = {
  primary: "bg-[#E85D24] text-white shadow-[0_1px_2px_rgba(15,23,42,.12)] hover:bg-[#CF4C17] focus-visible:ring-orange-500",
  secondary: "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-400",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500",
  success: "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500",
};

const sizes = {
  sm: "min-h-9 px-3 text-xs",
  md: "min-h-10 px-4 text-sm",
  lg: "min-h-12 px-5 text-sm",
  icon: "h-10 w-10 p-0",
};

export default function Button({ children, variant = "primary", size = "md", loading = false, isLoading = false, disabled, className = "", fullWidth = false, icon, ...props }) {
  const busy = loading || isLoading;
  const Icon = icon;
  return <button
    disabled={disabled || busy}
    className={`inline-flex cursor-pointer select-none items-center justify-center gap-2 rounded-lg font-semibold transition duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${fullWidth ? "w-full" : ""} ${className}`}
    {...props}
  >
    {busy && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
    {!busy && Icon && (React.isValidElement(Icon) ? Icon : <Icon className="h-4 w-4" />)}
    {children}
  </button>;
}
