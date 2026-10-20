const key = value => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
const aliases = {
  aiml: "AI / ML", ai: "AI / ML", artificialintelligence: "AI / ML", machinelearning: "AI / ML",
  fintech: "FinTech", agritech: "AgriTech", healthtech: "HealthTech", edtech: "EdTech",
  deeptech: "DeepTech", cleantech: "CleanTech", socialimpact: "Social Impact",
  allsectors: "All Sectors", sectoragnostic: "All Sectors", multisector: "All Sectors",
};
const stageAliases = { product: "mvp", prototype: "mvp", validation: "mvp", revenue: "earlyrevenue", scaling: "growth", scaleup: "growth" };
function sectorLabels(value) {
  const values = Array.isArray(value) ? value : String(value || "").split(/[,;|]/);
  return [...new Set(values.map(v => aliases[key(v)] || String(v).trim()).filter(Boolean))];
}
function sectorMatches(values, selected) {
  const labels = sectorLabels(values);
  return !selected.length || labels.some(v => v === "All Sectors" || selected.some(s => key(s) === key(v)));
}
function stageMatches(value, selected) {
  const stages = String(value || "").split(/[,;|/]/).map(v => stageAliases[key(v)] || key(v));
  return !selected.length || selected.some(s => stages.includes(stageAliases[key(s)] || key(s)));
}
function stageLabels(value) {
  return String(value || "").split(/[,;|/]/).map(v => stageAliases[key(v)] || key(v)).filter(Boolean);
}
module.exports = { sectorLabels, sectorMatches, stageMatches, stageLabels };
