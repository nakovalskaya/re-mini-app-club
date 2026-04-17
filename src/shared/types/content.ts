export type MaterialType = "lesson" | "live" | "podcast";
export type MaterialStatus = "published" | "scheduled" | "hidden";

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
  telegramUrl: string;
  coverImage: string;
  duration: string;
  status: MaterialStatus;
  publishedAt: string;
  scheduledAt: string;
  tags: string[];
  orderWeight: number;
  calendarColorKey: string;
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
  days: ChallengeDay[];
};

export type ClubPage = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  content: string;
};
