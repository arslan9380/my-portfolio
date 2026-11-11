export type LinkedInRecommendation = {
  name: string;
  role: string;
  company?: string;
  relationship?: string;
  text: string;
  date?: string;
};

/**
 * LinkedIn does not expose recommendations without an authenticated session.
 * Add entries here (copy from your LinkedIn profile → Recommendations).
 * The site renders this list in the Recommendations section.
 */
export const linkedinRecommendations: LinkedInRecommendation[] = [];
