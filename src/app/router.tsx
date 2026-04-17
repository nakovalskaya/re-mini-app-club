import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "@/app/layout/AppShell";
import { CalendarDayScreen } from "@/screens/calendar-day/CalendarDayScreen";
import { CategoryScreen } from "@/screens/category/CategoryScreen";
import { ChallengeDetailsScreen } from "@/screens/challenge-details/ChallengeDetailsScreen";
import { ChallengesScreen } from "@/screens/challenges/ChallengesScreen";
import { ClubScreen } from "@/screens/club/ClubScreen";
import { FavoritesScreen } from "@/screens/favorites/FavoritesScreen";
import { HomeScreen } from "@/screens/home/HomeScreen";
import { TopicScreen } from "@/screens/topic/TopicScreen";
import {
  ROUTE_CALENDAR_DAY,
  ROUTE_CATEGORY,
  ROUTE_CHALLENGE_DETAILS,
  ROUTE_CHALLENGES,
  ROUTE_CLUB,
  ROUTE_FAVORITES,
  ROUTE_HOME,
  ROUTE_TOPIC
} from "@/shared/constants/routes";

export const router = createBrowserRouter([
  {
    path: ROUTE_HOME,
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: ROUTE_CATEGORY, element: <CategoryScreen /> },
      { path: ROUTE_TOPIC, element: <TopicScreen /> },
      { path: ROUTE_CHALLENGES, element: <ChallengesScreen /> },
      { path: ROUTE_CHALLENGE_DETAILS, element: <ChallengeDetailsScreen /> },
      { path: ROUTE_FAVORITES, element: <FavoritesScreen /> },
      { path: ROUTE_CLUB, element: <ClubScreen /> },
      { path: ROUTE_CALENDAR_DAY, element: <CalendarDayScreen /> }
    ]
  }
]);
