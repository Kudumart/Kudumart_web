export default function Tabs({ items, value, onChange }) {
  return <div className="flex w-fit max-w-full gap-1 overflow-x-auto rounded-xl bg-slate-200/60 p-1" role="tablist">
    {items.map((item) => <button key={item} type="button" role="tab" aria-selected={value === item} onClick={() => onChange(item)} className={`min-h-10 shrink-0 cursor-pointer rounded-lg px-4 text-sm font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${value === item ? "bg-white text-slate-950 shadow-[0_2px_8px_rgba(15,23,42,.08)]" : "text-slate-500 hover:text-slate-900"}`}>{item}</button>)}
  </div>;
}
