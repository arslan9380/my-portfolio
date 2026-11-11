export type ProjectKind = "ios" | "android" | "web";

export type PublishedProject = {
  name: string;
  tagline?: string;
  url: string;
  kind: ProjectKind;
};

/** Professional experience label (hero pill + summary). */
export function getTotalExperienceLabel(): string {
  return "6+ years";
}

export function getProfileSummary(): string {
  const y = getTotalExperienceLabel();
  return `Flutter developer with ${y} of professional experience building scalable, high-performance mobile applications. Skilled in Flutter, Dart, and Firebase — with hands-on AI-assisted development using Cursor, GitHub Copilot, and Antigravity to ship faster without sacrificing quality. Strong background in third-party SDKs, UI/UX, and the full app lifecycle from design to deployment.`;
}

export const profile = {
  name: "Muhammad Arslan",
  title: "Senior Flutter Developer",
  location: "Lahore, Pakistan",
  email: "mian.arslan9380@gmail.com",
  phone: "+92 303 9380800",
  phoneTel: "+923039380800",
  whatsapp: "https://wa.me/923039380800",
  photoPath: "/profile.png",
  cvPath: "/Muhammad_Arslan_CV.pdf",
  linkedin: "https://www.linkedin.com/in/muhammad-arslan-0642941ab",
  github: "https://github.com/arslan9380",
};

export const experience = [
  {
    company: "AlgoRepublic",
    role: "Senior Flutter Developer",
    period: "April 2021 — Present",
    description:
      "Overseeing the full project lifecycle — leading design, development, deployment, and client collaboration to deliver high-quality, scalable mobile solutions. Using AI-assisted workflows (Cursor, GitHub Copilot, Antigravity) to accelerate delivery and maintain high code quality.",
  },
  {
    company: "IT-Hobbies",
    role: "Flutter Developer",
    period: "February 2020 — March 2021",
    description:
      "Built and maintained Flutter applications, collaborated on features, and contributed to shipping polished mobile experiences.",
  },
] as const;

export const education = {
  school: "Government College University, Lahore (GCU)",
  degree: "Bachelor of Science in Computer Science (BSCS)",
  period: "2016 — 2020",
  detail: "CGPA 3.30",
};

/** Apps and store listings — featured order. */
export const publishedProjects: PublishedProject[] = [
  {
    name: "Not Funny",
    tagline: "Entertainment",
    url:
      "https://play.google.com/store/apps/details?id=com.notfunny.notfunny&hl=en",
    kind: "android",
  },
  {
    name: "Scott International",
    tagline: "Augmented reality",
    url: "https://play.google.com/store/apps/details?id=com.ar.scott&hl=en",
    kind: "android",
  },
  {
    name: "Lazmi AI",
    tagline: "AI writing in your voice",
    url: "https://apps.apple.com/us/app/lazmi-ai/id6757095309",
    kind: "ios",
  },
  {
    name: "WealthTech Crypto",
    tagline: "Finance & crypto",
    url: "https://apps.apple.com/pk/app/wealthtech-crypto/id6743436933",
    kind: "ios",
  },
  {
    name: "Cheers VIP",
    tagline: "Shop, scan & claim rewards",
    url: "https://apps.apple.com/za/app/cheers-vip/id6670168339",
    kind: "ios",
  },
  {
    name: "Parent Bridge",
    tagline: "Co-parent communication & expenses",
    url:
      "https://play.google.com/store/apps/details?id=com.parentbridge.mobile&hl=en",
    kind: "android",
  },
  {
    name: "Hayati Community",
    tagline: "Community",
    url: "https://apps.apple.com/pk/app/hayati-community/id6738457405",
    kind: "ios",
  },
  {
    name: "Hayati Teacher",
    tagline: "Education",
    url: "https://apps.apple.com/us/app/hayati-teacher/id6737462883",
    kind: "ios",
  },
  {
    name: "My Life My Voice",
    tagline: "Peer network",
    url: "https://apps.apple.com/nz/app/my-life-my-voice/id6469578078",
    kind: "ios",
  },
];

/** @deprecated Use publishedProjects */
export type PublishedApp = PublishedProject & { storeUrl: string; store: ProjectKind };
export const publishedApps = publishedProjects.map((p) => ({
  ...p,
  storeUrl: p.url,
  store: p.kind,
}));

/** Curated stack, capabilities, and tooling (merged from former skills sections). */
export const keyFeatures = [
  "Flutter & Dart",
  "Firebase",
  "Responsive UI",
  "GetX · Riverpod · Stacked · Bloc",
  "Real-time chat & messaging",
  "WebSockets",
  "Push notifications",
  "In-app purchases",
  "Payment gateways",
  "Social logins",
  "Google Maps & AdMob",
  "Localization & dynamic theming",
  "Agora · video & live streaming",
  "Third-party SDK integration",
  "App Store publishing",
  "Play Store publishing",
  "GitHub",
  "Jira",
  "CI/CD",
  "Cursor · AI development",
  "GitHub Copilot",
  "Antigravity",
] as const;
