import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import type { UsefulLink } from "@/shared/types/content";

type LinksSource = "notion" | "mock";

type LinksContextValue = {
  links: UsefulLink[];
  isLoading: boolean;
  source: LinksSource;
};

type LinksCachePayload = {
  source: LinksSource;
  links: UsefulLink[];
  savedAt: number;
};

const LinksContext = createContext<LinksContextValue | null>(null);

let cachedLinksState: Omit<LinksContextValue, "isLoading"> | null = null;
let linksLoadPromise: Promise<Omit<LinksContextValue, "isLoading">> | null = null;
const linksCacheKey = "club_links_cache:v1";
const linksCacheTtlMs = 1000 * 60 * 10;
const linksEndpoint =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/__api/notion-links"
    : "/api/notion-links";

function readCachedLinks(): Omit<LinksContextValue, "isLoading"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(linksCacheKey);

    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as Partial<LinksCachePayload>;

    if (
      !Array.isArray(payload.links) ||
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > linksCacheTtlMs
    ) {
      window.localStorage.removeItem(linksCacheKey);
      return null;
    }

    return {
      links: payload.links,
      source: payload.source === "notion" ? "notion" : "mock"
    };
  } catch {
    return null;
  }
}

function persistCachedLinks(state: Omit<LinksContextValue, "isLoading">) {
  if (typeof window === "undefined" || state.source !== "notion") {
    return;
  }

  try {
    const payload: LinksCachePayload = {
      ...state,
      savedAt: Date.now()
    };

    window.localStorage.setItem(linksCacheKey, JSON.stringify(payload));
  } catch {
    // ignore storage write errors
  }
}

async function loadLinksOnce() {
  if (cachedLinksState) {
    return cachedLinksState;
  }

  const storedState = readCachedLinks();

  if (storedState) {
    cachedLinksState = storedState;
    return storedState;
  }

  if (!linksLoadPromise) {
    linksLoadPromise = (async () => {
      try {
        const response = await fetch(linksEndpoint, {
          method: "GET",
          cache: "default",
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Links request failed: ${response.status}`);
        }

        const payload = (await response.json()) as {
          links?: UsefulLink[];
          source?: LinksSource;
        };

        cachedLinksState = {
          links: Array.isArray(payload.links) ? payload.links : [],
          source: payload.source === "notion" ? "notion" : "mock"
        };
        persistCachedLinks(cachedLinksState);
      } catch (error) {
        console.error("Failed to load Notion links.", error);
        cachedLinksState = {
          links: [],
          source: "mock"
        };
      }

      return cachedLinksState;
    })();
  }

  return linksLoadPromise;
}

export function LinksProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LinksContextValue>(() => {
    const storedState = readCachedLinks();

    if (cachedLinksState) {
      return {
        ...cachedLinksState,
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
      links: [],
      isLoading: true,
      source: "mock"
    };
  });

  useEffect(() => {
    let active = true;

    loadLinksOnce().then((nextState) => {
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

  return <LinksContext.Provider value={value}>{children}</LinksContext.Provider>;
}

export function useLinks() {
  const context = useContext(LinksContext);

  if (!context) {
    throw new Error("useLinks must be used inside LinksProvider");
  }

  return context;
}
