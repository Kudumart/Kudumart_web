import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { CalendarDays, ChevronLeft, ChevronRight, CircleDollarSign, Copy, Kanban, Link2, Megaphone, Plus, ShieldCheck, Trash2, UserCheck, Users } from "lucide-react";
import apiClient from "../../../api/apiFactory";
import { Badge, Button, EmptyState, Field, Input, Modal, PageHeader, Select, Tabs, Textarea } from "../../../components/ui";
import { useAdminTheme } from "../../../hooks/adminTheme";

const tabs = ["CRM", "Programmes", "Sales agents", "Referral codes", "Referrals", "Earnings", "Payouts"];
const tabDetails = {
  CRM: { title: "Sales pipeline", description: "Own prospects, schedule follow-ups and move opportunities through onboarding.", action: "New lead", icon: Kanban },
  Programmes: { title: "Referral programmes", description: "Define who can be referred and how credit is assigned.", action: "New programme", icon: Megaphone },
  "Sales agents": { title: "Sales team", description: "Manage the people who own and distribute referral links.", action: "Add agent", icon: Users },
  "Referral codes": { title: "Tracking links", description: "Create channel-specific links and monitor their usage.", action: "Generate link", icon: Link2 },
  Referrals: { title: "Attributed registrations", description: "Review every person credited to your sales team.", icon: UserCheck },
  Earnings: { title: "Commission earnings", description: "Review calculated, held and payable sales commissions.", icon: CircleDollarSign },
  Payouts: { title: "Commission payouts", description: "Group available earnings, approve disbursement and retain payment evidence.", action: "New payout", icon: CircleDollarSign },
};
const crmStages = ["NEW", "CONTACTED", "QUALIFIED", "ONBOARDING", "WON", "LOST"];

const qualificationMetrics = {
  CUSTOMER: [
    ["CUSTOMER_COMPLETED_ORDERS", "Completed orders"],
    ["CUSTOMER_SPEND", "Total order value"],
    ["CUSTOMER_ACTIVE_DAYS", "Active days"],
  ],
  VENDOR: [
    ["VENDOR_APPROVED", "Vendor approved"],
    ["VENDOR_ACTIVE_DAYS", "Active days"],
    ["VENDOR_COMPLETED_ORDERS", "Fulfilled orders"],
    ["VENDOR_GMV", "Gross merchandise value"],
  ],
};
const operatorLabels = {
  EQUALS: "Equals",
  GREATER_THAN_OR_EQUAL: "At least",
  GREATER_THAN: "More than",
  LESS_THAN_OR_EQUAL: "At most",
  LESS_THAN: "Less than",
};
const blankQualificationRule = (entityType = "CUSTOMER") => ({
  id: `rule_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  entityType,
  metric: qualificationMetrics[entityType][0][0],
  operator: "GREATER_THAN_OR_EQUAL",
  value: 1,
  windowDays: 30,
});
const blankCommissionRule = (entityType = "CUSTOMER") => ({
  id: `commission_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  entityType,
  trigger: entityType === "VENDOR" ? "VENDOR_COMPLETED_ORDER" : "CUSTOMER_COMPLETED_ORDER",
  calculationType: "PERCENTAGE",
  rate: 5,
  currency: "NGN",
  minimumSourceAmount: "",
  maximumCommissionAmount: "",
});

const Status = ({ value }) => <Badge tone={value}>{value}</Badge>;
const formatLabel = (value = "") => value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());

function Empty({ icon, title, description }) {
  return <EmptyState icon={icon} title={title} description={description} />;
}

function Panel({ title, description, count, children }) {
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6">
      <div><h2 className="text-sm font-bold text-slate-900">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>
      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{count}</span>
    </header>
    <div>{children}</div>
  </section>;
}

export default function ReferralManagement() {
  const { darkMode } = useAdminTheme();
  const [tab, setTab] = useState(tabs[0]);
  const [composerOpen, setComposerOpen] = useState(false);
  const [programmes, setProgrammes] = useState([]);
  const [editingProgramId, setEditingProgramId] = useState(null);
  const [agents, setAgents] = useState([]);
  const [codes, setCodes] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [earningToReverse, setEarningToReverse] = useState(null);
  const [reversalReason, setReversalReason] = useState("");
  const [payoutToPay, setPayoutToPay] = useState(null);
  const [paymentReference, setPaymentReference] = useState("");
  const [selectedLead, setSelectedLead] = useState(null);
  const [activityDraft, setActivityDraft] = useState({ type: "NOTE", subject: "", details: "", dueAt: "" });
  const [agentToLink, setAgentToLink] = useState(null);
  const [linkEmail, setLinkEmail] = useState("");
  const [agentToUnlink, setAgentToUnlink] = useState(null);
  const [unlinkReason, setUnlinkReason] = useState("");
  const [agentToTerminate, setAgentToTerminate] = useState(null);
  const [codeToRevoke, setCodeToRevoke] = useState(null);
  const [program, setProgram] = useState({ name: "", code: "", description: "", referredEntityType: "BOTH", attributionModel: "FIRST_TOUCH", attributionWindowDays: 60, commissionDurationDays: 365, holdingPeriodDays: 14, qualificationRules: [], commissionRules: [], currencyMode: "TRANSACTION_CURRENCY", minimumPayoutAmount: 0 });
  const [agent, setAgent] = useState({ firstName: "", lastName: "", email: "", phoneNumber: "", employeeReference: "", agentType: "INTERNAL_SALES" });
  const [code, setCode] = useState({ programId: "", agentId: "", destinationUrl: "/sign-up", campaignCode: "", channel: "WHATSAPP", maximumUses: "" });
  const [payoutDraft, setPayoutDraft] = useState({ agentId: "", currency: "NGN" });
  const [leadDraft, setLeadDraft] = useState({ ownerAgentId: "", firstName: "", lastName: "", email: "", phoneNumber: "", entityType: "CUSTOMER", source: "DIRECT", nextFollowUpAt: "", expectedValue: "", currency: "NGN", referralCodeId: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const resources = [
      ["programmes", "/admin/referral-programs", setProgrammes],
      ["sales agents", "/admin/sales-agents", setAgents],
      ["referral codes", "/admin/referral-codes", setCodes],
      ["referrals", "/admin/referrals", setReferrals],
      ["commission earnings", "/admin/commission-earnings", setEarnings],
      ["commission payouts", "/admin/commission-payouts", setPayouts],
      ["CRM leads", "/admin/crm/leads", setLeads],
      ["referral analytics", "/admin/referral-analytics", (data) => setAnalytics(data)],
    ];
    const results = await Promise.allSettled(resources.map(([, url]) => apiClient.get(url, { params: { limit: 100 } })));
    results.forEach((result, index) => {
      const [label, url, setter] = resources[index];
      if (result.status === "fulfilled") setter(result.value.data.data || []);
      else toast.error(`Could not load ${label} (${url}): ${result.reason?.response?.data?.message || result.reason?.message || "Request failed"}`);
    });
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeTab = (nextTab) => { setTab(nextTab); setComposerOpen(false); };
  const run = async (request) => {
    setSaving(true);
    try {
      const response = await request();
      toast.success(response.data?.message || "Saved");
      await load();
      return true;
    } catch (error) {
      const method = error?.config?.method?.toUpperCase() || "REQUEST";
      const url = error?.config?.url || "referral endpoint";
      toast.error(`${method} ${url}: ${error?.response?.data?.message || error.message || "Request failed"}`);
      return false;
    } finally { setSaving(false); }
  };

  const createProgram = async (event) => {
    event.preventDefault();
    const qualificationRules = program.qualificationRules.map((rule) => ({ ...rule, value: Number(rule.value), windowDays: rule.windowDays ? Number(rule.windowDays) : undefined }));
    const commissionRules = program.commissionRules.map((rule) => ({ ...rule, rate: Number(rule.rate), currency: rule.calculationType === "FIXED" ? rule.currency.toUpperCase() : undefined, minimumSourceAmount: rule.minimumSourceAmount === "" ? undefined : Number(rule.minimumSourceAmount), maximumCommissionAmount: rule.maximumCommissionAmount === "" ? undefined : Number(rule.maximumCommissionAmount) }));
    const payload = { ...program, qualificationRules, commissionRules, attributionWindowDays: Number(program.attributionWindowDays), commissionDurationDays: program.commissionDurationDays ? Number(program.commissionDurationDays) : null, holdingPeriodDays: Number(program.holdingPeriodDays), minimumPayoutAmount: Number(program.minimumPayoutAmount) };
    const ok = await run(() => editingProgramId ? apiClient.put(`/admin/referral-programs/${editingProgramId}`, payload) : apiClient.post("/admin/referral-programs", payload));
    if (ok) { setProgram((old) => ({ ...old, name: "", code: "", description: "", qualificationRules: [], commissionRules: [] })); setEditingProgramId(null); setComposerOpen(false); }
  };
  const editProgram = (item) => { setProgram({ name: item.name || "", code: item.code || "", description: item.description || "", referredEntityType: item.referredEntityType || "BOTH", attributionModel: item.attributionModel || "FIRST_TOUCH", attributionWindowDays: item.attributionWindowDays ?? 60, commissionDurationDays: item.commissionDurationDays ?? "", holdingPeriodDays: item.holdingPeriodDays ?? 14, qualificationRules: item.qualificationRules || [], commissionRules: item.commissionRules || [], currencyMode: item.currencyMode || "TRANSACTION_CURRENCY", minimumPayoutAmount: item.minimumPayoutAmount ?? 0 }); setEditingProgramId(item.id); setComposerOpen(true); };

  const addQualificationRule = () => {
    const entityType = program.referredEntityType === "VENDOR" ? "VENDOR" : "CUSTOMER";
    setProgram((currentProgram) => ({ ...currentProgram, qualificationRules: [...currentProgram.qualificationRules, blankQualificationRule(entityType)] }));
  };
  const updateQualificationRule = (id, changes) => setProgram((currentProgram) => ({
    ...currentProgram,
    qualificationRules: currentProgram.qualificationRules.map((rule) => {
      if (rule.id !== id) return rule;
      const next = { ...rule, ...changes };
      if (changes.entityType) next.metric = qualificationMetrics[changes.entityType][0][0];
      return next;
    }),
  }));
  const removeQualificationRule = (id) => setProgram((currentProgram) => ({ ...currentProgram, qualificationRules: currentProgram.qualificationRules.filter((rule) => rule.id !== id) }));
  const addCommissionRule = () => {
    const entityType = program.referredEntityType === "VENDOR" ? "VENDOR" : "CUSTOMER";
    setProgram((currentProgram) => ({ ...currentProgram, commissionRules: [...currentProgram.commissionRules, blankCommissionRule(entityType)] }));
  };
  const updateCommissionRule = (id, changes) => setProgram((currentProgram) => ({ ...currentProgram, commissionRules: currentProgram.commissionRules.map((rule) => rule.id === id ? { ...rule, ...changes, ...(changes.entityType ? { trigger: changes.entityType === "VENDOR" ? "VENDOR_COMPLETED_ORDER" : "CUSTOMER_COMPLETED_ORDER" } : {}) } : rule) }));
  const removeCommissionRule = (id) => setProgram((currentProgram) => ({ ...currentProgram, commissionRules: currentProgram.commissionRules.filter((rule) => rule.id !== id) }));
  const changeReferredEntityType = (referredEntityType) => setProgram((currentProgram) => ({
    ...currentProgram,
    referredEntityType,
    qualificationRules: referredEntityType === "BOTH" ? currentProgram.qualificationRules : currentProgram.qualificationRules.map((rule) => ({
      ...rule,
      entityType: referredEntityType,
      metric: qualificationMetrics[referredEntityType].some(([metric]) => metric === rule.metric) ? rule.metric : qualificationMetrics[referredEntityType][0][0],
    })),
    commissionRules: referredEntityType === "BOTH" ? currentProgram.commissionRules : currentProgram.commissionRules.map((rule) => ({ ...rule, entityType: referredEntityType, trigger: referredEntityType === "VENDOR" ? "VENDOR_COMPLETED_ORDER" : "CUSTOMER_COMPLETED_ORDER" })),
  }));

  const createAgent = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(agent).filter(([, value]) => value !== ""));
    const ok = await run(() => apiClient.post("/admin/sales-agents", payload));
    if (ok) { setAgent((old) => ({ ...old, firstName: "", lastName: "", email: "", phoneNumber: "", employeeReference: "" })); setComposerOpen(false); }
  };
  const linkAgentAccount = async (event) => {
    event.preventDefault();
    const ok = await run(() => apiClient.post(`/admin/sales-agents/${agentToLink.id}/link-account`, { email: linkEmail }));
    if (ok) { setAgentToLink(null); setLinkEmail(""); }
  };
  const unlinkAgentAccount = async (event) => {
    event.preventDefault();
    const ok = await run(() => apiClient.post(`/admin/sales-agents/${agentToUnlink.id}/unlink-account`, { reason: unlinkReason }));
    if (ok) { setAgentToUnlink(null); setUnlinkReason(""); }
  };

  const createCode = async (event) => {
    event.preventDefault();
    const payload = { ...code, maximumUses: code.maximumUses ? Number(code.maximumUses) : null, campaignCode: code.campaignCode || null };
    const ok = await run(() => apiClient.post("/admin/referral-codes", payload));
    if (ok) { setCode((old) => ({ ...old, campaignCode: "", maximumUses: "" })); setComposerOpen(false); }
  };

  const copy = async (value) => { await navigator.clipboard.writeText(value); toast.success("Referral link copied"); };
  const reverseEarning = async (event) => {
    event.preventDefault();
    const ok = await run(() => apiClient.post(`/admin/commission-earnings/${earningToReverse.id}/reverse`, { reason: reversalReason }));
    if (ok) { setEarningToReverse(null); setReversalReason(""); }
  };
  const createPayout = async (event) => {
    event.preventDefault();
    const ok = await run(() => apiClient.post("/admin/commission-payouts", payoutDraft));
    if (ok) { setComposerOpen(false); setPayoutDraft({ agentId: "", currency: "NGN" }); }
  };
  const markPayoutPaid = async (event) => {
    event.preventDefault();
    const ok = await run(() => apiClient.post(`/admin/commission-payouts/${payoutToPay.id}/paid`, { paymentReference }));
    if (ok) { setPayoutToPay(null); setPaymentReference(""); }
  };
  const createLead = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(leadDraft).filter(([, value]) => value !== ""));
    if (payload.expectedValue) payload.expectedValue = Number(payload.expectedValue);
    const ok = await run(() => apiClient.post("/admin/crm/leads", payload));
    if (ok) { setComposerOpen(false); setLeadDraft((currentLead) => ({ ...currentLead, firstName: "", lastName: "", email: "", phoneNumber: "", nextFollowUpAt: "", expectedValue: "", referralCodeId: "" })); }
  };
  const moveLead = (lead, direction) => {
    const currentIndex = crmStages.indexOf(lead.stage);
    const targetStage = crmStages[currentIndex + direction];
    if (!targetStage) return;
    run(() => apiClient.patch(`/admin/crm/leads/${lead.id}/stage`, { stage: targetStage, ...(targetStage === "LOST" ? { lostReason: "Closed as lost by sales team" } : {}) }));
  };
  const openLead = async (leadId) => {
    try { const response = await apiClient.get(`/admin/crm/leads/${leadId}`); setSelectedLead(response.data.data); }
    catch (error) { toast.error(error?.response?.data?.message || "Could not load lead details"); }
  };
  const addLeadActivity = async (event) => {
    event.preventDefault();
    const payload = Object.fromEntries(Object.entries(activityDraft).filter(([, value]) => value !== ""));
    const ok = await run(() => apiClient.post(`/admin/crm/leads/${selectedLead.id}/activities`, payload));
    if (ok) { setActivityDraft({ type: "NOTE", subject: "", details: "", dueAt: "" }); await openLead(selectedLead.id); }
  };
  const activeProgrammes = useMemo(() => programmes.filter((item) => item.status === "ACTIVE"), [programmes]);
  const activeAgents = useMemo(() => agents.filter((item) => item.status === "ACTIVE"), [agents]);
  const payableAgentIds = useMemo(() => new Set(earnings.filter((item) => item.status === "AVAILABLE" && !item.payoutBatchId).map((item) => item.agentId)), [earnings]);
  const current = tabDetails[tab];
  const CurrentIcon = current.icon;

  return <div className={`referral-theme mx-auto w-full max-w-[1500px] space-y-6 rounded-3xl p-4 transition-colors md:px-5 md:py-5 ${darkMode ? "referral-dark" : ""}`}>
    <PageHeader eyebrow="Growth workspace" title="Referral management" description="Run your sales referral operation—from campaign setup to attributed registration." />

    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {[
        ["Programmes", analytics?.totals?.programmes ?? programmes.length, "configured", "#f97316"],
        ["Active agents", analytics?.totals?.activeAgents ?? activeAgents.length, `${analytics?.totals?.agents ?? agents.length} total`, "#10b981"],
        ["Tracking links", analytics?.totals?.codes ?? codes.length, `${codes.reduce((sum, item) => sum + Number(item.usageCount || 0), 0)} uses`, "#3b82f6"],
        ["Attributed users", analytics?.totals?.referrals ?? referrals.length, "recorded signups", "#8b5cf6"],
      ].map(([label, value, note, accent]) => <div key={label} style={{ borderTopColor: accent }} className="rounded-2xl border border-slate-200 border-t-[3px] bg-white p-4 shadow-sm"><p className="text-2xl font-bold tracking-tight text-slate-950">{value}</p><p className="mt-1 text-sm font-semibold text-slate-700">{label}</p><p className="mt-0.5 text-xs text-slate-400">{note}</p></div>)}
    </div>

    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <Tabs items={tabs} value={tab} onChange={changeTab} />
      {current.action && <Button icon={Plus} onClick={() => setComposerOpen(true)}>{current.action}</Button>}
    </div>

    <div className="flex items-center gap-3">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><CurrentIcon size={19}/></div>
      <div><h2 className="text-lg font-bold tracking-tight text-slate-950">{current.title}</h2><p className="text-sm text-slate-500">{current.description}</p></div>
    </div>

    {loading ? <div className="grid min-h-64 place-items-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-500 shadow-sm">Loading referral data...</div> : <>
      {tab === "CRM" && <div className="overflow-x-auto pb-2"><div className="grid min-w-[1380px] grid-cols-6 gap-3">{crmStages.map((stage) => { const stageLeads = leads.filter((lead) => lead.stage === stage); return <section key={stage} className="rounded-2xl bg-slate-100/80 p-3"><header className="mb-3 flex items-center justify-between px-1"><div><h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">{formatLabel(stage)}</h3><p className="mt-0.5 text-[11px] text-slate-400">{stageLeads.length} lead{stageLeads.length === 1 ? "" : "s"}</p></div><span className="grid h-7 min-w-7 place-items-center rounded-lg bg-white px-2 text-xs font-bold text-slate-600 shadow-sm">{stageLeads.length}</span></header><div className="space-y-3">{stageLeads.map((lead) => <article key={lead.id} className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.07)]"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h4 className="truncate text-sm font-bold text-slate-900">{lead.firstName} {lead.lastName}</h4><p className="mt-1 truncate text-xs text-slate-500">{lead.email || lead.phoneNumber || "No contact details"}</p></div><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${stage === "WON" ? "bg-emerald-500" : stage === "LOST" ? "bg-red-400" : "bg-orange-400"}`}/></div><div className="mt-3 space-y-1.5 text-xs text-slate-500"><p>{formatLabel(lead.entityType)} · {lead.source || "Direct"}</p><p className="font-medium text-slate-700">{lead.owner?.firstName} {lead.owner?.lastName}</p>{lead.nextFollowUpAt && <p className="flex items-center gap-1.5 text-orange-700"><CalendarDays size={13}/>{new Date(lead.nextFollowUpAt).toLocaleDateString()}</p>}{lead.expectedValue && <p className="font-semibold text-slate-800">{lead.currency} {Number(lead.expectedValue).toLocaleString()}</p>}</div><div className="mt-4 flex items-center justify-between"><Button size="icon" variant="ghost" disabled={stage === "NEW"} aria-label="Move lead back" onClick={() => moveLead(lead, -1)}><ChevronLeft size={15}/></Button><Button size="sm" variant="ghost" onClick={() => openLead(lead.id)}>Details</Button><Button size="icon" variant="ghost" disabled={["WON", "LOST"].includes(stage)} aria-label="Move lead forward" onClick={() => moveLead(lead, 1)}><ChevronRight size={15}/></Button></div></article>)}{!stageLeads.length && <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-8 text-center text-xs text-slate-400">No leads</div>}</div></section>; })}</div></div>}

      {tab === "Programmes" && <Panel title="All programmes" description="Campaign rules and current availability" count={`${programmes.length} total`}>
        {!programmes.length ? <div className="p-5"><Empty icon={<Megaphone size={22}/>} title="No programmes yet" description="Create a programme to define attribution rules for your sales team." /></div> : <div className="grid gap-4 p-5 lg:grid-cols-2 2xl:grid-cols-3">
          {programmes.map((item) => <article key={item.id} className="group rounded-xl border border-slate-200 p-5 transition hover:border-slate-300 hover:shadow-md">
            <div className="flex items-start justify-between gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-50 text-orange-600"><Megaphone size={18}/></div><Status value={item.status}/></div>
            <h3 className="mt-4 font-bold text-slate-950">{item.name}</h3><p className="mt-1 font-mono text-[11px] font-semibold text-slate-400">{item.code}</p>
            <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{item.description || "No programme description provided."}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs"><div><p className="text-slate-400">Attribution</p><p className="mt-1 font-semibold text-slate-700">{formatLabel(item.attributionModel)}</p></div><div><p className="text-slate-400">Click window</p><p className="mt-1 font-semibold text-slate-700">{item.attributionWindowDays} days</p></div><div><p className="text-slate-400">Qualification</p><p className="mt-1 font-semibold text-slate-700">{item.qualificationRules?.length || 0} rule{item.qualificationRules?.length === 1 ? "" : "s"}</p></div><div><p className="text-slate-400">Commission</p><p className="mt-1 font-semibold text-slate-700">{item.commissionRules?.length || 0} rule{item.commissionRules?.length === 1 ? "" : "s"}</p></div><div><p className="text-slate-400">Holding period</p><p className="mt-1 font-semibold text-slate-700">{item.holdingPeriodDays ?? 14} days</p></div><div><p className="text-slate-400">Earning period</p><p className="mt-1 font-semibold text-slate-700">{item.commissionDurationDays ? `${item.commissionDurationDays} days` : "No limit"}</p></div></div>
            <div className="mt-4 flex gap-2">{item.status === "DRAFT" && <><Button variant="secondary" onClick={() => editProgram(item)}>Edit</Button><Button loading={saving} onClick={() => run(() => apiClient.post(`/admin/referral-programs/${item.id}/publish`))}>Publish</Button></>}{item.status === "ACTIVE" && <Button variant="secondary" onClick={() => run(() => apiClient.patch(`/admin/referral-programs/${item.id}/status`, { status: "PAUSED" }))}>Pause</Button>}{item.status === "PAUSED" && <Button onClick={() => run(() => apiClient.patch(`/admin/referral-programs/${item.id}/status`, { status: "ACTIVE" }))}>Resume</Button>}</div>
          </article>)}
        </div>}
      </Panel>}

      {tab === "Sales agents" && <Panel title="Sales agents" description="People eligible to receive attribution" count={`${agents.length} total`}>
        {!agents.length ? <div className="p-5"><Empty icon={<Users size={22}/>} title="No sales agents yet" description="Add your first team member, then activate them to generate links." /></div> : <div className="space-y-2 bg-slate-50/60 p-3">
          {agents.map((item) => <div key={item.id} className="flex flex-col gap-4 rounded-xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,.04)] transition hover:shadow-md sm:flex-row sm:items-center"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{item.firstName?.[0]}{item.lastName?.[0]}</div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-bold text-slate-900">{item.firstName} {item.lastName}</h3><p className="mt-0.5 truncate text-xs text-slate-500">{item.email} <span className="px-1 text-slate-300">•</span> {item.agentCode}</p><p className={`mt-1 text-xs font-semibold ${item.user ? "text-emerald-600" : "text-amber-600"}`}>{item.user ? `Linked to ${item.user.email} · ${formatLabel(item.user.accountType)}` : "Workspace account not linked"}</p></div><span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{formatLabel(item.agentType)}</span><Status value={item.status}/><div className="flex flex-wrap gap-2">{item.status !== "TERMINATED" && (item.user ? <Button size="sm" variant="ghost" onClick={() => setAgentToUnlink(item)}>Unlink</Button> : <Button size="sm" variant="secondary" onClick={() => { setAgentToLink(item); setLinkEmail(item.email || ""); }}>Link account</Button>)}{item.status === "INVITED" && <Button size="sm" onClick={() => run(() => apiClient.patch(`/admin/sales-agents/${item.id}/status`, { status: "ACTIVE" }))}>Activate</Button>}{item.status === "ACTIVE" && <Button size="sm" variant="secondary" onClick={() => run(() => apiClient.patch(`/admin/sales-agents/${item.id}/status`, { status: "SUSPENDED" }))}>Suspend</Button>}{item.status === "SUSPENDED" && <Button size="sm" onClick={() => run(() => apiClient.patch(`/admin/sales-agents/${item.id}/status`, { status: "ACTIVE" }))}>Reactivate</Button>}{item.status !== "TERMINATED" && <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setAgentToTerminate(item)}>Terminate</Button>}</div></div>)}
        </div>}
      </Panel>}

      {tab === "Referral codes" && <Panel title="Generated tracking links" description="Links available for your team to share" count={`${codes.length} total`}>
        {!codes.length ? <div className="p-5"><Empty icon={<Link2 size={22}/>} title="No tracking links yet" description="Publish a programme and activate an agent before generating a link." /></div> : <div className="space-y-2 bg-slate-50/60 p-3">
          {codes.map((item) => <div key={item.id} className="rounded-xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,.04)] transition hover:shadow-md"><div className="flex flex-col gap-4 xl:flex-row xl:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-mono text-sm font-bold text-slate-900">{item.code}</h3><Status value={item.status}/><span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700">{formatLabel(item.channel)}</span></div><p className="mt-1.5 text-xs text-slate-500">{item.agent?.firstName} {item.agent?.lastName} <span className="px-1 text-slate-300">•</span> {item.program?.name} <span className="px-1 text-slate-300">•</span> {item.usageCount}{item.maximumUses ? `/${item.maximumUses}` : ""} uses</p></div><div className="flex min-w-0 gap-2 xl:w-[44%]"><Input readOnly className="min-w-0 bg-slate-50 font-mono text-xs" value={item.referralUrl}/><Button variant="secondary" icon={Copy} onClick={() => copy(item.referralUrl)}>Copy</Button></div><div className="flex gap-2">{item.status === "ACTIVE" && <Button size="sm" variant="secondary" onClick={() => run(() => apiClient.patch(`/admin/referral-codes/${item.id}/status`, { status: "PAUSED" }))}>Pause</Button>}{item.status === "PAUSED" && <Button size="sm" onClick={() => run(() => apiClient.patch(`/admin/referral-codes/${item.id}/status`, { status: "ACTIVE" }))}>Resume</Button>}{!["REVOKED", "EXPIRED"].includes(item.status) && <Button size="sm" variant="ghost" className="text-red-600" onClick={() => setCodeToRevoke(item)}>Revoke</Button>}</div></div></div>)}
        </div>}
      </Panel>}

      {tab === "Referrals" && <Panel title="Attributed users" description="Registrations credited to a referral link" count={`${referrals.length} total`}>
        {!referrals.length ? <div className="p-5"><Empty icon={<UserCheck size={22}/>} title="No attributed registrations" description="Open a generated tracking link and complete signup to test the full flow." /></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Referred user</th><th className="px-5 py-3">Agent</th><th className="px-5 py-3">Code</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Attributed</th></tr></thead><tbody className="divide-y divide-slate-100">{referrals.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{item.referredUser?.firstName} {item.referredUser?.lastName}</div><div className="mt-0.5 text-xs text-slate-500">{item.referredUser?.email}</div></td><td className="px-5 py-4 text-slate-600">{item.agent?.firstName} {item.agent?.lastName}</td><td className="px-5 py-4 font-mono text-xs font-semibold text-slate-700">{item.referralCode?.code}</td><td className="px-5 py-4 text-slate-600">{formatLabel(item.referredEntityType)}</td><td className="px-5 py-4"><Status value={item.status}/></td><td className="px-5 py-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{new Date(item.attributedAt).toLocaleString()}</span></td></tr>)}</tbody></table></div>}
      </Panel>}

      {tab === "Earnings" && <Panel title="Commission ledger" description="Immutable earnings created from qualified referral activity" count={`${earnings.length} total`}>
        {!earnings.length ? <div className="p-5"><Empty icon={<CircleDollarSign size={22}/>} title="No commission earnings yet" description="Earnings appear after a qualified referral completes activity covered by a commission rule." /></div> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Sales agent</th><th className="px-5 py-3">Programme</th><th className="px-5 py-3">Source</th><th className="px-5 py-3">Calculation</th><th className="px-5 py-3">Commission</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Available</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">{earnings.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="px-5 py-4"><div className="font-semibold text-slate-900">{item.agent?.firstName} {item.agent?.lastName}</div><div className="mt-0.5 text-xs text-slate-500">{item.agent?.agentCode}</div></td><td className="px-5 py-4"><div className="font-medium text-slate-700">{item.program?.name}</div><div className="mt-0.5 font-mono text-[11px] text-slate-400">{item.program?.code}</div></td><td className="px-5 py-4"><div className="text-slate-700">{formatLabel(item.sourceType)}</div><div className="mt-0.5 font-mono text-[11px] text-slate-400">{item.sourceId?.slice(0, 8)}…</div></td><td className="px-5 py-4 text-slate-600">{item.currency} {Number(item.baseAmount).toLocaleString()}</td><td className="px-5 py-4 font-bold text-slate-950">{item.currency} {Number(item.amount).toLocaleString()}</td><td className="px-5 py-4"><Status value={item.status}/></td><td className="px-5 py-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><CalendarDays size={14}/>{new Date(item.heldUntil).toLocaleDateString()}</span></td><td className="px-5 py-4 text-right">{!["REVERSED", "CANCELLED"].includes(item.status) && <Button size="sm" variant="ghost" onClick={() => setEarningToReverse(item)}>Reverse</Button>}</td></tr>)}</tbody></table></div>}
      </Panel>}

      {tab === "Payouts" && <Panel title="Payout batches" description="Controlled disbursements backed by available ledger entries" count={`${payouts.length} total`}>
        {!payouts.length ? <div className="p-5"><Empty icon={<CircleDollarSign size={22}/>} title="No payout batches yet" description="Create a payout after an agent has available earnings above the programme minimum." /></div> : <div className="space-y-2 bg-slate-50/60 p-3">{payouts.map((item) => <article key={item.id} className="rounded-xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,.04)]"><div className="flex flex-col gap-4 xl:flex-row xl:items-center"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{item.agent?.firstName} {item.agent?.lastName}</h3><Status value={item.status}/></div><p className="mt-1 text-xs text-slate-500">{item.agent?.agentCode} <span className="px-1 text-slate-300">•</span> {item.earningCount} earning{item.earningCount === 1 ? "" : "s"} <span className="px-1 text-slate-300">•</span> Created {new Date(item.createdAt).toLocaleDateString()}</p></div><div className="xl:text-right"><p className="text-xl font-bold text-slate-950">{item.currency} {Number(item.totalAmount).toLocaleString()}</p>{item.paymentReference && <p className="mt-1 font-mono text-[11px] text-slate-400">{item.paymentReference}</p>}</div><div className="flex flex-wrap gap-2">{item.status === "DRAFT" && <><Button size="sm" onClick={() => run(() => apiClient.post(`/admin/commission-payouts/${item.id}/approve`))}>Approve</Button><Button size="sm" variant="ghost" onClick={() => run(() => apiClient.post(`/admin/commission-payouts/${item.id}/cancel`))}>Cancel</Button></>}{["APPROVED", "PROCESSING"].includes(item.status) && <Button size="sm" variant="success" onClick={() => setPayoutToPay(item)}>Mark paid</Button>}</div></div></article>)}</div>}
      </Panel>}
    </>}

    <Modal open={composerOpen && tab === "CRM"} onClose={() => setComposerOpen(false)} title="Add sales lead" description="Assign ownership and capture the next action while the opportunity is fresh.">
      <form onSubmit={createLead} className="space-y-5 pt-2"><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" required><Input required value={leadDraft.firstName} onChange={(event) => setLeadDraft({ ...leadDraft, firstName: event.target.value })}/></Field><Field label="Last name" required><Input required value={leadDraft.lastName} onChange={(event) => setLeadDraft({ ...leadDraft, lastName: event.target.value })}/></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Email"><Input type="email" value={leadDraft.email} onChange={(event) => setLeadDraft({ ...leadDraft, email: event.target.value })}/></Field><Field label="Phone number"><Input value={leadDraft.phoneNumber} onChange={(event) => setLeadDraft({ ...leadDraft, phoneNumber: event.target.value })}/></Field></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Owner" required><Select required value={leadDraft.ownerAgentId} onChange={(event) => setLeadDraft({ ...leadDraft, ownerAgentId: event.target.value })}><option value="">Select sales agent</option>{activeAgents.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</Select></Field><Field label="Lead type"><Select value={leadDraft.entityType} onChange={(event) => setLeadDraft({ ...leadDraft, entityType: event.target.value })}><option value="CUSTOMER">Customer</option><option value="VENDOR">Vendor</option></Select></Field><Field label="Source"><Select value={leadDraft.source} onChange={(event) => setLeadDraft({ ...leadDraft, source: event.target.value })}><option value="DIRECT">Direct outreach</option><option value="WHATSAPP">WhatsApp</option><option value="PHONE">Phone</option><option value="EMAIL">Email</option><option value="EVENT">Event</option><option value="SOCIAL_MEDIA">Social media</option></Select></Field><Field label="Referral link"><Select value={leadDraft.referralCodeId} onChange={(event) => setLeadDraft({ ...leadDraft, referralCodeId: event.target.value })}><option value="">Not assigned</option>{codes.filter((item) => item.agentId === leadDraft.ownerAgentId && item.status === "ACTIVE").map((item) => <option key={item.id} value={item.id}>{item.code}</option>)}</Select></Field><Field label="Next follow-up"><Input type="datetime-local" value={leadDraft.nextFollowUpAt} onChange={(event) => setLeadDraft({ ...leadDraft, nextFollowUpAt: event.target.value })}/></Field><Field label="Expected value"><div className="flex gap-2"><Select className="w-24 shrink-0" value={leadDraft.currency} onChange={(event) => setLeadDraft({ ...leadDraft, currency: event.target.value })}><option value="NGN">NGN</option><option value="USD">USD</option><option value="GBP">GBP</option></Select><Input min="0" step="0.01" type="number" value={leadDraft.expectedValue} onChange={(event) => setLeadDraft({ ...leadDraft, expectedValue: event.target.value })}/></div></Field></div><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button><Button loading={saving}>Add lead</Button></div></form>
    </Modal>

    <Modal open={Boolean(selectedLead)} onClose={() => setSelectedLead(null)} title={selectedLead ? `${selectedLead.firstName} ${selectedLead.lastName}` : "Lead details"} description={selectedLead ? `${formatLabel(selectedLead.entityType)} lead · ${formatLabel(selectedLead.stage)}` : ""} width="max-w-4xl">
      {selectedLead && <div className="grid gap-6 pt-2 lg:grid-cols-[1fr_1.15fr]"><section className="space-y-5"><div className="grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-2"><div><p className="text-xs text-slate-400">Email</p><p className="mt-1 font-semibold text-slate-800">{selectedLead.email || "Not supplied"}</p></div><div><p className="text-xs text-slate-400">Phone</p><p className="mt-1 font-semibold text-slate-800">{selectedLead.phoneNumber || "Not supplied"}</p></div><div><p className="text-xs text-slate-400">Owner</p><p className="mt-1 font-semibold text-slate-800">{selectedLead.owner?.firstName} {selectedLead.owner?.lastName}</p></div><div><p className="text-xs text-slate-400">Source</p><p className="mt-1 font-semibold text-slate-800">{formatLabel(selectedLead.source || "DIRECT")}</p></div>{selectedLead.nextFollowUpAt && <div><p className="text-xs text-slate-400">Next follow-up</p><p className="mt-1 font-semibold text-orange-700">{new Date(selectedLead.nextFollowUpAt).toLocaleString()}</p></div>}{selectedLead.referralCode && <div><p className="text-xs text-slate-400">Referral code</p><p className="mt-1 font-mono text-xs font-bold text-slate-800">{selectedLead.referralCode.code}</p></div>}</div><form onSubmit={addLeadActivity} className="space-y-4"><div><h3 className="font-bold text-slate-900">Record activity</h3><p className="mt-1 text-xs text-slate-500">Keep the lead history useful for the whole team.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field label="Activity type"><Select value={activityDraft.type} onChange={(event) => setActivityDraft({ ...activityDraft, type: event.target.value })}><option value="NOTE">Note</option><option value="CALL">Call</option><option value="EMAIL">Email</option><option value="MEETING">Meeting</option><option value="TASK">Follow-up task</option></Select></Field><Field label="Due date"><Input type="datetime-local" value={activityDraft.dueAt} onChange={(event) => setActivityDraft({ ...activityDraft, dueAt: event.target.value })}/></Field></div><Field label="Subject" required><Input required maxLength="191" value={activityDraft.subject} onChange={(event) => setActivityDraft({ ...activityDraft, subject: event.target.value })}/></Field><Field label="Details"><Textarea maxLength="5000" value={activityDraft.details} onChange={(event) => setActivityDraft({ ...activityDraft, details: event.target.value })}/></Field><div className="flex justify-end"><Button loading={saving}>Add activity</Button></div></form></section><section><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Activity timeline</h3><span className="text-xs font-semibold text-slate-400">{selectedLead.activities?.length || 0} entries</span></div><div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">{selectedLead.activities?.map((activity) => <article key={activity.id} className="rounded-xl bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-bold text-slate-800">{activity.subject}</p><p className="mt-1 text-xs font-semibold uppercase tracking-wide text-orange-600">{formatLabel(activity.type)}</p></div><time className="text-[11px] text-slate-400">{new Date(activity.createdAt).toLocaleString()}</time></div>{activity.details && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{activity.details}</p>}{activity.dueAt && <p className="mt-3 flex items-center gap-1.5 text-xs text-orange-700"><CalendarDays size={13}/>Due {new Date(activity.dueAt).toLocaleString()}</p>}</article>)}{!selectedLead.activities?.length && <EmptyState title="No activity recorded" description="Add the first note, call, email, meeting or follow-up task." />}</div></section></div>}
    </Modal>

    <Modal open={composerOpen && tab === "Programmes"} onClose={() => { setComposerOpen(false); setEditingProgramId(null); }} title={editingProgramId ? "Edit referral programme" : "Create referral programme"} description="Define attribution, qualification and earning controls. Programme rules remain editable while in draft." width="max-w-4xl">
      <form onSubmit={createProgram} className="space-y-6 pt-2">
        <section className="space-y-4">
          <div><h3 className="text-sm font-bold text-slate-900">Programme details</h3><p className="mt-1 text-xs text-slate-500">Give the campaign a clear internal identity.</p></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Programme name" required><Input required placeholder="Vendor growth campaign" value={program.name} onChange={(event) => setProgram({ ...program, name: event.target.value })}/></Field><Field label="Internal code" required hint="Letters, numbers, hyphens and underscores."><Input required placeholder="SALES_2026" value={program.code} onChange={(event) => setProgram({ ...program, code: event.target.value.toUpperCase() })}/></Field></div>
          <Field label="Description"><Textarea placeholder="What should this programme achieve?" value={program.description} onChange={(event) => setProgram({ ...program, description: event.target.value })}/></Field>
        </section>

        <section className="rounded-2xl bg-slate-50 p-5">
          <div className="mb-4 flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-white text-orange-600 shadow-sm"><Link2 size={17}/></div><div><h3 className="text-sm font-bold text-slate-900">Attribution</h3><p className="mt-0.5 text-xs text-slate-500">Decide who is eligible and which interaction receives credit.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><Field label="Referred account"><Select value={program.referredEntityType} onChange={(event) => changeReferredEntityType(event.target.value)}><option value="BOTH">Customers and vendors</option><option value="CUSTOMER">Customers only</option><option value="VENDOR">Vendors only</option></Select></Field><Field label="Attribution policy"><Select value={program.attributionModel} onChange={(event) => setProgram({ ...program, attributionModel: event.target.value })}><option value="FIRST_TOUCH">First touch</option><option value="LAST_TOUCH">Last touch</option><option value="REFERRAL_CODE_PRIORITY">Code priority</option><option value="MANUAL_ASSIGNMENT">Manual assignment</option><option value="CRM_OWNER">CRM owner</option></Select></Field><Field label="Attribution window" hint="Days after link click"><Input required min="1" type="number" value={program.attributionWindowDays} onChange={(event) => setProgram({ ...program, attributionWindowDays: event.target.value })}/></Field><Field label="Earning duration" hint="How long qualified activity can earn commission"><Input min="1" type="number" value={program.commissionDurationDays} onChange={(event) => setProgram({ ...program, commissionDurationDays: event.target.value })}/></Field></div>
        </section>

        <section className="rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><ShieldCheck size={17}/></div><div><h3 className="text-sm font-bold text-slate-900">Qualification rules</h3><p className="mt-0.5 text-xs text-slate-500">All configured rules must pass before this referral qualifies.</p></div></div><Button type="button" variant="secondary" icon={Plus} onClick={addQualificationRule}>Add rule</Button></div>
          {!program.qualificationRules.length ? <div className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-center"><p className="text-sm font-semibold text-slate-700">No qualification rules yet</p><p className="mt-1 text-xs text-slate-500">You can save the draft now and configure rules before publishing.</p></div> : <div className="mt-4 space-y-3">{program.qualificationRules.map((rule, index) => <div key={rule.id} className="rounded-xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Rule {index + 1}</span><button type="button" aria-label={`Remove rule ${index + 1}`} onClick={() => removeQualificationRule(rule.id)} className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-95"><Trash2 size={16}/></button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"><Field label="Applies to"><Select value={rule.entityType} onChange={(event) => updateQualificationRule(rule.id, { entityType: event.target.value })} disabled={program.referredEntityType !== "BOTH"}><option value="CUSTOMER">Customer</option><option value="VENDOR">Vendor</option></Select></Field><Field label="Metric" className="xl:col-span-2"><Select value={rule.metric} onChange={(event) => updateQualificationRule(rule.id, { metric: event.target.value })}>{qualificationMetrics[rule.entityType].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field><Field label="Condition"><Select value={rule.operator} onChange={(event) => updateQualificationRule(rule.id, { operator: event.target.value })}>{Object.entries(operatorLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field><Field label="Target"><Input required min="0" step="0.01" type="number" value={rule.value} onChange={(event) => updateQualificationRule(rule.id, { value: event.target.value })}/></Field><Field label="Measurement window" hint="Days from registration" className="md:col-span-2"><Input required min="1" max="3650" type="number" value={rule.windowDays} onChange={(event) => updateQualificationRule(rule.id, { windowDays: event.target.value })}/></Field></div></div>)}</div>}
        </section>

        <section className="rounded-2xl border border-slate-200 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><div className="flex items-start gap-3"><div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-600"><CircleDollarSign size={17}/></div><div><h3 className="text-sm font-bold text-slate-900">Commission rules</h3><p className="mt-0.5 text-xs text-slate-500">Define what the sales agent earns after a referral qualifies.</p></div></div><Button type="button" variant="secondary" icon={Plus} onClick={addCommissionRule}>Add commission</Button></div>
          {!program.commissionRules.length ? <div className="mt-4 rounded-xl bg-slate-50 px-4 py-5 text-center"><p className="text-sm font-semibold text-slate-700">No commission rules yet</p><p className="mt-1 text-xs text-slate-500">At least one rule per referred account type is required before publishing.</p></div> : <div className="mt-4 space-y-3">{program.commissionRules.map((rule, index) => <div key={rule.id} className="rounded-xl bg-slate-50 p-4"><div className="mb-3 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Commission {index + 1}</span><button type="button" aria-label={`Remove commission ${index + 1}`} onClick={() => removeCommissionRule(rule.id)} className="grid h-8 w-8 cursor-pointer place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 active:scale-95"><Trash2 size={16}/></button></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"><Field label="Applies to"><Select value={rule.entityType} onChange={(event) => updateCommissionRule(rule.id, { entityType: event.target.value })} disabled={program.referredEntityType !== "BOTH"}><option value="CUSTOMER">Customer order</option><option value="VENDOR">Vendor sale</option></Select></Field><Field label="Calculation"><Select value={rule.calculationType} onChange={(event) => updateCommissionRule(rule.id, { calculationType: event.target.value })}><option value="PERCENTAGE">Percentage</option><option value="FIXED">Fixed amount</option></Select></Field><Field label={rule.calculationType === "PERCENTAGE" ? "Rate (%)" : "Amount"}><Input required min="0.01" max={rule.calculationType === "PERCENTAGE" ? "100" : undefined} step="0.01" type="number" value={rule.rate} onChange={(event) => updateCommissionRule(rule.id, { rate: event.target.value })}/></Field>{rule.calculationType === "FIXED" && <Field label="Currency"><Select value={rule.currency} onChange={(event) => updateCommissionRule(rule.id, { currency: event.target.value })}><option value="NGN">NGN</option><option value="USD">USD</option><option value="GBP">GBP</option></Select></Field>}<Field label="Minimum source value" hint="Optional"><Input min="0" step="0.01" type="number" placeholder="No minimum" value={rule.minimumSourceAmount} onChange={(event) => updateCommissionRule(rule.id, { minimumSourceAmount: event.target.value })}/></Field><Field label="Maximum commission" hint="Optional cap"><Input min="0" step="0.01" type="number" placeholder="No cap" value={rule.maximumCommissionAmount} onChange={(event) => updateCommissionRule(rule.id, { maximumCommissionAmount: event.target.value })}/></Field></div></div>)}</div>}
        </section>

        <section className="rounded-2xl bg-amber-50/70 p-5"><div className="grid gap-4 sm:grid-cols-[1fr_220px] sm:items-center"><div><h3 className="text-sm font-bold text-slate-900">Commission holding period</h3><p className="mt-1 text-xs leading-5 text-slate-600">Qualified earnings remain pending during this period so refunds, cancellations and fraud checks can be completed.</p></div><Field label="Holding period" hint="0 allows immediate availability"><Input required min="0" max="365" type="number" value={program.holdingPeriodDays} onChange={(event) => setProgram({ ...program, holdingPeriodDays: event.target.value })}/></Field></div></section>

        <div className="sticky bottom-0 -mx-6 -mb-6 flex justify-end gap-3 bg-white/95 px-6 py-4 backdrop-blur"><Button type="button" variant="secondary" onClick={() => { setComposerOpen(false); setEditingProgramId(null); }}>Cancel</Button><Button loading={saving}>{editingProgramId ? "Save changes" : "Create draft"}</Button></div>
      </form>
    </Modal>

    <Modal open={composerOpen && tab === "Sales agents"} onClose={() => setComposerOpen(false)} title="Add sales agent" description="The agent starts as invited and can be activated after review.">
      <form onSubmit={createAgent} className="space-y-5 pt-2"><div className="grid gap-4 sm:grid-cols-2"><Field label="First name" required><Input required value={agent.firstName} onChange={(event) => setAgent({ ...agent, firstName: event.target.value })}/></Field><Field label="Last name" required><Input required value={agent.lastName} onChange={(event) => setAgent({ ...agent, lastName: event.target.value })}/></Field></div><Field label="Email address" required><Input required type="email" placeholder="agent@kudumart.com" value={agent.email} onChange={(event) => setAgent({ ...agent, email: event.target.value })}/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Phone number"><Input placeholder="Optional" value={agent.phoneNumber} onChange={(event) => setAgent({ ...agent, phoneNumber: event.target.value })}/></Field><Field label="Employee reference"><Input placeholder="Optional internal ID" value={agent.employeeReference} onChange={(event) => setAgent({ ...agent, employeeReference: event.target.value })}/></Field></div><Field label="Agent type"><Select value={agent.agentType} onChange={(event) => setAgent({ ...agent, agentType: event.target.value })}><option value="INTERNAL_SALES">Internal sales</option><option value="CONTRACTOR">Contractor</option><option value="AFFILIATE">Affiliate</option><option value="INFLUENCER">Influencer</option><option value="PARTNER">Partner</option></Select></Field><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button><Button loading={saving}>Add agent</Button></div></form>
    </Modal>

    <Modal open={Boolean(agentToLink)} onClose={() => { setAgentToLink(null); setLinkEmail(""); }} title="Link Kudu account" description="Give this sales agent secure access to their own CRM, links, referrals and earnings.">
      <form onSubmit={linkAgentAccount} className="space-y-5 pt-2"><div className="referral-account-note rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5 text-sm leading-6 text-orange-900">The account may be a customer or vendor. It must already exist, be active, and have a verified email address.</div><Field label="Kudu account email" required><Input required type="email" value={linkEmail} onChange={(event) => setLinkEmail(event.target.value)} /></Field><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => { setAgentToLink(null); setLinkEmail(""); }}>Cancel</Button><Button loading={saving}>Link account</Button></div></form>
    </Modal>

    <Modal open={Boolean(agentToUnlink)} onClose={() => { setAgentToUnlink(null); setUnlinkReason(""); }} title="Unlink Kudu account" description="This immediately removes access to the sales workspace without deleting referral history.">
      <form onSubmit={unlinkAgentAccount} className="space-y-5 pt-2"><Field label="Reason" required><Textarea required minLength="3" maxLength="500" placeholder="For example: linked to the wrong account" value={unlinkReason} onChange={(event) => setUnlinkReason(event.target.value)} /></Field><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => { setAgentToUnlink(null); setUnlinkReason(""); }}>Cancel</Button><Button variant="danger" loading={saving}>Unlink account</Button></div></form>
    </Modal>

    <Modal open={Boolean(agentToTerminate)} onClose={() => setAgentToTerminate(null)} title="Terminate sales agent" description="Use this when the person should permanently stop operating as a Kudu sales agent.">
      <div className="space-y-5 pt-2"><div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800">This is the safe equivalent of deleting an agent. Their access and referral links stop working, but historical referrals, earnings, payouts, and audit records are preserved. Termination cannot be reversed from the admin interface.</div>{agentToTerminate && <p className="text-sm text-slate-600">Terminate <strong className="text-slate-900">{agentToTerminate.firstName} {agentToTerminate.lastName}</strong>?</p>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setAgentToTerminate(null)}>Cancel</Button><Button variant="danger" loading={saving} onClick={async () => { const ok = await run(() => apiClient.patch(`/admin/sales-agents/${agentToTerminate.id}/status`, { status: "TERMINATED" })); if (ok) setAgentToTerminate(null); }}>Terminate agent</Button></div></div>
    </Modal>

    <Modal open={Boolean(codeToRevoke)} onClose={() => setCodeToRevoke(null)} title="Revoke referral link" description="Permanently stop this tracking link from accepting new visits or attributions.">
      <div className="space-y-5 pt-2"><div className="rounded-xl bg-red-50 p-4 text-sm leading-6 text-red-800">Existing referrals and reporting remain intact, but this link cannot be reactivated after revocation.</div>{codeToRevoke && <p className="font-mono text-sm font-bold text-slate-800">{codeToRevoke.code}</p>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setCodeToRevoke(null)}>Cancel</Button><Button variant="danger" loading={saving} onClick={async () => { const ok = await run(() => apiClient.patch(`/admin/referral-codes/${codeToRevoke.id}/status`, { status: "REVOKED" })); if (ok) setCodeToRevoke(null); }}>Revoke link</Button></div></div>
    </Modal>

    <Modal open={composerOpen && tab === "Referral codes"} onClose={() => setComposerOpen(false)} title="Generate tracking link" description="Connect an active sales agent to a published programme.">
      <form onSubmit={createCode} className="space-y-5 pt-2"><div className="grid gap-4 sm:grid-cols-2"><Field label="Programme" required><Select required value={code.programId} onChange={(event) => setCode({ ...code, programId: event.target.value })}><option value="">Select active programme</option>{activeProgrammes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select></Field><Field label="Sales agent" required><Select required value={code.agentId} onChange={(event) => setCode({ ...code, agentId: event.target.value })}><option value="">Select active agent</option>{activeAgents.map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName}</option>)}</Select></Field></div><Field label="Destination" required hint="A path within Kudu Mart."><Input required placeholder="/sign-up" value={code.destinationUrl} onChange={(event) => setCode({ ...code, destinationUrl: event.target.value })}/></Field><div className="grid gap-4 sm:grid-cols-2"><Field label="Campaign code"><Input placeholder="Optional campaign label" value={code.campaignCode} onChange={(event) => setCode({ ...code, campaignCode: event.target.value })}/></Field><Field label="Maximum uses"><Input min="1" type="number" placeholder="Unlimited" value={code.maximumUses} onChange={(event) => setCode({ ...code, maximumUses: event.target.value })}/></Field><Field label="Channel"><Select value={code.channel} onChange={(event) => setCode({ ...code, channel: event.target.value })}><option value="WHATSAPP">WhatsApp</option><option value="EMAIL">Email</option><option value="PHONE">Phone</option><option value="FIELD_SALES">Field sales</option><option value="SOCIAL_MEDIA">Social media</option><option value="EVENT">Event</option><option value="WEBSITE">Website</option><option value="OTHER">Other</option></Select></Field></div><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button><Button loading={saving}>Generate link</Button></div></form>
    </Modal>

    <Modal open={composerOpen && tab === "Payouts"} onClose={() => setComposerOpen(false)} title="Create payout batch" description="All currently available earnings for this agent and currency will be reserved in a draft batch.">
      <form onSubmit={createPayout} className="space-y-5 pt-2"><Field label="Sales agent" required><Select required value={payoutDraft.agentId} onChange={(event) => setPayoutDraft({ ...payoutDraft, agentId: event.target.value })}><option value="">Select an agent with available earnings</option>{agents.filter((item) => payableAgentIds.has(item.id)).map((item) => <option key={item.id} value={item.id}>{item.firstName} {item.lastName} · {item.agentCode}</option>)}</Select></Field><Field label="Currency" required><Select value={payoutDraft.currency} onChange={(event) => setPayoutDraft({ ...payoutDraft, currency: event.target.value })}><option value="NGN">NGN</option><option value="USD">USD</option><option value="GBP">GBP</option></Select></Field><div className="rounded-xl bg-blue-50 p-4 text-xs leading-5 text-blue-800">Creating the batch does not send money. It reserves matching earnings for finance review.</div><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setComposerOpen(false)}>Cancel</Button><Button loading={saving}>Create draft payout</Button></div></form>
    </Modal>

    <Modal open={Boolean(payoutToPay)} onClose={() => { setPayoutToPay(null); setPaymentReference(""); }} title="Record completed payout" description="Only confirm this after the payment provider or bank transfer reports success.">
      <form onSubmit={markPayoutPaid} className="space-y-5 pt-2">{payoutToPay && <div className="rounded-xl bg-emerald-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Approved payout</p><p className="mt-2 text-xl font-bold text-slate-950">{payoutToPay.currency} {Number(payoutToPay.totalAmount).toLocaleString()}</p><p className="mt-1 text-sm text-slate-600">{payoutToPay.agent?.firstName} {payoutToPay.agent?.lastName}</p></div>}<Field label="Payment reference" required hint="Use the immutable reference returned by your bank or payment provider."><Input required minLength="3" maxLength="191" placeholder="TRF-2026-000001" value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)}/></Field><div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => { setPayoutToPay(null); setPaymentReference(""); }}>Cancel</Button><Button variant="success" loading={saving}>Confirm payment</Button></div></form>
    </Modal>

    <Modal open={Boolean(earningToReverse)} onClose={() => { setEarningToReverse(null); setReversalReason(""); }} title="Reverse commission earning" description="This removes the earning from the agent's payable balance and records the reason in the permanent referral audit trail.">
      <form onSubmit={reverseEarning} className="space-y-5 pt-2">
        {earningToReverse && <div className="rounded-xl bg-red-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-red-600">Earning to reverse</p><p className="mt-2 text-xl font-bold text-slate-950">{earningToReverse.currency} {Number(earningToReverse.amount).toLocaleString()}</p><p className="mt-1 text-sm text-slate-600">{earningToReverse.agent?.firstName} {earningToReverse.agent?.lastName} · {earningToReverse.program?.name}</p></div>}
        <Field label="Reason for reversal" required hint="This reason will be retained for audit and dispute review."><Textarea required minLength="3" maxLength="500" placeholder="For example: order refunded after delivery" value={reversalReason} onChange={(event) => setReversalReason(event.target.value)}/></Field>
        {earningToReverse?.status === "PAID" && <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">This earning has already been paid. Reversing it records the debt, but recovery must be handled in a future payout adjustment.</p>}
        <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => { setEarningToReverse(null); setReversalReason(""); }}>Cancel</Button><Button variant="danger" loading={saving}>Reverse earning</Button></div>
      </form>
    </Modal>
  </div>;
}
