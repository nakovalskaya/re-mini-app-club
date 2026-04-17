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
  activeChallengeId: string | null;
  challengeProgress: Record<string, string[]>;
  challengesHydrated: boolean;
  takeChallenge: (challengeId: string) => void;
  completeChallengeDay: (challengeId: string, dayId: string) => void;
  getCompletedCount: (challengeId: string) => number;
  isChallengeActive: (challengeId: string) => boolean;
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoritesHydrated, setFavoritesHydrated] = useState(false);
  const [activeChallengeId, setActiveChallengeId] = useState<string | null>(null);
  const [challengeProgress, setChallengeProgress] = useState<Record<string, string[]>>(
    {}
  );
  const [challengesHydrated, setChallengesHydrated] = useState(false);
  const hasLoadedFavorites = useRef(false);
  const hasLoadedChallenges = useRef(false);

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
    let cancelled = false;

    async function loadChallenges() {
      try {
        const [storedActive, storedProgress] = await Promise.all([
          cloudStorage.getItem(STORAGE_KEYS.challengeActive),
          cloudStorage.getItem(STORAGE_KEYS.challengeProgress)
        ]);

        if (cancelled) {
          return;
        }

        setActiveChallengeId(storedActive || null);

        if (!storedProgress) {
          setChallengeProgress({});
          return;
        }

        const parsed = JSON.parse(storedProgress) as Record<string, unknown>;
        const normalized = Object.entries(parsed ?? {}).reduce<Record<string, string[]>>(
          (acc, [challengeId, value]) => {
            acc[challengeId] = normalizeFavoriteIds(value);
            return acc;
          },
          {}
        );

        setChallengeProgress(normalized);
      } catch {
        if (!cancelled) {
          setActiveChallengeId(null);
          setChallengeProgress({});
        }
      } finally {
        if (!cancelled) {
          hasLoadedChallenges.current = true;
          setChallengesHydrated(true);
        }
      }
    }

    void loadChallenges();

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

  useEffect(() => {
    if (!hasLoadedChallenges.current) {
      return;
    }

    const saveChallenges = async () => {
      if (activeChallengeId) {
        await cloudStorage.setItem(STORAGE_KEYS.challengeActive, activeChallengeId);
      } else {
        await cloudStorage.removeItem(STORAGE_KEYS.challengeActive);
      }
    };

    void saveChallenges();
  }, [activeChallengeId]);

  useEffect(() => {
    if (!hasLoadedChallenges.current) {
      return;
    }

    const normalizedProgress = Object.entries(challengeProgress).reduce<
      Record<string, string[]>
    >((acc, [challengeId, dayIds]) => {
      acc[challengeId] = [...new Set(dayIds)];
      return acc;
    }, {});

    void cloudStorage.setItem(
      STORAGE_KEYS.challengeProgress,
      JSON.stringify(normalizedProgress)
    );
  }, [challengeProgress]);

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

  const takeChallenge = useCallback(
    (challengeId: string) => {
      const shouldSwitch =
        activeChallengeId &&
        activeChallengeId !== challengeId &&
        window.confirm(
          "У тебя уже есть активный челлендж. Переключиться? Прогресс по текущему сохранится."
        );

      if (activeChallengeId && activeChallengeId !== challengeId && !shouldSwitch) {
        return;
      }

      setActiveChallengeId(challengeId);
      setChallengeProgress((current) => ({
        ...current,
        [challengeId]: current[challengeId] ?? []
      }));
    },
    [activeChallengeId]
  );

  const completeChallengeDay = useCallback((challengeId: string, dayId: string) => {
    setChallengeProgress((current) => {
      const completed = current[challengeId] ?? [];
      if (completed.includes(dayId)) {
        return current;
      }

      return {
        ...current,
        [challengeId]: [...completed, dayId]
      };
    });
  }, []);

  const getCompletedCount = useCallback(
    (challengeId: string) => challengeProgress[challengeId]?.length ?? 0,
    [challengeProgress]
  );

  const isChallengeActive = useCallback(
    (challengeId: string) => activeChallengeId === challengeId,
    [activeChallengeId]
  );

  const value = useMemo(
    () => ({
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesHydrated,
      activeChallengeId,
      challengeProgress,
      challengesHydrated,
      takeChallenge,
      completeChallengeDay,
      getCompletedCount,
      isChallengeActive
    }),
    [
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesHydrated,
      activeChallengeId,
      challengeProgress,
      challengesHydrated,
      takeChallenge,
      completeChallengeDay,
      getCompletedCount,
      isChallengeActive
    ]
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
