// app/page.tsx
//
// Root page — a React Server Component and the single composition root of
// the entire app. Fetches every content domain via contentAdapter and
// passes it down as explicit props to PortfolioShell, which internally
// owns both the Left Panel and DynamicCanvas. No client-side fetching, no
// context/provider.

import { contentAdapter } from "@/adapters/jsonAdapter";
import PortfolioShell from "@/layouts/PortfolioShell";

export default async function Page() {
  const [profile, designConfig, homeContent, experiencesContent, skillsContent, certificatesContent] =
    await Promise.all([
      contentAdapter.getProfile(),
      contentAdapter.getGlobalDesignConfig(),
      contentAdapter.getHomeContent(),
      contentAdapter.getExperiences(),
      contentAdapter.getSkills(),
      contentAdapter.getCertifications(),
    ]);

  return (
    <PortfolioShell
      profile={profile}
      theme={designConfig.theme}
      transitionConfig={designConfig.transitions}
      homeContent={homeContent}
      experiences={experiencesContent.companies}
      skills={skillsContent.categories}
      certifications={certificatesContent.certifications}
    />
  );
}
