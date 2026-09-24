import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, ChevronDown, CircleDollarSign, FileText, LayoutDashboard,
  LogOut, Package, Settings, Share2, ShoppingBag, Users,
} from "lucide-react";
import { usePermissions } from "../../store/clientStore";
import useAppState from "../../hooks/appState";
import { useModal } from "../../hooks/modal";
import LogOutModal from "../../components/LogOut";

const groups = [
  {
    label: "People", icon: Users,
    items: [
      ["Customers", "/admin/all-customers", "view-customers"],
      ["Vendors", "/admin/all-vendors", "view-vendors"],
      ["Sub administrators", "/admin/sub-admins", "view-subadmin"],
      ["Roles & permissions", "/admin/sub-admins/roles", "view-role"],
    ],
  },
  {
    label: "Catalogue", icon: Package,
    items: [
      ["All products", "/admin/products-sell", "manage-products"],
      ["My products", "/admin/my-products", "manage-products"],
      ["Categories", "/admin/products-categories", "manage-products"],
      ["Auction products", "/admin/auction-products", "manage-products"],
      ["Services", "/admin/services", "view-services"],
      ["Subscriptions", "/admin/subscriptions", null],
    ],
  },
  {
    label: "Operations", icon: ShoppingBag,
    items: [
      ["Orders", "/admin/orders", "view-orders"],
      ["Customer orders", "/admin/customer-orders", "view-orders"],
      ["Stores", "/admin/all-stores", "view-stores"],
      ["Offers", "/admin/offers", null],
      ["AliExpress", "/admin/aliexpress", null],
    ],
  },
  {
    label: "Content", icon: FileText,
    items: [
      ["Adverts", "/admin/adverts", "view-adverts"],
      ["FAQs", "/admin/pages/faqs", "view-pages"],
      ["Testimonials", "/admin/pages/testimonials", "view-pages"],
      ["Jobs", "/admin/jobs", "view-jobs"],
      ["User enquiries", "/admin/user-inquiries", null],
    ],
  },
];

const linkBase = "group flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500";

export default function AdminSidebar({ onMobile = false, onSelected = () => {} }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAppState();
  const { perms } = usePermissions();
  const { openModal } = useModal();
  const isSuperAdmin = user?.role?.name === "superadmin";
  const hasPerm = (permission) => !permission || isSuperAdmin || (Array.isArray(perms) && perms.some((item) => item.name === permission));
  const select = () => onMobile && onSelected();

  const logout = () => openModal({
    size: "sm",
    content: <LogOutModal mode="admin" redirect={() => navigate("/auth/admin/login")} />,
  });

  return <aside className={`${onMobile ? "w-full" : "fixed bottom-4 left-4 top-4 z-40 w-60 rounded-2xl shadow-[0_12px_40px_rgba(15,23,42,.08)]"} flex h-auto flex-col overflow-hidden bg-white`}>
    <div className="flex h-[86px] shrink-0 items-center px-5">
      <img src="/kudu-logo-transparent.png" alt="Kudu Mart" className="h-[68px] w-auto max-w-[190px] object-contain object-left" />
    </div>

    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Workspace</p>
      <NavLink to="/admin/dashboard" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-[#E85D24] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><LayoutDashboard size={18}/><span>Overview</span></NavLink>
      {groups.map((group) => {
        const visible = group.items.filter(([, , permission]) => hasPerm(permission));
        if (!visible.length) return null;
        const active = visible.some(([, href]) => location.pathname === href || location.pathname.startsWith(`${href}/`));
        const Icon = group.icon;
        return <details key={group.label} open={active} className="group/details">
          <summary className={`${linkBase} list-none text-slate-600 hover:bg-slate-100 hover:text-slate-950`}><Icon size={18}/><span className="flex-1">{group.label}</span><ChevronDown size={15} className="transition-transform group-open/details:rotate-180"/></summary>
          <div className="ml-5 mt-1 space-y-1 pl-3">
            {visible.map(([label, href]) => <NavLink key={href} to={href} onClick={select} className={({ isActive }) => `flex min-h-9 items-center rounded-md px-3 text-[13px] font-medium transition active:scale-[.98] ${isActive ? "bg-orange-50 font-semibold text-orange-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}>{label}</NavLink>)}
          </div>
        </details>;
      })}

      <p className="mb-2 mt-6 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Growth & finance</p>
      {hasPerm("view-referrals") && <NavLink to="/admin/referrals" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-[#E85D24] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Share2 size={18}/><span>Referrals</span></NavLink>}
      {hasPerm("view-transactions") && <NavLink to="/admin/transactions" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-[#E85D24] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><CircleDollarSign size={18}/><span>Transactions</span></NavLink>}
      {hasPerm("view-withdrawals") && <NavLink to="/admin/withdrawal-request" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-[#E85D24] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><CircleDollarSign size={18}/><span>Withdrawals</span></NavLink>}
      <NavLink to="/admin/notifications" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-[#E85D24] text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}><Bell size={18}/><span>Notifications</span></NavLink>
    </nav>

    <div className="shrink-0 bg-slate-50/70 p-3">
      <NavLink to="/admin/settings" onClick={select} className={({ isActive }) => `${linkBase} ${isActive ? "bg-slate-100 text-slate-950" : "text-slate-600 hover:bg-slate-100"}`}><Settings size={18}/><span>Settings</span></NavLink>
      <button onClick={logout} className={`${linkBase} mt-1 w-full text-red-600 hover:bg-red-50`}><LogOut size={18}/><span>Log out</span></button>
    </div>
  </aside>;
}
