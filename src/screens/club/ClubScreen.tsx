import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { clubPage } from "@/data/club";

export function ClubScreen() {
  return (
    <section className="space-y-6 pt-2">
      <SectionTitle title={clubPage.title} description={clubPage.summary} />
      <div className="surface-card p-card">
        <p className="type-body whitespace-pre-line">
          {clubPage.content}
        </p>
      </div>
    </section>
  );
}
