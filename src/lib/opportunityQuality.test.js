import { cleanAmount, cleanEligibility, profileRelevance } from "./opportunityQuality";

test("scraped gates and benefits prose are not displayed as criteria or funding", () => {
  expect(cleanEligibility("See if you're eligibleFull eligibility criteria Sign up to unlock")).toBe("");
  expect(cleanEligibility("Must be incorporated in Karnataka.")).toBe("Must be incorporated in Karnataka.");
  expect(cleanAmount("Extensive nurturing support including mentorship, office space and advanced technology labs for founders.")).toBe("");
  expect(cleanAmount("A project grant up to ₹25 lakhs for a duration of up to 12 months. The funding supports technology development.")).toBe("up to ₹25 lakhs");
});

test("ranking changes with the saved profile and explains the evidence", () => {
  const ai = { sectors: ["AI / ML"], stage: "MVP" };
  const agri = { sectors: ["AgriTech"], stage: "Growth" };
  const profile = { sector: "AI / ML", stage: "MVP" };
  expect(profileRelevance(profile, ai).rank).toBeGreaterThan(profileRelevance(profile, agri).rank);
  expect(profileRelevance({ sector: "AgriTech", stage: "Growth" }, agri).rank).toBeGreaterThan(profileRelevance(profile, agri).rank);
  expect(profileRelevance(null, ai).rank).toBe(0);
  expect(profileRelevance(profile, {}).rank).toBe(0);
  expect(profileRelevance(profile, ai).reasons).toContain("Stage matches MVP");
});
