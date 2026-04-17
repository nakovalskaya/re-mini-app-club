import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { cloudStorage } from "@/storage/cloud-storage/cloudStorage";
import { STORAGE_KEYS } from "@/storage/user-state/keys";

type AppStateContextValue = {
  favoriteIds: string[];
  isFavorite: (materialId: string) => boolean;
  toggleFavorite: (materialId: string) => void;
  favoritesHydrated: boolean;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);
  const hasLoadedFavorites = useRef(false);

  const normalizeFavoriteIds = useCallback((value: unknown) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return [...new Set(value.filter((item): item is string => typeof item === "string"))];
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadFavorites() {
      try {
        const stored = await cloudStorage.getItem(STORAGE_KEYS.favorites);
        if (cancelled) {
          return;
        }

        if (!stored) {
          setFavoriteIds([]);
          return;
        }

        const parsed = JSON.parse(stored) as unknown;
        setFavoriteIds(normalizeFavoriteIds(parsed));
      } catch {
        if (!cancelled) {
          setFavoriteIds([]);
        }
      } finally {
        if (!cancelled) {
          hasLoadedFavorites.current = true;
          setFavoritesHydrated(true);
        }
      }
    }

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, [normalizeFavoriteIds]);

  useEffect(() => {
    if (!hasLoadedFavorites.current) {
      return;
    }

    const uniqueFavorites = [...new Set(favoriteIds)];
    const serialized = JSON.stringify(uniqueFavorites);

    void cloudStorage.setItem(STORAGE_KEYS.favorites, serialized);
  }, [favoriteIds]);

  const isFavorite = useCallback(
    (materialId: string) => favoriteIds.includes(materialId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((materialId: string) => {
    setFavoriteIds((current) =>
      current.includes(materialId)
        ? current.filter((id) => id !== materialId)
        : [...current, materialId]
    );
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesHydrated
    }),
    [favoriteIds, isFavorite, toggleFavorite, favoritesHydrated]
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
