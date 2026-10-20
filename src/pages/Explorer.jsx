import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, List, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import OpportunityCard from "@/components/OpportunityCard";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { apiListDrafts, apiListOpportunities, apiGetProfile } from "@/lib/api";
import { profileRelevance } from "@/lib/opportunityQuality";
import { sectorLabels, sectorMatches, stageMatches } from "@/lib/opportunityTaxonomy";

const STAGES = ["Idea", "MVP", "Early Revenue", "Growth", "PMF"];
const SECTORS = ["AI / ML", "AgriTech", "DeepTech", "Fintech", "HealthTech", "Manufacturing", "Social Impact"];
const TYPES = ["Grant", "Accelerator", "Incubation", "Seed Funding", "Contest", "Fellowship"];

export default function Explorer() {
  const [view, setView] = useState("grid");
  const [q, setQ] = useState("");
  const [stages, setStages] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [types, setTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [opps, setOpps] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [sort, setSort] = useState("relevance");

  useEffect(() => {
    reload();
    const refreshProfile = () => reload();
    window.addEventListener("profile-updated", refreshProfile);
    return () => window.removeEventListener("profile-updated", refreshProfile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const reload = () => {
    setLoading(true);
    setError("");
    Promise.allSettled([apiListOpportunities(), apiListDrafts(), apiGetProfile()])
      .then(([opportunityResult, draftResult, profileResult]) => {
        if (opportunityResult.status === "rejected") throw opportunityResult.reason;
        const nextOpps = opportunityResult.value;
        const nextDrafts = draftResult.status === "fulfilled" ? draftResult.value : [];
        setProfile(profileResult.status === "fulfilled" ? profileResult.value : null);
        if (profileResult.status === "rejected") setError("Your profile could not be loaded. Opportunities are shown without personalization. Retry to load your profile.");
        else if (draftResult.status === "rejected") setError("Draft status could not be loaded. Retry before creating another draft.");
        setOpps(nextOpps);
        setDrafts(nextDrafts);

        const pendingOppId = sessionStorage.getItem("FUNDME_EXT_PENDING_OPPORTUNITY");
        if (sessionStorage.getItem("FUNDME_EXT_RELOAD") === window.location.pathname && pendingOppId) {
          sessionStorage.removeItem("FUNDME_EXT_RELOAD");
          sessionStorage.removeItem("FUNDME_EXT_PENDING_OPPORTUNITY");
          setTimeout(() => {
            const btn = document.querySelector(`[data-testid="apply-portal-${pendingOppId}"]`);
            if (btn) btn.click();
          }, 800);
        }

      })
      .catch(() => {
        setOpps([]);
        setDrafts([]);
        setError("Opportunities could not be loaded. Please retry.");
      })
      .finally(() => setLoading(false));
  };

  const toggle = (set, val) => set.includes(val) ? set.filter((v) => v !== val) : [...set, val];

  const filtered = useMemo(() => {
    return opps.map(o => ({ ...o, match: null, relevance: profileRelevance(profile, o) })).filter((o) => {
      if (q && !`${o.title} ${o.org}`.toLowerCase().includes(q.toLowerCase())) return false;
      if (types.length && !types.includes(o.type)) return false;
      if (!stageMatches(o.stage, stages)) return false;
      if (!sectorMatches(o.sectors, sectors)) return false;
      return true;
    }).sort((a, b) => {
      const deadline = o => Number.isNaN(Date.parse(o.deadline)) ? Infinity : Date.parse(o.deadline);
      if (sort === "deadline") return (deadline(a) - deadline(b)) || a.title.localeCompare(b.title);
      return b.relevance.rank - a.relevance.rank || a.title.localeCompare(b.title);
    });
  }, [opps, q, stages, sectors, types, profile, sort]);

  const activeCount = stages.length + sectors.length + types.length;
  const draftByOpp = useMemo(() => new Map(drafts.map((d) => [d.opportunity_id, d])), [drafts]);
  const handleSavedChange = (opportunityId, nextSaved) => {
    setOpps((current) =>
      current.map((opp) =>
        opp.opportunity_id === opportunityId ? { ...opp, saved: nextSaved } : opp
      )
    );
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8" data-testid="explorer-page">
      <AnimatePresence initial={false}>
        {showFilters && (
          <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 256, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }} className="shrink-0 overflow-hidden self-start sticky top-5 max-h-[calc(100vh-2.5rem)]" data-testid="explorer-filters">
            <div className="w-64 max-h-[calc(100vh-2.5rem)] overflow-y-auto pr-2 space-y-7">
              <div className="flex items-center justify-between">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold">Filters {activeCount > 0 && <span className="ml-1 text-[var(--accent)]">({activeCount})</span>}</div>
                <button onClick={() => setShowFilters(false)} className="p-1 hover:bg-slate-100 rounded-md text-slate-500" data-testid="hide-filters" title="Hide filters"><X size={14} /></button>
              </div>
              <FilterGroup label="Startup Stage" items={[...new Set([...STAGES, ...opps.flatMap(o => (o.stage || "").split(/[,;|/]/).map(s => s.trim()).filter(Boolean))])]} active={stages} onToggle={(v) => setStages(toggle(stages, v))} testid="filter-stage" />
              <FilterGroup label="Sector" items={sectorLabels([...SECTORS, ...opps.flatMap(o => o.sectors || [])]).sort()} active={sectors} onToggle={(v) => setSectors(toggle(sectors, v))} testid="filter-sector" />
              <p className="text-xs text-slate-500">Sector filters include opportunities explicitly open to all sectors. Stage filters exclude unspecified stages.</p>
              <FilterGroup label="Funding Type" items={[...new Set([...TYPES, ...opps.map(o => o.type).filter(Boolean)])].sort()} active={types} onToggle={(v) => setTypes(toggle(types, v))} testid="filter-type" />
              {activeCount > 0 && (
                <Button variant="ghost" onClick={() => { setStages([]); setSectors([]); setTypes([]); }} className="w-full text-xs text-slate-500" data-testid="clear-filters">Clear all</Button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <section className="flex-1 min-w-0">
        <div className="mb-6">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)] font-bold">Discover</div>
          <h1 className="mt-2 font-display text-4xl md:text-5xl font-bold tracking-tight">Opportunities Explorer</h1>
          <p className="mt-3 text-xs text-slate-500">Partial funding feed from Startup Grants India; its current pagination returns repeated listings. Startup India is not connected because its schemes page blocked automated access. Sector tags may be inferred from descriptions; confirm eligibility with the provider.</p>
          <p className="mt-3 text-sm text-slate-600">{profile ? `Recommended for ${profile.startup_name || "your saved startup profile"}. Matching uses sector, stage and shared topics; the strongest matches appear first.` : "Complete your Startup Profile to get personalized ordering. You can still browse all opportunities."}</p>
          {error && <div role="alert" className="mt-3 p-3 bg-amber-50 text-amber-900">{error} <button onClick={reload} className="underline font-semibold">Retry</button></div>}
        </div>

        <div className="flex items-center justify-between gap-3 mb-6 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            {!showFilters && (
              <Button variant="outline" onClick={() => setShowFilters(true)} className="rounded-md border-slate-300 h-11" data-testid="show-filters">
                <SlidersHorizontal size={14} className="mr-2" /> Filters {activeCount > 0 && <span className="ml-1 text-[var(--accent)] font-semibold">({activeCount})</span>}
              </Button>
            )}
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input placeholder="Search by name or organisation" value={q} onChange={(e) => setQ(e.target.value)}
                className="pl-9 h-11 rounded-md border-slate-300 bg-white shadow-sm" data-testid="explorer-search" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <select aria-label="Sort opportunities" value={sort} onChange={e => setSort(e.target.value)} className="border border-slate-300 rounded-md p-2 bg-white text-sm">
              <option value="relevance">Recommended for you</option><option value="deadline">Closing soon</option>
            </select>
            <span className="text-sm text-slate-600"><span className="font-semibold text-slate-900">{filtered.length}</span> opportunities</span>
            <div className="flex border border-slate-300 rounded-md overflow-hidden">
              <button onClick={() => setView("grid")} data-testid="view-grid" className={`p-2 ${view === "grid" ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600"}`}><LayoutGrid size={15} /></button>
              <button onClick={() => setView("list")} data-testid="view-list" className={`p-2 ${view === "list" ? "bg-[var(--primary)] text-white" : "bg-white text-slate-600"}`}><List size={15} /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-[var(--accent)]" /></div>
        ) : (
          <motion.div layout className={view === "grid" ? `grid grid-cols-1 ${showFilters ? "lg:grid-cols-2" : "lg:grid-cols-3"} gap-5` : "flex flex-col gap-5"}>
            {filtered.map((o) => <OpportunityCard key={o.opportunity_id} opp={o} draft={draftByOpp.get(o.opportunity_id)} onChange={reload} onSavedChange={handleSavedChange} />)}
          </motion.div>
        )}
        {!loading && !error && !filtered.length && <p className="p-8 border text-slate-600">No open opportunities match these filters. Try clearing filters or changing your search.</p>}
      </section>
    </div>
  );
}

function FilterGroup({ label, items, active, onToggle, testid }) {
  return (
    <div data-testid={testid}>
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500 font-bold mb-3">{label}</div>
      <div className="space-y-2.5">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2.5 cursor-pointer group">
            <Checkbox checked={active.includes(item)} onCheckedChange={() => onToggle(item)}
              className="data-[state=checked]:bg-[var(--accent)] data-[state=checked]:border-[var(--accent)]"
              data-testid={`${testid}-${item}`} />
            <span className="text-sm text-slate-700 group-hover:text-slate-900">{item}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

