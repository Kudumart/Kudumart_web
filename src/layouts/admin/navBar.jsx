import { Bell, ChevronDown, Moon, Search, Settings, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import useAppState from "../../hooks/appState";
import { useAdminTheme } from "../../hooks/adminTheme";

export default function Navbar() {
  const { user } = useAppState();
  const { darkMode, toggleTheme } = useAdminTheme();
  const name = user?.name || "Administrator";
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  return <header className="sticky top-0 z-30 px-4 py-4 md:px-0">
    <div className="mx-auto flex max-w-[1500px] items-center gap-4 rounded-2xl bg-white/95 px-5 py-3 shadow-[0_8px_28px_rgba(15,23,42,.06)] backdrop-blur-xl md:px-6">
      <div className="relative hidden max-w-md flex-1 lg:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input aria-label="Search admin" placeholder="Search the admin workspace" className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100/60" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button type="button" onClick={toggleTheme} aria-label={`Switch to ${darkMode ? "light" : "dark"} mode`} title={`Switch to ${darkMode ? "light" : "dark"} mode`} className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95">{darkMode ? <Sun size={18}/> : <Moon size={18}/>}</button>
        <Link to="/admin/settings" aria-label="Settings" className="grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"><Settings size={18} /></Link>
        <Link to="/admin/notifications" aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 active:scale-95"><Bell size={18} /><span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-orange-500 ring-2 ring-white" /></Link>
        <button type="button" className="flex cursor-pointer items-center gap-3 rounded-lg p-1.5 pr-2 text-left transition hover:bg-slate-50 active:scale-[0.98]">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#172033] text-xs font-bold text-white">{initials}</span>
          <span className="hidden sm:block"><span className="block text-sm font-bold text-slate-800">{name}</span><span className="block text-[11px] font-medium text-slate-500">Super administrator</span></span>
          <ChevronDown className="hidden h-4 w-4 text-slate-400 sm:block" />
        </button>
      </div>
    </div>
  </header>;
}
