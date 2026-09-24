export function Card({ children, className = "" }) {
  return <section className={`rounded-2xl bg-white shadow-[0_8px_28px_rgba(15,23,42,0.045)] ${className}`}>{children}</section>;
}

export function PageHeader({ eyebrow, title, description, actions }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>{eyebrow && <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-orange-600">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-[-0.025em] text-slate-950 md:text-3xl">{title}</h1>{description && <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>}</div>
    {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
  </div>;
}

export function EmptyState({ icon, title, description, action }) {
  return <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl bg-white px-6 py-10 text-center shadow-[0_8px_28px_rgba(15,23,42,.04)]">
    {icon && <div className="mb-3 rounded-xl bg-white p-3 text-slate-400 shadow-sm">{icon}</div>}
    <h3 className="font-semibold text-slate-800">{title}</h3>{description && <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>}{action && <div className="mt-4">{action}</div>}
  </div>;
}

export function Skeleton({ className = "" }) { return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />; }
