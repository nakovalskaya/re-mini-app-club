export const ROUTE_HOME = "/";
export const ROUTE_CATEGORY = "/category/:slug";
export const ROUTE_TOPIC = "/topic/:slug";
export const ROUTE_MATERIAL = "/materials/:id";
export const ROUTE_CHALLENGES = "/challenges";
export const ROUTE_CHALLENGE_CATALOG = "/challenges/catalog";
export const ROUTE_CHALLENGE_DETAILS = "/challenges/:id";
export const ROUTE_FAVORITES = "/favorites";
export const ROUTE_CLUB = "/club";
export const ROUTE_CALENDAR_DAY = "/calendar/:date";

export const tabBarItems = [
  { label: "Главная", to: ROUTE_HOME, icon: "house" },
  { label: "Челленджи", to: ROUTE_CHALLENGES, icon: "target" },
  { label: "Избранное", to: ROUTE_FAVORITES, icon: "star" },
  { label: "О клубе", to: ROUTE_CLUB, icon: "book" }
] as const;
