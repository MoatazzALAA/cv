// components/canvas/HomeSection.tsx
//
// State 0: the Home view. Strictly props-driven — receives HomeContent from
// its Server Component ancestor (via DynamicCanvas) and an onNavigate
// callback for the nav links. Fetches nothing itself.

"use client";

import { motion } from "framer-motion";
import type { HomeContent, NavTarget } from "@/types";

interface HomeSectionProps {
  homeContent: HomeContent;
  onNavigate: (target: NavTarget) => void;
}

// 50ms stagger across Education/Languages as specified — container declares
// the interval once, children just opt in via itemVariants.
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

export default function HomeSection({ homeContent, onNavigate }: HomeSectionProps) {
  const { summary, education, languages, navLinks } = homeContent;

  return (
    <div className="flex flex-col gap-12">
      {/* Hero summary block */}
      <p className="text-xl font-light leading-relaxed text-[color:var(--color-text-primary)] max-w-2xl">
        {summary}
      </p>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-10"
      >
        {/* Education */}
        {education.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
              Education
            </h2>
            <div className="flex flex-col gap-3">
              {education.map((entry) => (
                <div key={entry.id} className="flex flex-col gap-0.5">
                  <p className="text-sm text-[color:var(--color-text-primary)]">{entry.degree}</p>
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    {entry.institution} · {entry.year}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Languages */}
        {languages.length > 0 && (
          <motion.div variants={itemVariants} className="flex flex-col gap-4">
            <h2 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <span
                  key={lang.name}
                  className="text-xs px-3 py-1.5 rounded-full bg-[var(--color-surface)] text-[color:var(--color-text-secondary)]"
                >
                  {lang.name}
                  <span className="text-[color:var(--color-text-secondary)] opacity-60"> · {lang.proficiency}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Divider */}
      <div className="border-t border-white/5" />

      {/* Navigation links */}
      <nav className="flex flex-col gap-4">
        {navLinks.map((link) => (
          <button
            key={link.id}
            type="button"
            onClick={() => onNavigate(link.target)}
            className="group relative inline-flex w-fit items-center gap-2 text-left"
          >
            <span className="text-base text-[color:var(--color-text-primary)] transition-colors duration-200 ease-out group-hover:text-[color:var(--color-accent-default)]">
              {link.label}
            </span>
            <span
              aria-hidden
              className="text-[color:var(--color-text-secondary)] transition-all duration-200 ease-out group-hover:translate-x-1.5 group-hover:text-[color:var(--color-accent-default)]"
            >
              →
            </span>
            <span className="pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-center scale-x-0 bg-[color:var(--color-accent-default)] transition-transform duration-200 ease-out group-hover:scale-x-100" />
          </button>
        ))}
      </nav>
    </div>
  );
}
