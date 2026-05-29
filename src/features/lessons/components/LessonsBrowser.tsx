"use client";

import { useMemo, useState } from "react";

import {
  SessionDropdown,
  type SessionOption,
} from "@/features/vocabulary-500/components/SessionDropdown";
import type { LessonsData } from "@/types/lesson";

import { ChallengeSection } from "./ChallengeSection";
import { CoursePartsOverview } from "./CoursePartsOverview";
import { LessonDetail } from "./LessonDetail";
import { PdfPageImage } from "./PdfPageImage";
import { PhoneticChartGallery } from "./PhoneticChartGallery";
import { SoundCharts } from "./SoundCharts";

type TabId =
  | "overview"
  | "lessons"
  | "sounds"
  | "reference"
  | "challenges"
  | "advanced";

const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "overview", label: "Tổng quan" },
  { id: "lessons", label: "Lessons" },
  { id: "sounds", label: "Nguyên âm & Phụ âm" },
  { id: "reference", label: "Bảng phiên âm" },
  { id: "challenges", label: "Luyện đọc" },
  { id: "advanced", label: "Nâng cao" },
];

type LessonsBrowserProps = {
  data: LessonsData;
};

export function LessonsBrowser({ data }: LessonsBrowserProps) {
  const [activeTab, setActiveTab] = useState<TabId>("lessons");
  const [selectedLesson, setSelectedLesson] = useState<number>(
    data.lessons[0]?.lesson ?? 1,
  );

  const lessonOptions: SessionOption[] = useMemo(
    () =>
      data.lessons.map((lesson) => ({
        session: lesson.lesson,
        label: `Lesson ${lesson.lesson}`,
      })),
    [data.lessons],
  );

  const currentLesson =
    data.lessons.find((l) => l.lesson === selectedLesson) ?? data.lessons[0];

  return (
    <div className="flex flex-col gap-5">
      {/* Tab bar */}
      <div
        role="tablist"
        aria-label="Lesson sections"
        className="flex flex-wrap gap-2"
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              className={`border border-dashed px-3 py-1.5 font-mono text-sm uppercase tracking-wider transition-colors ${
                isActive
                  ? "border-accent text-accent"
                  : "border-foreground/30 text-foreground/60 hover:border-accent hover:text-accent"
              }`}
            >
              {`[ ${tab.label} ]`}
            </button>
          );
        })}
      </div>

      {/* Panels */}
      {activeTab === "overview" ? (
        <CoursePartsOverview parts={data.courseParts} />
      ) : null}

      {activeTab === "lessons" ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-mono text-sm uppercase tracking-wider text-foreground/60">
              Lesson:
            </span>
            <SessionDropdown
              options={lessonOptions}
              selected={selectedLesson}
              onChange={setSelectedLesson}
            />
            <span className="font-mono text-sm text-foreground/40">
              ({data.lessons.length} lessons · 32 sessions)
            </span>
          </div>
          {currentLesson ? <LessonDetail lesson={currentLesson} /> : null}
        </section>
      ) : null}

      {activeTab === "sounds" ? <SoundCharts charts={data.soundCharts} /> : null}

      {activeTab === "reference" ? (
        <PhoneticChartGallery charts={data.referenceCharts} />
      ) : null}

      {activeTab === "challenges" ? (
        <section className="flex flex-col gap-4">
          <h2 className="font-mono text-sm uppercase tracking-wider text-accent">
            ── PRE-LESSON CHALLENGES · TAP ▶ TO HEAR ──
          </h2>
          {data.challenges.map((challenge) => (
            <ChallengeSection key={challenge.challenge} challenge={challenge} />
          ))}
        </section>
      ) : null}

      {activeTab === "advanced" ? (
        <section className="flex flex-col gap-3">
          <h2 className="font-mono text-sm uppercase tracking-wider text-accent">
            ── {data.advanced.titleEn.toUpperCase()} ──
          </h2>
          <p className="break-words font-mono text-base text-foreground/80">
            {data.advanced.titleVi}
          </p>
          <p className="break-words font-mono text-sm text-foreground/60">
            {data.advanced.note}
          </p>
          <span className="font-mono text-sm text-foreground/40">
            pp. {data.advanced.pageRange}
          </span>
          <div className="flex flex-col gap-4 border-t border-dashed border-foreground/20 pt-3">
            {data.advanced.images.map((image) => (
              <PdfPageImage key={image.src} image={image} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
