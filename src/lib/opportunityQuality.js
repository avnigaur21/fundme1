import { sectorLabels, stageMatches } from "./opportunityTaxonomy";
export const cleanText = value => String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
export const cleanEligibility = value => {
  const text = cleanText(value);
  return /sign up|sign in|unlock|see if you.re eligible|Fund TypeSupport Type/i.test(text) ? "" : text;
};
export const cleanAmount = value => {
  const text = cleanText(value);
  // A benefits paragraph is not an amount. Keep only a source-stated currency amount.
  const match = text.match(/(?:up to\s*)?(?:₹|€|\$|INR\s*|USD\s*|EUR\s*)[\d,.]+(?:\s*(?:crores?|cr|lakhs?|lacs?|million|billion|thousand|k|m)\b)?/i);
  return text.length <= 75 ? text : (match?.[0] || "");
};
const canonical = value => cleanText(value).toLowerCase().replace(/[^a-z0-9]/g, "");
const terms = value => new Set(cleanText(value).toLowerCase().match(/[a-z]{4,}/g)?.filter(w => !["with", "that", "this", "from", "your", "their", "startup", "startups", "platform", "provides", "which", "have"].includes(w)) || []);

// Explainable relevance, not an eligibility probability. Missing criteria earn no points.
export function profileRelevance(profile, opportunity) {
  if (!profile) return { rank: 0, reasons: [], label: "Add a profile to compare" };
  const reasons = [];
  let rank = 0;
  const sectors = sectorLabels(opportunity.sectors || []);
  const profileSector = sectorLabels(profile.sector || profile.industry)[0];
  if (profileSector && sectors.some(s => canonical(s) === canonical(profileSector))) {
    rank += 4; reasons.push(`Sector matches ${profile.sector}`);
  } else if (sectors.some(s => /all sectors|sector agnostic/i.test(s))) {
    rank += 1; reasons.push("Open to all sectors");
  }
  if (profile.stage && opportunity.stage && stageMatches(opportunity.stage, [profile.stage])) {
    rank += 3; reasons.push(`Stage matches ${profile.stage}`);
  }
  const source = terms(`${opportunity.summary} ${opportunity.eligibility}`);
  const overlap = [...terms([profile.startup_overview, profile.problem_statement, profile.solution_summary, profile.target_customers].filter(Boolean).join(" "))].filter(word => source.has(word));
  if (overlap.length >= 2) {
    rank += Math.min(3, overlap.length / 2);
    reasons.push(`Shared topics: ${overlap.slice(0, 3).join(", ")}`);
  }
  return { rank, reasons, label: rank >= 4 ? "Relevant to your profile" : rank > 0 ? "Potential relevance" : "No clear profile overlap" };
}
