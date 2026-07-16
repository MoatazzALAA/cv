// components/canvas/SkillsMatrix.tsx
//
// State 3: the Skills Matrix. Strictly props-driven — receives the category
// list from its Server Component ancestor (via DynamicCanvas). No imports
// from DynamicCanvas.tsx. Column count is fully data-driven: this component
// never assumes four categories, or any fixed number.

"use client";

import type { SkillCategory } from "@/types";

interface SkillsMatrixProps {
  categories: SkillCategory[];
}

export default function SkillsMatrix({ categories }: SkillsMatrixProps) {
  return (
    <div className="flex flex-col">
      <h1 className="mb-8 text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
        Skills
      </h1>

      {/*
        Auto-fit grid: renders however many columns the content actually
        needs, down to a 200px minimum per column, and wraps naturally on
        narrow viewports. No hardcoded column count anywhere in this file.
      */}
      {/*
        Responsive grid-template-columns is applied via styled-jsx below
        rather than an unconditional inline `style` prop or a Tailwind
        arbitrary-bracket class. An unconditional inline style would win
        over Tailwind's sm:/lg: classes (higher specificity), silently
        breaking the 1-column mobile and 2-column tablet layouts — this
        keeps each breakpoint's column count correct and avoids Tailwind's
        production-purge risk with arbitrary grid-template values.
      */}
      <style jsx>{`
        .skills-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 640px) {
          .skills-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (min-width: 1024px) {
          .skills-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          }
        }
      `}</style>
      <div className="skills-grid grid gap-x-10 gap-y-10 lg:items-start">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col gap-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
              {category.name}
            </h2>

            <div className="flex flex-col gap-2">
              {category.skills.map((skill) => (
                <div
                  key={skill.id}
                  className={`rounded-md bg-[var(--color-surface)] px-3 py-2 text-sm ${
                    skill.weightTier === "primary"
                      ? "font-medium text-[color:var(--color-text-primary)] opacity-100"
                      : "font-normal text-[color:var(--color-text-primary)] opacity-70"
                  }`}
                >
                  {skill.label}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
