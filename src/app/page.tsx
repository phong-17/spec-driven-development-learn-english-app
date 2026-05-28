import { BackgroundSection } from "@/features/home/components/BackgroundSection";
import { ContentSection } from "@/features/home/components/ContentSection";
import { HeroSection } from "@/features/home/components/HeroSection";
import { NavigationMenu } from "@/features/home/components/NavigationMenu";
import {
  HOME_HERO,
  HOME_NAV_LINKS,
  HOME_SECTIONS,
} from "@/features/home/content";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden lg:flex-row">
      {/* Full-page background — theme.gif tiled */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-19"
        aria-hidden
        style={{
          backgroundImage: "url('/images/theme.gif')",
          backgroundRepeat: "repeat",
          backgroundSize: "250px",
        }}
      />

      {/* Content */}
      <NavigationMenu links={HOME_NAV_LINKS} />
      <main className="relative z-10 flex flex-1 flex-col overflow-x-hidden">
        <BackgroundSection />
        <HeroSection {...HOME_HERO} />
        {HOME_SECTIONS.map((section) => (
          <ContentSection key={section.id} {...section} />
        ))}
      </main>
    </div>
  );
}
