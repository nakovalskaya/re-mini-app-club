import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";
import { materials as mockMaterials } from "@/data/materials";
import type { Material } from "@/shared/types/content";

type MaterialsSource = "notion" | "mock";

type MaterialsContextValue = {
  materials: Material[];
  isLoading: boolean;
  source: MaterialsSource;
};

type MaterialsCachePayload = {
  source: MaterialsSource;
  materials: Material[];
  savedAt: number;
};

declare global {
  interface Window {
    __MATERIALS_DEBUG__?: {
      source: MaterialsSource;
      count: number;
      items: Array<{ id: string; title: string }>;
      hasNotionLesson: boolean;
    };
  }
}

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

let cachedMaterialsState: Omit<MaterialsContextValue, "isLoading"> | null = null;
let materialsLoadPromise: Promise<Omit<MaterialsContextValue, "isLoading">> | null = null;
const materialsCacheKey = "club_materials_cache:v1";
const materialsCacheTtlMs = 1000 * 60 * 10;
const materialsEndpoint =
  typeof import.meta !== "undefined" && import.meta.env?.DEV
    ? "/__api/notion-materials"
    : "/api/notion-materials";

function readCachedMaterials(): Omit<MaterialsContextValue, "isLoading"> | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(materialsCacheKey);

    if (!raw) {
      return null;
    }

    const payload = JSON.parse(raw) as Partial<MaterialsCachePayload>;

    if (
      !Array.isArray(payload.materials) ||
      typeof payload.savedAt !== "number" ||
      Date.now() - payload.savedAt > materialsCacheTtlMs
    ) {
      window.localStorage.removeItem(materialsCacheKey);
      return null;
    }

    return {
      materials: payload.materials,
      source: payload.source === "notion" ? "notion" : "mock"
    };
  } catch {
    return null;
  }
}

function persistCachedMaterials(state: Omit<MaterialsContextValue, "isLoading">) {
  if (typeof window === "undefined" || state.source !== "notion") {
    return;
  }

  try {
    const payload: MaterialsCachePayload = {
      ...state,
      savedAt: Date.now()
    };

    window.localStorage.setItem(materialsCacheKey, JSON.stringify(payload));
  } catch {
    // ignore storage write errors
  }
}

async function loadMaterialsOnce() {
  if (cachedMaterialsState) {
    return cachedMaterialsState;
  }

  const storedState = readCachedMaterials();

  if (storedState) {
    cachedMaterialsState = storedState;
    return storedState;
  }

  if (!materialsLoadPromise) {
    materialsLoadPromise = (async () => {
      try {
        const response = await fetch(materialsEndpoint, {
          method: "GET",
          cache: "default",
          headers: {
            Accept: "application/json"
          }
        });

        if (!response.ok) {
          throw new Error(`Materials request failed: ${response.status}`);
        }

        const payload = (await response.json()) as {
          materials?: Material[];
          source?: MaterialsSource;
        };

        cachedMaterialsState = {
          materials: Array.isArray(payload.materials) ? payload.materials : [],
          source: payload.source === "notion" ? "notion" : "mock"
        };
        persistCachedMaterials(cachedMaterialsState);
      } catch (error) {
        console.error("Failed to load Notion materials, fallback to mock data.", error);
        cachedMaterialsState = {
          materials: mockMaterials,
          source: "mock"
        };
      }

      return cachedMaterialsState;
    })();
  }

  return materialsLoadPromise;
}

export function MaterialsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<MaterialsContextValue>(() => {
    const storedState = readCachedMaterials();

    if (cachedMaterialsState) {
      return {
        ...cachedMaterialsState,
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
      materials: [],
      isLoading: true,
      source: "mock"
    };
  });

  useEffect(() => {
    let active = true;

    loadMaterialsOnce().then((nextState) => {
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

  useEffect(() => {
    if (typeof window === "undefined" || !import.meta.env.DEV || state.isLoading) {
      return;
    }

    const debugPayload = {
      source: state.source,
      count: state.materials.length,
      items: state.materials.map((material) => ({
        id: material.id,
        title: material.title
      })),
      hasNotionLesson: state.materials.some((material) => material.title === "Название урока")
    };

    window.__MATERIALS_DEBUG__ = debugPayload;
    console.info("[materials-debug]", debugPayload);
  }, [state]);

  const value = useMemo(() => state, [state]);

  return <MaterialsContext.Provider value={value}>{children}</MaterialsContext.Provider>;
}

export function useMaterials() {
  const context = useContext(MaterialsContext);

  if (!context) {
    throw new Error("useMaterials must be used inside MaterialsProvider");
  }

  return context;
}
