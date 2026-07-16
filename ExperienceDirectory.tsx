// components/canvas/ExperienceDirectory.tsx
//
// State 1: the Experience Directory. Strictly props-driven — receives the
// company list from its Server Component ancestor (via DynamicCanvas) and
// an onSelectCompany callback, mirroring the one-way dependency pattern
// just established for HomeSection (no imports from DynamicCanvas here).

"use client";

import { useState } from "react";
import type { CompanyEntry } from "@/types";

interface ExperienceDirectoryProps {
  companies: CompanyEntry[];
  onSelectCompany: (slug: string) => void;
}

export default function ExperienceDirectory({
  companies,
  onSelectCompany,
}: ExperienceDirectoryProps) {
  // Tracks which row is under the cursor so siblings can dim — null means
  // no row is focused, so every row sits at full opacity (the default state).
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col">
      <h1 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)] mb-8">
        Experience
      </h1>

      <ul className="flex flex-col">
        {companies.map((company) => {
          const isHovered = hoveredId === company.id;
          const isDimmed = hoveredId !== null && !isHovered;

          return (
            <li
              key={company.id}
              className="border-b border-white/5 last:border-b-0"
            >
              <button
                type="button"
                onClick={() => onSelectCompany(company.id)}
                onMouseEnter={() => setHoveredId(company.id)}
                onMouseLeave={() => setHoveredId(null)}
                aria-label={`View ${company.companyName}`}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left transition-all duration-300 ease-out"
                style={{
                  opacity: isDimmed ? 0.3 : 1,
                  transform: isHovered ? "translateX(-4px)" : "translateX(0)",
                }}
              >
                <span className="text-base md:text-lg text-[color:var(--color-text-primary)]">
                  {company.companyName}
                </span>

                <span className="flex items-center gap-4 text-right">
                  <span className="hidden md:inline text-sm text-[color:var(--color-text-secondary)]">
                    {company.roleTitle}
                  </span>
                  <span
                    className="text-sm text-[color:var(--color-accent-default)] transition-opacity duration-300 ease-out"
                    style={{ opacity: isHovered ? 1 : 0 }}
                  >
                    Press to Explore →
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
