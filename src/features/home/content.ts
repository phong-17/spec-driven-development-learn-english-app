import {
  ROUTE_LESSONS,
  ROUTE_VOCAB_1000,
  ROUTE_VOCAB_500,
} from "@/utils/route-path";

export type NavLink = { label: string; href: string };

export type HeroContent = {
  eyebrow: string;
  title: string;
  tagline: string;
};

export type SectionId = "lessons" | "vocab-500" | "vocab-1000";

export type SectionContent = {
  id: SectionId;
  title: string;
  description: string;
  href: string;
  buttonLabel: string;
};

export const HOME_NAV_LINKS: ReadonlyArray<NavLink> = [
  { label: "Lessons", href: ROUTE_LESSONS },
  { label: "500 Most Common Words", href: ROUTE_VOCAB_500 },
  { label: "1000 Topic Vocabulary", href: ROUTE_VOCAB_1000 },
];

export const HOME_HERO: HeroContent = {
  eyebrow: "> ~/learn-english",
  title: "LEARN ENGLISH",
  tagline:
    "A personal study console — lessons, common words, and topic vocabulary.",
};

export const HOME_SECTIONS: ReadonlyArray<SectionContent> = [
  {
    id: "lessons",
    title: "Lessons",
    description:
      "Sixteen structured lessons from Ms. Huong's book, split into thirty-two study sessions.",
    href: ROUTE_LESSONS,
    buttonLabel: "START_LESSONS",
  },
  {
    id: "vocab-500",
    title: "500 Most Common Words",
    description:
      "The 500 most frequent English words, distributed evenly across thirty-two sessions.",
    href: ROUTE_VOCAB_500,
    buttonLabel: "LEARN_500_WORDS",
  },
  {
    id: "vocab-1000",
    title: "1000 Topic Vocabulary",
    description:
      "One thousand topic-grouped words covering everyday themes, paced across thirty-two sessions.",
    href: ROUTE_VOCAB_1000,
    buttonLabel: "EXPLORE_1000",
  },
];
