# Portfolio Architecture Blueprint
### Phase 1 — Locked Design, Editable Content (React / Next.js / Tailwind)

---

## SECTION 1 — ARCHITECTURE OVERVIEW

The system is built as three strictly separated layers. Each layer only knows how to talk to the layer directly beneath it — nothing skips a layer, and nothing reaches upward.

```
┌─────────────────────────────────────────┐
│   PRESENTATION ENGINE (Locked)           │  ← React components, Tailwind, animation logic
│   - Layout, spacing, transitions         │
│   - Never imports JSON directly          │
└─────────────────▲─────────────────────────┘
                   │ props / hooks
┌─────────────────┴─────────────────────────┐
│   DATA ADAPTER LAYER (Locked contract)   │  ← Section 6
│   - Normalizes any data source           │
│   - Exposes a fixed hook API             │
└─────────────────▲─────────────────────────┘
                   │ implements interface
┌─────────────────┴─────────────────────────┐
│   CONTENT LAYER (Editable)                │
│   profile.json / experiences.json /       │
│   skills.json / certificates.json         │
└─────────────────────────────────────────────┘
```

**Why this matters:** components never `import experiences from './experiences.json'` directly. They call a hook (`useExperiences()`) that *happens* to be backed by JSON today. This one indirection is what lets you swap to Firebase or a CMS later (Section 6) without touching a single component file.

### Routing Strategy

The portfolio remains conceptually a **single-page, split-screen experience** — the Left Panel never unmounts, and the Right Canvas swaps state internally rather than doing full page navigations. However, since we're on Next.js, we get deep-linking almost for free, which resolves the edge case flagged earlier ("what if someone wants to share a link directly to Nile Air's detail view?").

*   **Root shell:** `app/page.tsx` renders `<PortfolioShell />` — this mounts once and never re-renders structurally.
*   **State-driven canvas, URL-synced:** The active view (`home`, `experience`, `experience/[company]`, `skills`, `certifications`) is held in a lightweight global store (e.g. Zustand) **and** mirrored to the URL via Next.js shallow routing. This gives you:
    *   Instant, animation-controlled transitions (no full page reload, no flash).
    *   Real, shareable URLs (`/experience/nile-air`) for free.
    *   Browser back/forward buttons work naturally, because they're just store updates triggered by route changes.
*   **Scroll-state and route-state are decoupled** (detailed in Section 5) — the URL determines *which* view is mounted; a separate in-memory store determines *where the user was scrolled to* when they left the Directory. This solves the deep-link edge case cleanly: if someone lands directly on `/experience/nile-air` via a shared link, there's simply no saved scroll offset to restore, so it defaults to top — no special-casing required, it just falls through to the default state naturally.

### The JSON-Driven Content Principle

Every string, image path, number, and color that appears on screen originates from the Content Layer. Components declare *what shape of data they need* (via TypeScript interfaces) — they never declare *what the data says*. This is the enforcement mechanism behind "Locked Design, Editable Content": if a component has no prop for a piece of content, that content literally cannot exist in that component, which prevents accidental hardcoding by construction, not just by convention.

---

## SECTION 2 — COMPONENT ARCHITECTURE

Each component is documented as: **Responsibility → Editable Region (props) → Locked Region (owned by the component itself, never exposed to content).**

### `PortfolioShell`
*   **Responsibility:** Top-level layout grid (30/70 split), mounts `LeftPanel` and `DynamicCanvas`, initializes the Data Adapter and global state store.
*   **Editable:** Nothing directly — this is pure structural scaffolding.
*   **Locked:** Grid proportions, base background color, global transition provider.

### `LeftPanel`
*   **Responsibility:** Renders the fixed identity column.
*   **Editable region:** `avatarSrc`, `fullName`, `title`, `contactLinks[]` (each with `type`, `value`, `icon`).
*   **Locked:** Flexbox `space-between` structure, hover micro-interaction (2px lift + color transition), typography *treatment* (bold display for name, tracking-wide mono for title) — the font-weight rule is locked, the font-family token itself is a design-system variable, not content.

### `NavLink` (primitive, reused across states)
*   **Responsibility:** The shared "text link with arrow" interaction used on Home and the Back button.
*   **Editable region:** `label`, `href`/`onClick` target.
*   **Locked:** The three-part hover choreography (color shift, arrow translateX, underline scale) — this is a design-system animation primitive, not a per-instance style.

### `DynamicCanvas`
*   **Responsibility:** State router. Reads the active view from the store/URL and renders the corresponding view component inside the shared exit/enter transition wrapper.
*   **Editable:** Nothing directly.
*   **Locked:** The `cubic-bezier(0.16, 1, 0.3, 1)` / 400ms transition wrapper — every child view inherits this automatically; no view can opt out or override timing.

### `HomeView`
*   **Responsibility:** Renders summary, education, languages, and the nav link stack.
*   **Editable region:** `summary` (rich text or plain string), `education[]` (`degree`, `institution`, `year`), `languages[]` (`name`, `proficiency`).
*   **Locked:** 50ms stagger sequencing, hero typography scale (20px/light-weight rule), section divider styling.

### `ExperienceDirectory`
*   **Responsibility:** Maps over the experiences array and renders `CompanyRow` for each; owns the focus/dim hover-group behavior across rows; owns scroll-position capture (Section 5).
*   **Editable region:** Consumes `experiences[]` — but the *component itself* takes no direct content props; it only orchestrates.
*   **Locked:** The opacity-dim-on-hover group behavior, row spacing via `gap`, translateX(-4px) hover shift.

### `CompanyRow`
*   **Responsibility:** Single row — company name, role/context, "Press to Explore" reveal.
*   **Editable region:** `companyName`, `roleTitle`, `context`, `slug` (for routing).
*   **Locked:** Row layout grid, hover reveal timing.

### `CompanyDetail`
*   **Responsibility:** Renders the bespoke two-column view; injects the active company's `design_config` as CSS custom properties (background, watermark, accent) at the wrapper level; owns scroll-restore on unmount (Section 5).
*   **Editable region:** `narrative` (rich text), `systems[]`, `metrics[]` (capped softly at ~4 with graceful wrap), plus the entire `design_config` object (Section 3).
*   **Locked:** Two-column grid ratio, sticky-sidebar mechanic, metrics grid `auto-fill` behavior, watermark opacity ceiling (`0.05` is a locked design-system constant — a content editor can change *which* logo, never how transparent it renders, which protects text legibility from being accidentally broken by content edits).

### `SkillsMatrix`
*   **Responsibility:** Renders the four-category asymmetrical grid with staggered entry.
*   **Editable region:** `categories[]`, each with `name` and `skills[]` (`label`, `weightTier: "primary" | "secondary"`).
*   **Locked:** Grid column logic, stagger timing, weight-tier-to-opacity mapping (the *mapping itself* — e.g. `secondary → 70% opacity` — is a design-system constant, not something content edits touch).

### `CredentialsTimeline`
*   **Responsibility:** Renders the vertical axis and nodes; owns the intersection-observer illumination logic.
*   **Editable region:** `certifications[]` (`year`, `title`, `issuer`, `verifyUrl?`).
*   **Locked:** Axis rendering (including the single-node min-height edge case), illumination threshold logic, 500–600ms illumination easing.

This gives you a clean rule of thumb: **if a value can differ between two different professionals using this same template, it's a prop. If it's true of the template itself regardless of who uses it, it's locked inside the component.**

---

## SECTION 3 — COMPREHENSIVE TEMPLATE-SAFE JSON SCHEMA

Split into separate files per your diagram, so a future CMS or admin panel can update one domain without touching others.

### `profile.json`
```json
{
  "fullName": "string",
  "title": "string",
  "avatar": {
    "src": "string (path or URL)",
    "alt": "string"
  },
  "contactLinks": [
    {
      "type": "email | linkedin | phone | custom",
      "label": "string",
      "value": "string",
      "icon": "string (icon key, mapped to a locked icon set)"
    }
  ]
}
```

### `home.json`
```json
{
  "summary": "string (plain or lightweight rich text)",
  "education": [
    { "degree": "string", "institution": "string", "year": "string" }
  ],
  "languages": [
    { "name": "string", "proficiency": "native | fluent | professional | conversational" }
  ],
  "navLinks": [
    { "label": "string", "target": "experience | skills | certifications" }
  ]
}
```

### `experiences.json`
```json
{
  "companies": [
    {
      "id": "string (slug, e.g. 'nile-air')",
      "companyName": "string",
      "roleTitle": "string",
      "dateRange": { "start": "string", "end": "string | 'present'" },
      "directoryContext": "string (short line shown in Directory row)",
      "narrative": "string (rich text, unbounded length)",
      "systemsUsed": ["string"],
      "metrics": [
        { "label": "string", "value": "string" }
      ],
      "design_config": {
        "background_image_path": "string",
        "watermark_svg_path": "string",
        "overlay_opacity": "number (0.0–1.0, soft-capped in UI regardless of value)",
        "brand_accent_color": "string (hex, optional — falls back to global accent if omitted)",
        "watermark_placement": "center | bottom-right | bottom-left",
        "max_metrics_allowed": "number (soft guardrail, default 4)",
        "animation_overrides": {
          "note": "reserved for future phases — intentionally empty object today"
        }
      }
    }
  ]
}
```

### `skills.json`
```json
{
  "categories": [
    {
      "name": "string (e.g. 'Operations')",
      "skills": [
        { "label": "string", "weightTier": "primary | secondary" }
      ]
    }
  ]
}
```

### `certificates.json`
```json
{
  "certifications": [
    {
      "id": "string",
      "year": "string",
      "title": "string",
      "issuer": "string",
      "verifyUrl": "string | null"
    }
  ]
}
```

### `design_config.json` (global-level, distinct from per-company config above)
```json
{
  "theme": {
    "background": "#0B0B0C",
    "surface": "#121214",
    "textPrimary": "#F5F5F7",
    "textSecondary": "#8E8E93",
    "accentDefault": "#2F80ED"
  },
  "transitions": {
    "globalEasing": "cubic-bezier(0.16, 1, 0.3, 1)",
    "globalDurationMs": 400,
    "illuminationDurationMs": 550
  }
}
```

**Note on `design_config` living in two places:** the *global* theme (colors used everywhere by default) lives in `design_config.json`; the *per-company override* lives nested inside each company object in `experiences.json`. This mirrors the CSS cascade itself — global tokens set the default, per-company config overrides only what that company explicitly wants to customize. A company entry with no `design_config` block at all should render using pure global defaults, which is what keeps this schema safe for someone who just wants to add a company without designing a custom skin.

---

## SECTION 4 — HOW COMPONENTS CONSUME THE SCHEMA (Implementation Plan)

No component ever does `import data from '../experiences.json'`. Instead:

1.  **Adapter hooks** (`useProfile()`, `useExperiences()`, `useSkills()`, `useCertifications()`) sit between components and data. Today, these hooks internally read from the JSON files; components have no idea that's the case.
2.  **Components declare typed props/interfaces**, e.g. `CompanyDetail` expects a `CompanyEntry` shape — it will render identically whether that object came from a 5-word narrative or a 500-word one, because nothing about its layout logic references content length.
3.  **`design_config` is consumed as CSS custom properties**, injected at the `CompanyDetail` wrapper level (`style={{ '--company-accent': config.brand_accent_color }}`), so the locked Tailwind/CSS classes underneath simply *reference* a variable rather than needing per-company conditional class logic. This is what lets Almatar and Nile Air look distinct while sharing 100% of the same component code.
4.  **Arrays render via `.map()` with no assumptions about length** — one company or twenty, zero skills in a category or fifteen, all resolve through the same loop with no hardcoded indices anywhere.

---

## SECTION 5 — DYNAMIC DATA FLOW & STATE ENGINE

### Hydration Lifecycle
1.  On initial load, `PortfolioShell` calls the Data Adapter once (via a root-level data-fetching layer — Next.js Server Components are a natural fit here, since the JSON is static at build time in Phase 1).
2.  Fetched content is passed down through React context, so any view component can call its adapter hook without prop-drilling five levels deep.
3.  No component fetches its own slice independently — this avoids waterfall loading and keeps the adapter as the single source of truth.

### Scroll-State Capture & Restore (the exact mechanic from your prototype, generalized)
This lives in a small dedicated store — separate from the content store, because scroll position is *ephemeral UI state*, not content:

```
scrollStore = {
  offsets: { [viewId: string]: number }
}
```

*   **On navigating Directory → Detail:** before the route/state change fires, `scrollStore.offsets['experience'] = window.scrollY`.
*   **On navigating Detail → Directory (via Back):** after the Directory view remounts, check `scrollStore.offsets['experience']`. If a value exists, restore it (`window.scrollTo(0, offset)`); if none exists (e.g. someone arrived via a direct `/experience/nile-air` link and hit Back for the first time), default silently to `0` — no error state, no special UI, just a sane fallback.
*   **The capture/restore logic lives inside `ExperienceDirectory` and `CompanyDetail` themselves** (via a shared hook, `useScrollMemory(viewId)`), not in the routing layer — this keeps the routing layer purely about *which view*, and the scroll layer purely about *where in that view*.

---

## SECTION 6 — FUTURE MIGRATION & SCALING STRATEGY (The Data Adapter Layer)

This is the piece that proves the architecture is genuinely future-proof, not just "editable JSON."

### The Contract
Every adapter — regardless of what's behind it — must implement the same interface:

```ts
interface ContentAdapter {
  getProfile(): Promise<Profile>;
  getHomeContent(): Promise<HomeContent>;
  getExperiences(): Promise<CompanyEntry[]>;
  getSkills(): Promise<SkillCategory[]>;
  getCertifications(): Promise<Certification[]>;
  getGlobalDesignConfig(): Promise<DesignConfig>;
}
```

Components and hooks are written against this interface — never against "JSON" or "Firebase" specifically.

### Today: `JSONAdapter`
```ts
class JSONAdapter implements ContentAdapter {
  async getExperiences() {
    return experiencesJson.companies; // static import, build-time
  }
  // ...same pattern for every method
}
```

### Tomorrow: `FirebaseAdapter` (or `CMSAdapter`, `APIAdapter`)
```ts
class FirebaseAdapter implements ContentAdapter {
  async getExperiences() {
    const snapshot = await getDocs(collection(db, "experiences"));
    return snapshot.docs.map(doc => doc.data() as CompanyEntry);
  }
  // ...same method signatures, totally different internals
}
```

### The Swap
A single line, typically an environment-driven factory, decides which adapter is active:

```ts
const adapter: ContentAdapter =
  process.env.CONTENT_SOURCE === "firebase"
    ? new FirebaseAdapter()
    : new JSONAdapter();
```

Because every component only ever consumed the *interface* (`ContentAdapter`), not a specific implementation, this swap is invisible to the entire Presentation Engine layer. `CompanyDetail` doesn't know or care whether `getExperiences()` resolved from a local JSON import or a live Firestore query — it received a `CompanyEntry[]` shaped exactly the same way either time.

**This is the proof for your original test:** *"Would this still work if someone swapped the content entirely?"* — extended one level further to *"Would this still work if someone swapped where the content even comes from?"* Yes, because the interface, not the data source, is what the UI is actually built against.

---

## SECTION 7 — COMPONENT TREE & DEPENDENCY GRAPH

### 7.1 Full Visual Component Tree

```
PortfolioShell
│
├── ContentProvider              (context wrapper — not visual, wraps the tree below)
│
├── LeftPanel
│   ├── Avatar
│   ├── IdentityBlock            (fullName + title)
│   └── ContactLinkList
│       └── ContactLinkItem      (× n, one per contact method)
│
└── DynamicCanvas
    ├── TransitionWrapper        (owns the 400ms fade/scale enter-exit)
    │
    ├── HomeView                          [route: /]
    │   ├── SummaryBlock
    │   ├── EducationList
    │   │   └── EducationItem    (× n)
    │   ├── LanguageBadgeList
    │   │   └── LanguageBadge    (× n)
    │   └── NavLinkStack
    │       └── NavLink          (× 3 — Experience / Skills / Certifications)
    │
    ├── ExperienceDirectory               [route: /experience]
    │   └── CompanyRow           (× n, mapped from experiences[])
    │       └── (click) → routes to CompanyDetail via slug
    │
    ├── CompanyDetail                     [route: /experience/[slug]]
    │   ├── BackNavLink          (uses NavLink primitive, reversed variant)
    │   ├── CompanyHeader        (name, role, date range)
    │   ├── ColumnNarrative
    │   │   └── RichText
    │   └── ColumnSidebar        (sticky)
    │       ├── SystemsTagList
    │       │   └── SystemTag    (× n)
    │       └── MetricsGrid
    │           └── MetricItem   (× n, soft-capped ~4, auto-wraps)
    │
    ├── SkillsMatrix                       [route: /skills]
    │   └── SkillCategoryColumn  (× 4 — Operations / AI Tools / Systems / Soft Skills)
    │       └── SkillTag         (× n, weightTier-driven styling)
    │
    └── CredentialsTimeline               [route: /certifications]
        ├── TimelineAxis
        └── TimelineNode         (× n, mapped from certifications[])
            ├── NodeMarker
            └── NodeContent      (year, title, issuer, optional VerifyLink)
```

**Reading notes:**
*   `NavLink` and `MetricItem`/`SkillTag`/`ContactLinkItem`/`TimelineNode` are the tree's true **primitives** — small, prop-driven, no data-fetching of their own. Everything above them is a **container** that fetches or receives data and distributes it downward.
*   Only five components ever mount as a direct child of `DynamicCanvas`: `HomeView`, `ExperienceDirectory`, `CompanyDetail`, `SkillsMatrix`, `CredentialsTimeline`. This 1-to-1 mapping with the five defined states is intentional — it's what makes the router/state-engine logic trivial (Section 5) and keeps `DynamicCanvas` itself free of any view-specific logic.

---

### 7.2 Dependency & Import Map

For each component: what it imports, what it mounts, and what data source it listens to.

#### `PortfolioShell`
*   **Imports:** `LeftPanel`, `DynamicCanvas`, `ContentProvider`, global Tailwind stylesheet.
*   **Children:** `ContentProvider` (wraps everything), `LeftPanel`, `DynamicCanvas`.
*   **Data context:** Instantiates the `ContentAdapter` (Section 6) once and passes it into `ContentProvider`. Owns nothing else — purely a composition root.

#### `ContentProvider`
*   **Imports:** React Context API, `ContentAdapter` interface.
*   **Children:** Whatever is passed as `children` (the rest of the tree) — it's a wrapper, not a visual component.
*   **Data context:** This *is* the data context — every `useX()` hook downstream reads from the context this component establishes.

#### `LeftPanel`
*   **Imports:** `Avatar`, `IdentityBlock`, `ContactLinkList`, design tokens (spacing/typography constants).
*   **Children:** `Avatar`, `IdentityBlock`, `ContactLinkList`.
*   **Data context:** Calls `useProfile()` once, destructures and passes slices down as props to its three children (no grandchild calls the adapter directly — this keeps data-fetching at a single, predictable altitude).

#### `Avatar` / `IdentityBlock` / `ContactLinkList` → `ContactLinkItem`
*   **Imports:** Icon set (locked), no data hooks.
*   **Children:** `ContactLinkItem` (× n) under `ContactLinkList`.
*   **Data context:** None — pure presentational, receive everything via props from `LeftPanel`.

#### `DynamicCanvas`
*   **Imports:** `TransitionWrapper`, the five view components, routing hook (Next.js `usePathname`/`useRouter` or equivalent state-store selector).
*   **Children:** `TransitionWrapper`, which conditionally renders exactly one of the five views based on current route/state.
*   **Data context:** Reads only the *routing/view-state* store — never touches content data itself. This separation (view-state vs. content-state) is what keeps it a pure router.

#### `TransitionWrapper`
*   **Imports:** Framer Motion (or CSS-transition equivalent), the global easing/duration tokens from `design_config.json`.
*   **Children:** Passthrough — renders whichever view is given to it as `children`.
*   **Data context:** None (design-system constants only, not content).

#### `HomeView`
*   **Imports:** `SummaryBlock`, `EducationList`, `LanguageBadgeList`, `NavLinkStack`.
*   **Children:** All four listed above.
*   **Data context:** Calls `useHomeContent()`. Passes `summary` to `SummaryBlock`, `education[]` to `EducationList`, `languages[]` to `LanguageBadgeList`, and `navLinks[]` to `NavLinkStack`.

#### `NavLinkStack` → `NavLink`
*   **Imports:** `NavLink` primitive.
*   **Children:** `NavLink` (× 3).
*   **Data context:** None directly — receives its array as props from `HomeView`. `NavLink` itself listens to the routing store on click (to trigger navigation) but reads no content data.

#### `ExperienceDirectory`
*   **Imports:** `CompanyRow`, `useScrollMemory` hook.
*   **Children:** `CompanyRow` (× n).
*   **Data context:** Calls `useExperiences()` for the array; calls `useScrollMemory('experience')` on mount/unmount to capture `window.scrollY` into the scroll store (Section 5) — this is the one non-content, UI-state context this component touches.

#### `CompanyRow`
*   **Imports:** Routing hook (to navigate via slug on click).
*   **Children:** None (leaf/primitive).
*   **Data context:** None — receives one `CompanyEntry`'s directory-relevant fields as props (`companyName`, `roleTitle`, `context`, `slug`).

#### `CompanyDetail`
*   **Imports:** `BackNavLink`, `CompanyHeader`, `ColumnNarrative`, `ColumnSidebar`, `useScrollMemory` hook.
*   **Children:** `BackNavLink`, `CompanyHeader`, `ColumnNarrative`, `ColumnSidebar`.
*   **Data context:** Calls `useExperiences()` and selects the single entry matching the current `slug` from the route. Reads that entry's `design_config` and injects it as CSS custom properties on its own wrapper element (so every descendant can reference `var(--company-accent)` etc. without themselves knowing about `design_config`). Also calls `useScrollMemory('experience')` on unmount to *restore* the previously captured offset — the mirror-image of what `ExperienceDirectory` does on entry.

#### `ColumnSidebar` → `SystemsTagList` / `MetricsGrid`
*   **Imports:** `SystemTag`, `MetricItem`.
*   **Children:** `SystemsTagList` (→ `SystemTag` × n), `MetricsGrid` (→ `MetricItem` × n).
*   **Data context:** None — receives `systems[]` and `metrics[]` as props from `CompanyDetail`.

#### `SkillsMatrix`
*   **Imports:** `SkillCategoryColumn`.
*   **Children:** `SkillCategoryColumn` (× 4).
*   **Data context:** Calls `useSkills()`, passes each category object down.

#### `SkillCategoryColumn` → `SkillTag`
*   **Imports:** `SkillTag`.
*   **Children:** `SkillTag` (× n).
*   **Data context:** None — receives its category's `skills[]` as props.

#### `CredentialsTimeline`
*   **Imports:** `TimelineAxis`, `TimelineNode`, Intersection Observer hook (`useIlluminationObserver`).
*   **Children:** `TimelineAxis`, `TimelineNode` (× n).
*   **Data context:** Calls `useCertifications()` for the array. Each `TimelineNode` registers itself with `useIlluminationObserver` individually so its own illuminated/dimmed state is self-contained rather than calculated centrally — this keeps the observer logic co-located with the element it's watching, not lifted awkwardly into the parent.

#### `TimelineNode` → `NodeMarker` / `NodeContent`
*   **Imports:** `NodeMarker`, `NodeContent`, `useIlluminationObserver`.
*   **Children:** `NodeMarker`, `NodeContent`.
*   **Data context:** Own local illumination boolean from the observer hook; content fields (`year`, `title`, `issuer`, `verifyUrl`) passed down as props from `CredentialsTimeline`.

---

### 7.3 What This Map Proves

Two structural guarantees fall out of this graph, both worth stating explicitly before freezing the architecture:

1.  **Data-fetching altitude is shallow and consistent.** Only six components ever call an adapter hook directly: `LeftPanel`, `HomeView`, `ExperienceDirectory`, `CompanyDetail`, `SkillsMatrix`, `CredentialsTimeline`. Every primitive beneath them is pure-props. This means a future content change can never require touching a leaf component — only ever the six "container" components, and even then only if the *shape* of the data changes, not its values.
2.  **UI-state (routing, scroll memory, illumination) is fully separate from content-state.** No component ever mixes a `useX()` content call with scroll or observer logic in a way that entangles them — `ExperienceDirectory` and `CompanyDetail` both touch `useScrollMemory`, but it's a distinct call from `useExperiences()`, not a merged concern. This is what keeps Section 5's scroll engine swappable or removable later without any risk to content rendering.

---

## Where This Leaves Us

Every piece of Phase 1 is now specified end-to-end: layout, interaction, animation, component responsibilities, JSON shape, state lifecycle, and the migration path beyond JSON. This document is the single source of truth to validate against before any production code is written.

Flag anything here you want revised — otherwise, next step is implementation: scaffolding the Next.js project structure, the adapter, and the first locked components (starting with `PortfolioShell` + `LeftPanel`, since nothing else mounts without them).
