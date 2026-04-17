import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

const FAVORITES_KEY = "club-mini-app:favorites:v1";

type AppStateContextValue = {
  favoriteIds: string[];
  isFavorite: (materialId: string) => boolean;
  toggleFavorite: (materialId: string) => void;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem(FAVORITES_KEY);
    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as string[];
      setFavoriteIds(Array.isArray(parsed) ? parsed : []);
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds));
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
      toggleFavorite
    }),
    [favoriteIds, isFavorite, toggleFavorite]
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
