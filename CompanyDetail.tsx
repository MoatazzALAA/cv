// components/canvas/CompanyDetail.tsx
//
// State 2: the bespoke Company Detail view. Strictly props-driven — receives
// a single CompanyEntry, the resolved theme tokens, and an onBack callback
// from its Server Component ancestor (via DynamicCanvas). No imports from
// DynamicCanvas.tsx.
//
// Every design_config field resolves independently: a company with only
// brand_accent_color set overrides just the accent and falls back to the
// global theme for everything else — nothing here assumes an all-or-nothing
// config object. Resolution happens here in the component (not via nested
// CSS variable fallback chains), so the data flow stays explicit.

"use client";

import type { CSSProperties } from "react";
import type { CompanyEntry, WatermarkPlacement, ThemeTokens } from "@/types";

interface CompanyDetailProps {
  company: CompanyEntry;
  theme: ThemeTokens;
  onBack: () => void;
}

// The watermark's opacity is governed by design_config.overlay_opacity, but
// hard-capped here regardless of the configured value — this ceiling is a
// locked design-system rule protecting text legibility, not something a
// content editor can raise past 0.05 even by setting a higher number.
const WATERMARK_OPACITY_CEILING = 0.05;

const WATERMARK_POSITION_CLASSES: Record<WatermarkPlacement, string> = {
  center: "inset-0 m-auto",
  "bottom-right": "bottom-0 right-0",
  "bottom-left": "bottom-0 left-0",
};

export default function CompanyDetail({ company, theme, onBack }: CompanyDetailProps) {
  const { companyName, roleTitle, dateRange, narrative, systemsUsed, metrics, design_config } = company;

  // Resolved once, explicitly, here — not deferred to a CSS fallback chain.
  const accentColor = design_config?.brand_accent_color ?? theme.accentDefault;
  const backgroundImagePath = design_config?.background_image_path;
  const watermarkSvgPath = design_config?.watermark_svg_path;
  const watermarkOpacity = Math.min(design_config?.overlay_opacity ?? WATERMARK_OPACITY_CEILING, WATERMARK_OPACITY_CEILING);
  const watermarkPlacement = design_config?.watermark_placement ?? "bottom-right";
  const maxMetrics = design_config?.max_metrics_allowed ?? 4;

  const displayedMetrics = metrics.slice(0, maxMetrics);

  // Always set — accentColor is always resolved above, so children reference
  // plain var(--company-accent) with no nested fallback needed.
  const wrapperStyle = { "--company-accent": accentColor } as CSSProperties;

  return (
    <div className="relative" style={wrapperStyle}>
      {backgroundImagePath && (
        // NOTE: background image currently renders with no opacity/overlay
        // treatment — the original spec only describes an opacity ceiling
        // for the watermark logo, not the background image itself, and I'm
        // not inventing a value for it after being asked not to guess.
        // Flagging this as an open question rather than deciding silently.
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImagePath})` }}
        />
      )}

      {watermarkSvgPath && (
        <div
          aria-hidden
          className={`pointer-events-none absolute -z-10 w-[40%] ${WATERMARK_POSITION_CLASSES[watermarkPlacement]}`}
          style={{ opacity: watermarkOpacity }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={watermarkSvgPath} alt="" className="h-auto w-full" />
        </div>
      )}

      <button
        type="button"
        onClick={onBack}
        aria-label="Back to experience directory"
        className="group mb-10 inline-flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out hover:text-[color:var(--company-accent)]"
      >
        <span className="transition-transform duration-200 ease-out group-hover:-translate-x-1">←</span>
        Back to Experience
      </button>

      <div className="mb-10 flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[color:var(--color-text-primary)]">
          {companyName}
        </h1>
        <p className="text-sm text-[color:var(--color-text-secondary)]">
          {roleTitle} · {dateRange.start} – {dateRange.end}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr] md:items-start">
        {/* Column A: narrative — unbounded height, drives page length */}
        <div className="text-base leading-relaxed text-[color:var(--color-text-secondary)]">
          <p>{narrative}</p>
        </div>

        {/* Column B: sticky sidebar — natural height, anchors near viewport top */}
        <div className="flex flex-col gap-8 md:sticky md:top-12">
          {systemsUsed.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
                Systems Used
              </h2>
              <div className="flex flex-wrap gap-2">
                {systemsUsed.map((system) => (
                  <span
                    key={system}
                    className="rounded-full bg-[var(--color-surface)] px-3 py-1.5 text-xs text-[color:var(--color-text-primary)]"
                  >
                    {system}
                  </span>
                ))}
              </div>
            </div>
          )}

          {displayedMetrics.length > 0 && (
            <div className="flex flex-col gap-3">
              <h2 className="text-xs font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
                Key Metrics
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {displayedMetrics.map((metric) => (
                  <div key={`${company.id}-${metric.label}`} className="flex flex-col gap-1">
                    <span className="text-xl font-bold text-[color:var(--company-accent)]">
                      {metric.value}
                    </span>
                    <span className="text-xs text-[color:var(--color-text-secondary)]">{metric.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

