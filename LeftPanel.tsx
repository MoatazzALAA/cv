// components/shared/LeftPanel.tsx
//
// Presentation layout for the fixed identity column. Strictly props-driven —
// accepts a single `Profile` object and renders every field from it. No
// string in this file is displayed to the user except aria-labels, which
// are accessibility scaffolding, not content.

"use client"; // Needed for the copy-to-clipboard interaction (useState + navigator.clipboard).

import { useState } from "react";
import Image from "next/image";
import { Mail, Linkedin, Phone, Link2, type LucideIcon } from "lucide-react";
import type { Profile, ContactLink } from "@/types";

interface LeftPanelProps {
  profile: Profile;
}

// Locked icon set. Content JSON supplies only a key (e.g. "mail"); this map
// is the single place that key resolves to an actual icon component. Adding
// a genuinely new icon later means adding one line here, not touching layout.
const ICON_MAP: Record<string, LucideIcon> = {
  mail: Mail,
  linkedin: Linkedin,
  phone: Phone,
  custom: Link2,
};

export default function LeftPanel({ profile }: LeftPanelProps) {
  const { avatar, fullName, title, contactLinks } = profile;
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const handleCopy = async (link: ContactLink) => {
    try {
      await navigator.clipboard.writeText(link.value);
      setCopiedValue(link.value);
      window.setTimeout(() => {
        setCopiedValue((current) => (current === link.value ? null : current));
      }, 1500);
    } catch {
      // Clipboard access can silently fail (permissions, insecure context).
      // This is a convenience affordance, not critical UX — fail quietly.
    }
  };

  return (
    <div className="h-full flex flex-col justify-between px-8 py-12 md:px-10 md:py-14">
      {/* Identity block */}
      <div className="flex flex-col gap-6">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden bg-[var(--color-surface)]">
          <Image
            src={avatar.src}
            alt={avatar.alt}
            width={96}
            height={96}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[color:var(--color-text-primary)]">
            {fullName}
          </h1>
          <p className="text-xs md:text-sm font-mono tracking-widest uppercase text-[color:var(--color-text-secondary)]">
            {title}
          </p>
        </div>
      </div>

      {/* Contact links */}
      <ul className="flex flex-col gap-4 mt-12 md:mt-0">
        {contactLinks.map((link) => {
          const Icon = ICON_MAP[link.icon] ?? ICON_MAP.custom;
          const isCopied = copiedValue === link.value;
          // Copy-to-clipboard suits values with no browsable destination (email, phone).
          // Everything else (LinkedIn, custom URLs like GitHub/website) opens directly —
          // recruiters browsing the portfolio expect a click to navigate, not copy.
          const isCopyType = link.type === "email" || link.type === "phone";

          const sharedIconClasses =
            "shrink-0 text-[color:var(--color-text-secondary)] transition-all duration-200 ease-out " +
            "group-hover:-translate-y-0.5 group-hover:text-[color:var(--color-text-primary)]";
          const sharedTextClasses =
            "text-sm text-[color:var(--color-text-secondary)] transition-colors duration-200 ease-out " +
            "group-hover:text-[color:var(--color-text-primary)]";

          const content = (
            <>
              <Icon size={16} className={sharedIconClasses} />
              <span className="flex items-center gap-2">
                <span className={sharedTextClasses}>{link.value}</span>
                {isCopyType && (
                  <span
                    className={`text-xs text-[color:var(--color-accent-default)] transition-opacity duration-200 ease-out ${
                      isCopied ? "opacity-100" : "opacity-0"
                    }`}
                    aria-hidden={!isCopied}
                  >
                    ✓ Copied
                  </span>
                )}
              </span>
            </>
          );

          return (
            <li key={`${link.type}-${link.value}`}>
              {isCopyType ? (
                <button
                  type="button"
                  onClick={() => handleCopy(link)}
                  className="group flex items-center gap-3 w-full text-left"
                  aria-label={`Copy ${link.label}`}
                >
                  {content}
                </button>
              ) : (
                <a
                  href={link.value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 w-full text-left"
                  aria-label={`Open ${link.label}`}
                >
                  {content}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
