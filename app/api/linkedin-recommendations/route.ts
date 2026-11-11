import { NextResponse } from "next/server";
import { linkedinRecommendations } from "@/data/recommendations";

export type RecommendationsPayload = {
  ok: boolean;
  items: typeof linkedinRecommendations;
  source: "static";
  linkedinProfile: string;
  note: string;
};

export async function GET() {
  const payload: RecommendationsPayload = {
    ok: true,
    items: linkedinRecommendations,
    source: "static",
    linkedinProfile:
      "https://www.linkedin.com/in/muhammad-arslan-0642941ab/details/recommendations/",
    note:
      linkedinRecommendations.length === 0
        ? "LinkedIn recommendations require login and cannot be fetched automatically. Add entries in data/recommendations.ts."
        : "",
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
