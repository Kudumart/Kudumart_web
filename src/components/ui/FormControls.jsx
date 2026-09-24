const control = "w-full min-h-11 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#E85D24] focus:ring-4 focus:ring-orange-100/70 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400";

export function Field({ label, hint, error, required, children, className = "" }) {
  return <label className={`block space-y-1.5 ${className}`}>
    {label && <span className="block text-sm font-semibold text-slate-700">{label}{required && <span className="ml-1 text-red-500">*</span>}</span>}
    {children}
    {error ? <span className="block text-xs font-medium text-red-600">{error}</span> : hint ? <span className="block text-xs text-slate-500">{hint}</span> : null}
  </label>;
}

export function Input({ className = "", ...props }) { return <input className={`${control} ${className}`} {...props} />; }
export function Select({ className = "", children, ...props }) { return <select className={`${control} cursor-pointer appearance-auto ${className}`} {...props}>{children}</select>; }
export function Textarea({ className = "", ...props }) { return <textarea className={`${control} min-h-24 resize-y ${className}`} {...props} />; }
