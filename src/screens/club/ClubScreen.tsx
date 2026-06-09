import type { ReactNode } from "react";
import { Compass, Prohibit, Sparkle, Wallet } from "@phosphor-icons/react";
import { Button } from "@/components/Button/Button";
import { SectionTitle } from "@/components/SectionTitle/SectionTitle";
import { clubPage } from "@/data/club";
import { openTelegramLink } from "@/features/telegram/telegram";

const MANAGER_URL = "https://t.me/nakovalskayaa";
const PERSONAL_URL = "https://t.me/nakovalskayaaa";

function RuleItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="rule-bullet" aria-hidden="true" />
      <p className="type-body">{children}</p>
    </li>
  );
}

export function ClubScreen() {
  return (
    <section className="space-y-4 pt-2">
      <SectionTitle title={clubPage.title} description={clubPage.summary} />

      {/* Welcome */}
      <div className="surface-card space-y-2 p-card">
        <h3 className="font-serif text-[1.16rem] leading-tight text-text-primary">
          Добро пожаловать в Реакцию
        </h3>
        <p className="type-body">
          Это закрытое пространство для участников, которые хотят расти системно: получать новые знания, внедрять их в практику и обсуждать результаты вместе с единомышленниками. Чтобы внутри было комфортно всем, в клубе действуют правила, соблюдение которых обязательно для каждого участника.
        </p>
      </div>

      {/* Prohibitions — each rule as a bulleted item so it reads as a list, not
          a wall of paragraphs. */}
      <div className="surface-card space-y-3 p-card">
        <div className="flex items-center gap-2.5">
          <Prohibit
            size={20}
            weight="duotone"
            className="shrink-0 text-accent-gold"
          />
          <h3 className="font-serif text-[1.05rem] leading-tight text-text-primary">
            Что в клубе запрещено
          </h3>
        </div>
        <ul className="space-y-2.5 list-none">
          <RuleItem>
            В клубе нельзя оскорблять других участников, проявлять неуважение, разжигать конфликты и поднимать провокационные темы.
          </RuleItem>
          <RuleItem>
            Запрещено рекламировать сомнительные сайты, ссылки и услуги, которые могут навредить участникам или нарушают законы РФ. Также нельзя предлагать собственные услуги и делать рассылки другим участникам без предварительного согласования с командой клуба.
          </RuleItem>
          <RuleItem>
            Все материалы клуба, включая уроки, презентации, промпты и записи эфиров, являются интеллектуальной собственностью и предназначены только для участников. Их нельзя выкладывать в открытый доступ, пересылать третьим лицам и использовать в собственных продуктах. За распространение материалов предусмотрен пожизненный бан без возврата средств, а также штраф по условиям публичной оферты.
          </RuleItem>
        </ul>
      </div>

      {/* How it works — two short paragraphs, kept as-is for narrative flow. */}
      <div className="surface-card space-y-3 p-card">
        <div className="flex items-center gap-2.5">
          <Compass
            size={20}
            weight="duotone"
            className="shrink-0 text-accent-gold"
          />
          <h3 className="font-serif text-[1.05rem] leading-tight text-text-primary">
            Как устроена работа в клубе
          </h3>
        </div>
        <ul className="space-y-2.5 list-none">
          <RuleItem>
            В работе с обратной связью действует простой принцип: сначала внедрение, потом обсуждение. Если предыдущие рекомендации не были применены, следующая обратная связь не предоставляется до тех пор, пока вы не выполните то, о чём договорились.
          </RuleItem>
          <RuleItem>
            Все вопросы и обсуждения ведутся в общем чате. Если вам нужна помощь, отметьте меня или команду, и мы откликнемся. В чате также запрещён спам и навязчивые сообщения.
          </RuleItem>
        </ul>
      </div>

      {/* Payment & subscription — intro stays as a paragraph, the rest is a
          clear list of terms. */}
      <div className="surface-card space-y-3 p-card">
        <div className="flex items-center gap-2.5">
          <Wallet
            size={20}
            weight="duotone"
            className="shrink-0 text-accent-gold"
          />
          <h3 className="font-serif text-[1.05rem] leading-tight text-text-primary">
            Оплата и подписка
          </h3>
        </div>
        <p className="type-body">
          При оплате участия вы соглашаетесь с условиями клуба и публичной офертой. За нарушение правил вы можете быть исключены из клуба навсегда без возврата средств.
        </p>
        <ul className="space-y-2.5 list-none">
          <RuleItem>
            Если вы забыли отменить подписку, средства за уже оплаченный период не возвращаются.
          </RuleItem>
          <RuleItem>
            Стоимость подписки сохраняется за вами только при непрерывном продлении. После отмены подписки и повторного входа цена будет выше, потому что клуб регулярно дорожает, и фиксированный тариф действует только для активных участников.
          </RuleItem>
          <RuleItem>
            Если вы отменили подписку и захотите вернуться, это будет возможно не ранее, чем через шесть месяцев, и уже по актуальной цене без скидок.
          </RuleItem>
        </ul>
        <p className="type-body pt-1">
          Чтобы управлять подпиской, отменить её или задать вопрос по оплате, свяжитесь с менеджером.
        </p>
        <Button onClick={() => openTelegramLink(MANAGER_URL)}>
          Написать менеджеру
        </Button>
      </div>

      {/* Personal / other-products CTA */}
      <div className="surface-card space-y-3 p-card">
        <div className="flex items-center gap-2.5">
          <Sparkle
            size={20}
            weight="duotone"
            className="shrink-0 text-accent-gold"
          />
          <h3 className="font-serif text-[1.05rem] leading-tight text-text-primary">
            Узнать о других форматах работы со мной
          </h3>
        </div>
        <p className="type-body">
          Если хотите узнать о других моих курсах, личной работе, наставничестве или других продуктах, напишите мне напрямую. Расскажу, какие форматы подходят под ваш запрос.
        </p>
        <Button onClick={() => openTelegramLink(PERSONAL_URL)}>
          Связаться с Надей
        </Button>
      </div>
    </section>
  );
}
