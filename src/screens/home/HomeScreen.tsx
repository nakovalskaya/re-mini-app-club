import { CalendarCard } from "@/components/CalendarCard/CalendarCard";
import { CategoryCard } from "@/components/CategoryCard/CategoryCard";
import { HeroPanel } from "@/components/HeroPanel/HeroPanel";
import { MaterialCard } from "@/components/MaterialCard/MaterialCard";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { TopicPill } from "@/components/TopicPill/TopicPill";
import {
  getRecommendedMaterials,
  getVisibleCategories,
  getVisibleTopics
} from "@/features/materials/selectors";

export function HomeScreen() {
  const categories = getVisibleCategories();
  const topics = getVisibleTopics();
  const recommended = getRecommendedMaterials();
  const featured = recommended[0];
  const restRecommended = recommended.slice(1, 5);

  return (
    <section className="screen-stack">
      <HeroPanel
        title="Реакция"
        subtitle="Закрытый клуб Надежды Ковальской"
      />

      <div className="-mt-14 grid grid-cols-2 auto-rows-fr gap-2.5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>

      <div className="space-y-3.5">
        <SectionTitle title="Темы клуба" eyebrow="Навигация" />
        <div className="-mx-screen overflow-x-auto px-screen">
          <div className="flex w-max gap-2 pb-1">
            {topics.map((topic) => (
              <TopicPill key={topic.id} label={topic.title} to={`/topic/${topic.slug}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3.5">
        <SectionTitle title="График материалов" />
        <CalendarCard />
      </div>

      <div className="space-y-3.5">
        <SectionTitle
          title="Рекомендуемое"
          eyebrow="Подборка"
          description="Автоматическая витрина материалов, отмеченных как recommended."
        />
        {featured ? <MaterialCard material={featured} featured /> : null}
        <div className="space-y-3.5">
          {restRecommended.map((material) => (
            <MaterialCard key={material.id} material={material} />
          ))}
        </div>
      </div>
    </section>
  );
}
