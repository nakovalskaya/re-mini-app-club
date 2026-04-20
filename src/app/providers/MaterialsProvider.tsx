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

const MaterialsContext = createContext<MaterialsContextValue | null>(null);

let cachedMaterialsState: Omit<MaterialsContextValue, "isLoading"> | null = null;
let materialsLoadPromise: Promise<Omit<MaterialsContextValue, "isLoading">> | null = null;

async function loadMaterialsOnce() {
  if (cachedMaterialsState) {
    return cachedMaterialsState;
  }

  if (!materialsLoadPromise) {
    materialsLoadPromise = (async () => {
      try {
        const response = await fetch("/api/notion-materials", {
          method: "GET",
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
  const [state, setState] = useState<MaterialsContextValue>(() =>
    cachedMaterialsState
      ? {
          ...cachedMaterialsState,
          isLoading: false
        }
      : {
          materials: [],
          isLoading: true,
          source: "mock"
        }
  );

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
