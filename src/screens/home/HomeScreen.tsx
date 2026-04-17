import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { categories } from "@/data/categories";
import { challenges } from "@/data/challenges";
import { materials } from "@/data/materials";
import { topics } from "@/data/topics";

export function HomeScreen() {
  return (
    <section className="flex flex-col gap-section">
      <div className="surface-card-elevated overflow-hidden bg-accent-deep px-card py-8 text-bg-base">
        <p className="mb-3 text-xs font-medium uppercase tracking-[0.24em] text-accent-gold">
          Закрытый клуб
        </p>
        <h1 className="font-serif text-4xl leading-none">MetaMarketing</h1>
        <p className="mt-4 max-w-[28ch] text-sm leading-6 text-[#f7e7e4]">
          Фундамент MVP уже поднят: дальше на этот каркас будем собирать
          брендовый интерфейс экрана за экраном.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <div key={category.id} className="surface-card p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-text-secondary">
              {category.description}
            </p>
            <p className="mt-3 text-lg font-semibold text-text-primary">
              {category.title}
            </p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <SectionTitle
          title="Стартовые данные"
          description="На этом шаге мы уже подключили mock-контент и маршруты для всех экранов MVP."
        />
        <div className="surface-card space-y-3 p-card text-sm text-text-secondary">
          <p>Тем: {topics.length}</p>
          <p>Материалов: {materials.length}</p>
          <p>Челленджей: {challenges.length}</p>
        </div>
      </div>
    </section>
  );
}
