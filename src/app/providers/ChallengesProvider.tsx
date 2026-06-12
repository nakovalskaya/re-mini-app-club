import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { challenges as mockChallenges } from "@/data/challenges";
import type { Challenge } from "@/shared/types/content";

type ChallengesSource = "notion" | "mock";

type ChallengesContextValue = {
  challenges: Challenge[];
  isLoading: boolean;
  source: ChallengesSource;
};

type ChallengesCachePayload = {
  source: ChallengesSource;
  challenges: Challenge[];
  savedAt: number;
};

const ChallengesContext = createContext<ChallengesContextValue | null>(null);

let cachedChallengesState: Omit<ChallengesContextValue, "isLoading"> | null = null;
let challengesLoadPromise: Promise<Omit<ChallengesContextValue, "isLoading">> | null = null;
const challengesCacheKey = "club_challenges_cache:v3";
const challengesCacheTtlMs = 1000 * 60 * 10;
const challengesEndpoint =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/__api/notion-challenges"
    : "/api/notion-challenges";

function readCachedChallenges(): Omit<ChallengesContextValue, "isLoading"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(challengesCacheKey);
    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as Partial<ChallengesCachePayload>;
    if (
      !Array.isArray(payload.challenges) ||
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > challengesCacheTtlMs
    ) {
      window.localStorage.removeItem(challengesCacheKey);
      return null;
    }

    return {
      challenges: payload.challenges,
      source: payload.source === "notion" ? "notion" : "mock"
    };
  } catch {
    return null;
  }
}

function persistCachedChallenges(state: Omit<ChallengesContextValue, "isLoading">) {
  if (typeof window === "undefined" || state.source !== "notion") {
    return;
  }

  try {
    const payload: ChallengesCachePayload = {
      ...state,
      savedAt: Date.now()
    };
    window.localStorage.setItem(challengesCacheKey, JSON.stringify(payload));
  } catch {
    // ignore storage write errors
  }
}

async function loadChallengesOnce() {
  if (cachedChallengesState) {
    return cachedChallengesState;
  }

  const storedState = readCachedChallenges();
  if (storedState) {
    cachedChallengesState = storedState;
    return storedState;
  }

  if (!challengesLoadPromise) {
    challengesLoadPromise = (async () => {
      try {
        const response = await fetch(challengesEndpoint, {
          method: "GET",
          cache: "default",
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Challenges request failed: ${response.status}`);
        }

        const payload = (await response.json()) as {
          challenges?: Challenge[];
          source?: ChallengesSource;
        };

        cachedChallengesState = {
          challenges: Array.isArray(payload.challenges) ? payload.challenges : [],
          source: payload.source === "notion" ? "notion" : "mock"
        };
        persistCachedChallenges(cachedChallengesState);
      } catch (error) {
        console.error("Failed to load Notion challenges, fallback to mock data.", error);
        cachedChallengesState = {
          challenges: mockChallenges,
          source: "mock"
        };
      }

      return cachedChallengesState;
    })();
  }

  return challengesLoadPromise;
}

export function ChallengesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChallengesContextValue>(() => {
    const storedState = readCachedChallenges();

    if (cachedChallengesState) {
      return {
        ...cachedChallengesState,
        isLoading: false
      };
    }

    if (storedState) {
      return {
        ...storedState,
        isLoading: false
      };
    }

    return {
      challenges: [],
      isLoading: true,
      source: "mock"
    };
  });

  useEffect(() => {
    let active = true;

    loadChallengesOnce().then((nextState) => {
      if (!active) {
        return;
      }

      setState({
        ...nextState,
        isLoading: false
      });
    });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(() => state, [state]);

  return <ChallengesContext.Provider value={value}>{children}</ChallengesContext.Provider>;
}

export function useChallenges() {
  const context = useContext(ChallengesContext);

  if (!context) {
    throw new Error("useChallenges must be used inside ChallengesProvider");
  }

  return context;
}
