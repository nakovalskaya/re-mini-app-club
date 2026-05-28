export type MaterialType = "lesson" | "course" | "live" | "podcast" | "guide" | "article" | "manual";
export type MaterialStatus = "published" | "scheduled" | "hidden";
export type LinkStatus = "published" | "hidden";

export type Category = {
  id: string;
  slug: string;
  title: string;
  description: string;
  order: number;
  isVisible: boolean;
};

export type Topic = {
  id: string;
  slug: string;
  title: string;
  order: number;
  isVisible: boolean;
};

export type Material = {
  id: string;
  type: MaterialType;
  categoryId: string;
  topicIds: string[];
  title: string;
  shortDescription: string;
  longDescription?: string;
  extraDescription?: string;
  telegramUrl: string;
  coverImage: string;
  duration: string;
  status: MaterialStatus;
  publishedAt: string;
  scheduledAt: string;
  tags: string[];
  isFeatured?: boolean;
  orderWeight: number;
  calendarColorKey: string;
};

export type RichTextSpan = {
  text: string;
  href?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
};

export type UsefulLink = {
  id: string;
  title: string;
  description: string;
  descriptionRichText: RichTextSpan[];
  url: string;
  tags: string[];
  status: LinkStatus;
  orderWeight: number;
};

export type ChallengeDay = {
  id: string;
  challengeId: string;
  dayNumber: number;
  title: string;
  description: string;
  telegramUrl: string;
};

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  description: string;
  durationDays: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  status: "active" | "archived";
  topicIds: string[];
  rulesUrl: string;
  days: ChallengeDay[];
};

export type ClubPage = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
};
