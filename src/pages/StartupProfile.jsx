import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Building2, MapPin, Users, Globe, Sparkles, Save, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { apiGetProfile, apiSaveProfile, apiGenerateProfile, errMsg } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { getAvatarInitials } from "@/lib/avatar";

const SECTIONS = [
  { id: "company", label: "Company", Icon: Building2 },
  { id: "story", label: "Problem & Solution", Icon: Sparkles },
  { id: "traction", label: "Traction & Metrics", Icon: Users },
  { id: "presence", label: "Presence & Links", Icon: Globe },
];

const EMPTY = {
  startup_name: "", sector: "", stage: "", startup_overview: "",
  problem_statement: "", solution_summary: "", target_customers: "",
  business_model: "", traction_summary: "",
  location: "", website: "", founded: "", team_size: "",
  revenue: "", incorporation: "", dpiit: "",
};

export default function StartupProfile() {
  const [active, setActive] = useState("company");
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [showEnhancer, setShowEnhancer] = useState(false);
  const [enhanceUrl, setEnhanceUrl] = useState("");
  const [enhanceSummary, setEnhanceSummary] = useState("");
  const [enhanceFile, setEnhanceFile] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [selected, setSelected] = useState({});
  const [loadError, setLoadError] = useState("");
  const user = getUser();

  useEffect(() => {
    apiGetProfile().then((p) => setForm({ ...EMPTY, ...p })).catch((e) => setLoadError(errMsg(e, "Could not load your profile. Refresh to retry."))).finally(() => setLoading(false));
  }, []);

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setBusy(true);
    try {
      const payload = { ...form };
      if (payload.team_size) payload.team_size = Number(payload.team_size);
      const saved = await apiSaveProfile(payload);
      setForm({ ...EMPTY, ...saved });
      toast.success("Profile saved");
      window.dispatchEvent(new Event("profile-updated"));
    } catch (e) {
      toast.error(errMsg(e, "Save failed"));
    } finally {
      setBusy(false);
    }
  };

  const enhance = async () => {
    if (!enhanceUrl && !enhanceSummary && !enhanceFile) {
      toast.error("Add a website, summary, or pitch deck first.");
      return;
    }
    setEnhancing(true);
    try {
      const response = await apiGenerateProfile({ file: enhanceFile, startup_overview: enhanceSummary, website: enhanceUrl });
      const generated = response?.result || response || {};
      const proposed = Object.fromEntries(Object.keys(EMPTY)
        .filter(key => generated[key] !== undefined && generated[key] !== null &&
          String(generated[key]).trim() !== "" && String(generated[key]) !== String(form[key]))
        .map(key => [key, generated[key]]));
      if (!Object.keys(proposed).length) {
        toast.info("No new profile details were found.");
        return;
      }
      setSuggestions(proposed);
      setSelected(Object.fromEntries(Object.keys(proposed).map(key => [key, !String(form[key] ?? "").trim()])));
      toast.info("Choose which suggestions to apply. Nothing has been saved yet.");
    } catch (e) {
      toast.error(errMsg(e, "AI enhancement failed"));
    } finally {
      setEnhancing(false);
    }
  };

  if (loading) return <div className="flex justify-center py-32"><Loader2 className="animate-spin text-[var(--accent)]" /></div>;
  if (loadError) return <div role="alert" className="p-6 border border-red-200 bg-red-50">{loadError} Reload this page before editing.</div>;

  const avatarInitials = getAvatarInitials(form.startup_name, user?.name, user?.email);

  return (
    <div className="grid grid-cols-12 gap-10" data-testid="profile-page">
      <aside className="col-span-12 lg:col-span-3 lg:sticky lg:top-24 lg:self-start">
        <div className="text-[10px] uppercase tracking-[0.22em] text-[var(--accent)] font-bold mb-4">Startup profile</div>
        <div className="space-y-1">
          {SECTIONS.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => setActive(id)} data-testid={`profile-section-${id}`}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all ${active === id ? "bg-[var(--primary-light)] text-slate-950 font-semibold" : "text-slate-700 hover:bg-[var(--primary-light)]/70"}`}>
              <Icon size={15} strokeWidth={1.75} />
              {label}
            </button>
          ))}
        </div>
        <div className="mt-8 p-5 bg-[var(--primary-light)] border border-[var(--primary-light)]">
          <div className="text-xs text-[var(--accent)] font-semibold">Why this matters</div>
          <p className="mt-2 text-xs text-[var(--accent)]/80">Every field you fill increases match accuracy. AI uses your profile to draft applications.</p>
        </div>
      </aside>

      <section className="col-span-12 lg:col-span-9">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white flex items-center justify-center text-lg font-bold ring-4 ring-white shadow overflow-hidden">
              {avatarInitials}
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">{form.startup_name || user?.name || "Your startup"}</h1>
              <div className="mt-1 text-sm text-slate-500 flex items-center gap-3">
                {form.location && <><MapPin size={12} /> {form.location}<span className="text-slate-300">·</span></>}
                {form.stage || "—"} · {form.sector || "—"}
              </div>
            </div>
          </div>
          <Button className="rounded-md bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white h-11 px-5 btn-press" onClick={save} disabled={busy || enhancing || Boolean(suggestions)} data-testid="profile-save">
            {busy ? <><Loader2 size={14} className="mr-2 animate-spin" /> Saving</> : <><Save size={14} className="mr-2" /> Save changes</>}
          </Button>
        </div>

        <div className="mb-8 border border-emerald-200 bg-emerald-50/60 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-900"><Sparkles size={15} /> Enhance profile with AI</div>
              <p className="mt-1 text-xs text-emerald-800/75">Add a website, summary, or PDF. Review each suggestion before applying it to your profile.</p>
            </div>
            <Button variant="outline" onClick={() => setShowEnhancer((value) => !value)} className="shrink-0 border-emerald-300 text-emerald-900" data-testid="toggle-profile-enhancer">
              {showEnhancer ? "Hide" : "Enhance now"}
            </Button>
          </div>
          {showEnhancer && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="profile-enhancer">
              <Input value={enhanceUrl} onChange={(e) => setEnhanceUrl(e.target.value)} placeholder="https://yourstartup.com" className="h-11 rounded-md bg-white" data-testid="profile-enhance-url" />
              <label className="flex items-center gap-3 h-11 px-3 rounded-md border border-slate-300 bg-white text-sm text-slate-600 cursor-pointer">
                <Upload size={15} className="text-emerald-600" />
                <span className="truncate">{enhanceFile ? enhanceFile.name : "Upload pitch deck PDF"}</span>
                <input type="file" accept=".pdf,application/pdf" hidden onChange={(e) => setEnhanceFile(e.target.files?.[0] || null)} />
              </label>
              <Textarea value={enhanceSummary} onChange={(e) => setEnhanceSummary(e.target.value)} rows={3} placeholder="Describe what you are building, who it serves, and your traction…" className="md:col-span-2 rounded-md bg-white" data-testid="profile-enhance-summary" />
              <Button onClick={enhance} disabled={enhancing || busy || Boolean(suggestions)} className="md:col-span-2 bg-emerald-700 hover:bg-emerald-800 text-white" data-testid="profile-enhance-submit">
                {enhancing ? <><Loader2 size={14} className="mr-2 animate-spin" /> Analyzing…</> : <><Sparkles size={14} className="mr-2" /> Analyze and fill profile</>}
              </Button>
            </div>
          )}
        </div>

        {suggestions && (
          <div className="mb-8 rounded-md border border-emerald-200 bg-white p-6 space-y-4" data-testid="profile-suggestions">
            <h2 className="text-lg font-semibold">Review suggested changes</h2>
            <p className="text-sm text-slate-600">Select the fields you want to use. Applying suggestions updates the form; Save changes stores your profile.</p>
            {Object.entries(suggestions).map(([key, value]) => (
              <label key={key} className="block border rounded-md p-4 cursor-pointer">
                <span className="flex items-center gap-2 font-medium capitalize">
                  <input type="checkbox" checked={Boolean(selected[key])} onChange={e => setSelected(s => ({ ...s, [key]: e.target.checked }))} />
                  {key.replaceAll("_", " ")}
                </span>
                <span className="block mt-2 text-sm text-slate-500 whitespace-pre-wrap">Current: {String(form[key] || "Not provided")}</span>
                <span className="block mt-2 text-sm text-emerald-900 whitespace-pre-wrap">Suggested: {String(value)}</span>
              </label>
            ))}
            <div className="flex flex-wrap gap-3">
              <Button className="bg-emerald-700 text-white hover:bg-emerald-800 focus-visible:ring-emerald-600" data-testid="profile-apply-suggestions" disabled={!Object.values(selected).some(Boolean)} onClick={() => {
                setForm(current => ({ ...current, ...Object.fromEntries(Object.entries(suggestions).filter(([key]) => selected[key])) }));
                setSuggestions(null);
                setShowEnhancer(false);
                toast.info("Suggestions applied. Review the form and save changes.");
              }}>Apply selected</Button>
              <Button variant="outline" onClick={() => setSuggestions(null)}>Discard suggestions</Button>
            </div>
          </div>
        )}

        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
          className="bg-white border border-slate-200 p-7 space-y-6">
          {active === "company" && (
            <>
              <Field label="Startup name"><Input value={form.startup_name} onChange={(e) => update("startup_name", e.target.value)} className="h-11 rounded-md" data-testid="input-startup-name" /></Field>
              <Field label="Overview"><Textarea value={form.startup_overview} onChange={(e) => update("startup_overview", e.target.value)} rows={3} className="rounded-md" data-testid="input-overview" /></Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <Field label="Stage">
                  <Select value={form.stage} onValueChange={(v) => update("stage", v)}>
                    <SelectTrigger className="h-11 rounded-md" data-testid="select-stage"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{["Idea", "MVP", "Early Revenue", "Growth", "PMF", "Scale"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Sector">
                  <Select value={form.sector} onValueChange={(v) => update("sector", v)}>
                    <SelectTrigger className="h-11 rounded-md" data-testid="select-sector"><SelectValue placeholder="Select…" /></SelectTrigger>
                    <SelectContent>{["AgriTech", "AI / ML", "DeepTech", "FinTech", "HealthTech", "Climate / Energy", "Smart Cities"].map((x) => <SelectItem key={x} value={x}>{x}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <Field label="Founded"><Input value={form.founded} onChange={(e) => update("founded", e.target.value)} className="h-11 rounded-md" /></Field>
                <Field label="Incorporation"><Input value={form.incorporation} onChange={(e) => update("incorporation", e.target.value)} className="h-11 rounded-md" /></Field>
                <Field label="DPIIT"><Input value={form.dpiit} onChange={(e) => update("dpiit", e.target.value)} className="h-11 rounded-md" /></Field>
                <Field label="Headquarters"><Input value={form.location} onChange={(e) => update("location", e.target.value)} className="h-11 rounded-md" /></Field>
              </div>
            </>
          )}

          {active === "story" && (
            <>
              <Field label="Problem statement"><Textarea rows={4} value={form.problem_statement} onChange={(e) => update("problem_statement", e.target.value)} className="rounded-md" /></Field>
              <Field label="Solution summary"><Textarea rows={4} value={form.solution_summary} onChange={(e) => update("solution_summary", e.target.value)} className="rounded-md" /></Field>
              <Field label="Target customers"><Textarea rows={3} value={form.target_customers} onChange={(e) => update("target_customers", e.target.value)} className="rounded-md" /></Field>
              <Field label="Business model"><Textarea rows={3} value={form.business_model} onChange={(e) => update("business_model", e.target.value)} className="rounded-md" /></Field>
            </>
          )}

          {active === "traction" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Team size"><Input value={form.team_size} onChange={(e) => update("team_size", e.target.value)} className="h-11 rounded-md" /></Field>
              <Field label="Revenue"><Input value={form.revenue} onChange={(e) => update("revenue", e.target.value)} className="h-11 rounded-md" /></Field>
              <div className="md:col-span-2">
                <Field label="Traction summary"><Textarea rows={4} value={form.traction_summary} onChange={(e) => update("traction_summary", e.target.value)} className="rounded-md" /></Field>
              </div>
            </div>
          )}

          {active === "presence" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Website"><Input value={form.website} onChange={(e) => update("website", e.target.value)} className="h-11 rounded-md" /></Field>
            </div>
          )}
        </motion.div>
      </section>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-2 block">{label}</Label>
      {children}
    </div>
  );
}

