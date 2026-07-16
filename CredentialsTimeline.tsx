// components/canvas/CredentialsTimeline.tsx
//
// State 4: the Credentials Timeline. Strictly props-driven — receives the
// certification list from its Server Component ancestor (via DynamicCanvas).
// No imports from DynamicCanvas.tsx.
//
// year/issuer are nullable in the Certification contract (content honestly
// represents "unknown" as null, not a UI string). This component owns the
// presentation decision: null fields are simply omitted from the rendered
// line rather than shown as a placeholder like "Not specified".

"use client";

import type { Certification } from "@/types";

interface CredentialsTimelineProps {
  certifications: Certification[];
}

export default function CredentialsTimeline({ certifications }: CredentialsTimelineProps) {
  return (
    <div className="flex flex-col">
      <h1 className="mb-10 text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
        Certifications
      </h1>

      <div className="relative flex flex-col gap-10 pl-8">
        {/* Single vertical axis, left-aligned. min-h ensures it still reads
            as a timeline even with only one certification, rather than
            collapsing to a single dot. */}
        <div className="absolute left-0 top-1 bottom-1 min-h-[2rem] w-px bg-white/10" />

        {certifications.map((cert) => {
          // year and issuer are only rendered if present — no "Not
          // specified" placeholder string ever enters the UI. When both
          // are absent, the metadata line itself doesn't render at all.
          const metaParts = [cert.year, cert.issuer].filter(
            (value): value is string => Boolean(value)
          );

          return (
            <div key={cert.id} className="relative">
              {/* Node marker sitting on the axis */}
              <div className="absolute -left-8 top-1.5 h-2 w-2 rounded-full bg-[color:var(--color-accent-default)]" />

              <div className="flex flex-col gap-1">
                <p className="text-base text-[color:var(--color-text-primary)]">{cert.title}</p>

                {metaParts.length > 0 && (
                  <p className="text-xs text-[color:var(--color-text-secondary)]">
                    {metaParts.join(" · ")}
                  </p>
                )}

                {cert.verifyUrl && (
                  <a
                    href={cert.verifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-1 inline-flex w-fit items-center gap-1 text-xs text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out hover:text-[color:var(--color-accent-default)]"
                  >
                    Verify Credential
                    <span className="transition-transform duration-200 ease-out group-hover:translate-x-1">
                      →
                    </span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
