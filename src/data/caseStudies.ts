import raw from "./caseStudies.json";

export type CaseStudy = {
  id: string;
  title: string;
  challenge: string[];
  solution: string[];
  outcomes: string[];
};

export type IndustryCaseStudies = {
  slug: string;
  displayName: string;
  items: CaseStudy[];
};

type RawCaseStudy = CaseStudy & { slide?: string };

type RawIndustry = {
  industry: string;
  cases: RawCaseStudy[];
};

const rawTyped = raw as Record<string, RawIndustry>;

const slugAliases: Record<string, string> = {
  "oil-gas": "oil-and-gas",
  "oil-and-gas": "oil-and-gas",
  "healthcare": "healthcare-life-sciences",
  "health-care": "healthcare-life-sciences",
  "life-sciences": "healthcare-life-sciences",
  "climate": "climate-tech",
  "climate-tech": "climate-tech",
};

function toTitleCaseFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getIndustryCaseStudies(industrySlug: string): IndustryCaseStudies | null {
  if (!industrySlug) return null;
  const canonical = slugAliases[industrySlug] ?? industrySlug;
  const found = rawTyped[canonical];
  if (!found) return null;

  return {
    slug: canonical,
    displayName: found.industry || toTitleCaseFromSlug(canonical),
    items: found.cases,
  };
}

export function getIndustryDisplayName(industrySlug: string): string {
  return getIndustryCaseStudies(industrySlug)?.displayName ?? toTitleCaseFromSlug(industrySlug || "industry");
}
