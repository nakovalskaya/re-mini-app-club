import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { clubPage } from "@/data/club";

export function ClubScreen() {
  return (
    <section className="space-y-6">
      <SectionTitle title={clubPage.title} description={clubPage.summary} />
      <div className="surface-card p-card text-base leading-7 text-text-secondary">
        {clubPage.content}
      </div>
    </section>
  );
}
