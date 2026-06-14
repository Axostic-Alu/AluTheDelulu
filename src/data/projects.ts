export interface Project {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  techStack: string[];
  category: "web" | "mobile" | "tool" | "experiment";
  featured: boolean;
  status: "live" | "in-progress" | "archived";
  githubUrl?: string;
  liveUrl?: string;
  image?: string;
  gradient: string;
  startDate: string;
  endDate?: string;
  highlights: string[];
  challenges?: string[];
  learnings?: string[];
}

// Saving Log features for the showcase card
export interface SavingLogFeature {
  icon: string;
  title: string;
  description: string;
}

export const savingLogFeatures: SavingLogFeature[] = [
  {
    icon: "📊",
    title: "Dashboard",
    description: "At-a-glance view of your entire financial picture — balance, recent transactions, spending trends."
  },
  {
    icon: "🎯",
    title: "Goal Meter",
    description: "Track savings goals with visual progress bars. Set targets, get reminders, watch your money grow."
  },
  {
    icon: "🚨",
    title: "Impulse Buy Alerts",
    description: "Smart notifications that pause before you spend. Helps you think twice and save more."
  },
  {
    icon: "💡",
    title: "Financial Insights",
    description: "AI-powered analysis of your spending habits. Understand where your money actually goes."
  },
  {
    icon: "🤖",
    title: "Alu the Advisor",
    description: "Your smart spending companion. Get personalized saving tips, budget suggestions, and financial nudges."
  },
  {
    icon: "📁",
    title: "CSV Export",
    description: "Export your transaction history anytime. Full data ownership — take it with you wherever you go."
  }
];

export const projects: Project[] = [
  {
    id: "2",
    slug: "saving-log",
    title: "Saving Log",
    shortDescription: "Track spending, visualize savings goals, and get AI-powered financial advice.",
    fullDescription: `
      Saving Log is a personal finance companion that makes saving money feel good.
      Log expenses, set goals, and get smart nudges before impulse purchases.
      With Alu the Advisor, you get personalized financial insights tailored to your habits.
    `,
    techStack: ["React Native", "TypeScript", "Firebase", "AI/ML", "RevenueCat", "Tailwind CSS"],
    category: "mobile",
    featured: true,
    status: "in-progress",
    githubUrl: "https://github.com/AluTheDelulu/saving-log",
    liveUrl: "/projects/saving-log",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    startDate: "2026-05-20",
    highlights: [
      "Dashboard with real-time balance and spending breakdown",
      "Goal Meter with visual progress tracking and reminders",
      "Impulse Buy Alerts that save you money automatically",
      "Financial Insights powered by AI pattern recognition",
      "Alu the Advisor — your personal money companion",
      "Full CSV export for complete data ownership"
    ],
    challenges: [
      "Building accurate spending categorization with ML",
      "Real-time sync across devices with offline support",
      "Creating a delightful UX that makes finance fun"
    ],
    learnings: [
      "React Native's Animated API is great for fluid financial charts",
      "Firebase offline persistence is key for mobile finance apps",
      "Users engage 3x more when savings progress is visualized"
    ]
  }
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find(p => p.slug === slug);
}

export function getFeaturedProjects(): Project[] {
  return projects.filter(p => p.featured);
}

export function getProjectsByCategory(category: Project["category"]): Project[] {
  return projects.filter(p => p.category === category);
}
