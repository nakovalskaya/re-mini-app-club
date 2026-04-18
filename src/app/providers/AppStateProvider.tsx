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
import { cloudStorage, getCloudStorageMode } from "@/storage/cloud-storage/cloudStorage";
import { STORAGE_KEYS } from "@/storage/user-state/keys";

type PersistedUserState = {
  favorites: string[];
  activeChallengeId: string | null;
  takenChallengeIds: string[];
  completedDayIdsByChallenge: Record<string, string[]>;
  skippedDayIdsByChallenge: Record<string, string[]>;
};

type AppStateContextValue = {
  userState: PersistedUserState;
  favoriteIds: string[];
  favoritesHydrated: boolean;
  activeChallengeId: string | null;
  takenChallengeIds: string[];
  completedDayIdsByChallenge: Record<string, string[]>;
  skippedDayIdsByChallenge: Record<string, string[]>;
  challengesHydrated: boolean;
  isFavorite: (materialId: string) => boolean;
  toggleFavorite: (materialId: string) => void;
  takeChallenge: (challengeId: string) => void;
  completeChallengeDay: (challengeId: string, dayId: string) => void;
  getCompletedCount: (challengeId: string) => number;
  isChallengeActive: (challengeId: string) => boolean;
  isChallengeTaken: (challengeId: string) => boolean;
  isChallengeCompleted: (challengeId: string, totalDays: number) => boolean;
  getAggregateChallengeProgress: (challengeDayCounts: Record<string, number>) => {
    completed: number;
    total: number;
  };
  forceRehydrateFromStorage: () => Promise<void>;
  forceWriteUserStateToStorage: () => Promise<void>;
};

const EMPTY_USER_STATE: PersistedUserState = {
  favorites: [],
  activeChallengeId: null,
  takenChallengeIds: [],
  completedDayIdsByChallenge: {},
  skippedDayIdsByChallenge: {}
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

declare global {
  interface Window {
    __MINI_APP_USER_STATE_DEBUG__?: {
      hydrated: boolean;
      readSource?: "user_state:v2" | "legacy" | "empty";
      lastReadRaw?: string | null;
      lastPersistedRaw?: string;
      lastReadAt?: string;
      lastWriteAt?: string;
      lastReadOk?: boolean;
      lastWriteOk?: boolean;
      lastOperation?: "read" | "write";
      lastError?: string;
      lastHydratedState?: PersistedUserState;
    };
  }
}

function debugUserState(update: Partial<NonNullable<Window["__MINI_APP_USER_STATE_DEBUG__"]>>) {
  if (
    typeof window === "undefined" ||
    !(typeof import.meta !== "undefined" && import.meta.env?.DEV)
  ) {
    return;
  }

  window.__MINI_APP_USER_STATE_DEBUG__ = {
    hydrated: false,
    ...(window.__MINI_APP_USER_STATE_DEBUG__ ?? {}),
    ...update
  };

  console.info("[mini-app-user-state]", window.__MINI_APP_USER_STATE_DEBUG__);
}

function canMutateBeforeHydration() {
  return getCloudStorageMode().mode !== "telegram";
}

function hasPersistedData(state: PersistedUserState) {
  return (
    state.favorites.length > 0 ||
    state.takenChallengeIds.length > 0 ||
    state.activeChallengeId !== null ||
    Object.keys(state.completedDayIdsByChallenge).length > 0 ||
    Object.keys(state.skippedDayIdsByChallenge).length > 0
  );
}

function normalizeIdList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function normalizeMap(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string[]>>(
    (acc, [key, entry]) => {
      acc[key] = normalizeIdList(entry);
      return acc;
    },
    {}
  );
}

function normalizeUserState(value: unknown): PersistedUserState {
  if (!value || typeof value !== "object") {
    return EMPTY_USER_STATE;
  }

  const source = value as Partial<PersistedUserState>;

  return {
    favorites: normalizeIdList(source.favorites),
    activeChallengeId:
      typeof source.activeChallengeId === "string" ? source.activeChallengeId : null,
    takenChallengeIds: normalizeIdList(source.takenChallengeIds),
    completedDayIdsByChallenge: normalizeMap(source.completedDayIdsByChallenge),
    skippedDayIdsByChallenge: normalizeMap(source.skippedDayIdsByChallenge)
  };
}

async function loadLegacyState(): Promise<PersistedUserState> {
  const [favoritesRaw, activeChallengeRaw, challengeProgressRaw] = await Promise.all([
    cloudStorage.getItem(STORAGE_KEYS.favorites),
    cloudStorage.getItem(STORAGE_KEYS.challengeActive),
    cloudStorage.getItem(STORAGE_KEYS.challengeProgress)
  ]);

  const favorites = favoritesRaw ? normalizeIdList(JSON.parse(favoritesRaw)) : [];
  const activeChallengeId = activeChallengeRaw || null;
  const completedDayIdsByChallenge = challengeProgressRaw
    ? normalizeMap(JSON.parse(challengeProgressRaw))
    : {};
  const takenChallengeIds = [
    ...new Set([
      ...Object.keys(completedDayIdsByChallenge),
      ...(activeChallengeId ? [activeChallengeId] : [])
    ])
  ];

  return {
    favorites,
    activeChallengeId,
    takenChallengeIds,
    completedDayIdsByChallenge,
    skippedDayIdsByChallenge: {}
  };
}

async function loadUserStateFromStorage() {
  const persisted = await cloudStorage.getItem(STORAGE_KEYS.userState);

  if (persisted) {
    try {
      const normalized = normalizeUserState(JSON.parse(persisted));
      debugUserState({
        hydrated: false,
        readSource: "user_state:v2",
        lastReadRaw: persisted,
        lastHydratedState: normalized,
        lastReadAt: new Date().toISOString(),
        lastReadOk: true,
        lastOperation: "read",
        lastError: undefined
      });

      return {
        state: normalized,
        source: "user_state:v2" as const,
        raw: persisted
      };
    } catch {
      const legacyState = await loadLegacyState();
      debugUserState({
        hydrated: false,
        readSource: "legacy",
        lastReadRaw: persisted,
        lastHydratedState: legacyState,
        lastReadAt: new Date().toISOString(),
        lastReadOk: true,
        lastOperation: "read",
        lastError: undefined
      });

      return {
        state: legacyState,
        source: "legacy" as const,
        raw: persisted
      };
    }
  }

  const legacyState = await loadLegacyState();
  const source = hasPersistedData(legacyState) ? ("legacy" as const) : ("empty" as const);

  debugUserState({
    hydrated: false,
    readSource: source,
    lastReadRaw: persisted,
    lastHydratedState: legacyState,
    lastReadAt: new Date().toISOString(),
    lastReadOk: true,
    lastOperation: "read",
    lastError: undefined
  });

  return {
    state: legacyState,
    source,
    raw: persisted
  };
}

async function persistUserStateToStorage(userState: PersistedUserState) {
  const serializedState = JSON.stringify(userState);
  await cloudStorage.setItem(STORAGE_KEYS.userState, serializedState);
  debugUserState({
    lastPersistedRaw: serializedState,
    lastWriteAt: new Date().toISOString(),
    lastWriteOk: true,
    lastOperation: "write",
    lastError: undefined
  });
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [userState, setUserState] = useState<PersistedUserState>(EMPTY_USER_STATE);
  const [hydrated, setHydrated] = useState(false);
  const hasLoadedState = useRef(false);
  const hasUserMutatedState = useRef(false);
  const hydrationInFlight = useRef(false);

  const hydrateFromStorage = useCallback(async () => {
    hydrationInFlight.current = true;

    try {
      const result = await loadUserStateFromStorage();
      setUserState(result.state);

      if (result.source === "legacy" && hasPersistedData(result.state)) {
        await persistUserStateToStorage(result.state);
      }
    } catch (error) {
      setUserState(EMPTY_USER_STATE);
      debugUserState({
        hydrated: false,
        readSource: "empty",
        lastReadAt: new Date().toISOString(),
        lastReadOk: false,
        lastOperation: "read",
        lastError: error instanceof Error ? error.message : String(error),
        lastHydratedState: EMPTY_USER_STATE
      });
    } finally {
      hydrationInFlight.current = false;
      hasLoadedState.current = true;
      setHydrated(true);
      debugUserState({ hydrated: true });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadState() {
      await hydrateFromStorage();

      if (cancelled) {
        return;
      }
    }

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (
      !hasLoadedState.current ||
      !hasUserMutatedState.current ||
      hydrationInFlight.current
    ) {
      return;
    }

    void persistUserStateToStorage(userState).catch((error) => {
      debugUserState({
        lastPersistedRaw: JSON.stringify(userState),
        lastWriteAt: new Date().toISOString(),
        lastWriteOk: false,
        lastOperation: "write",
        lastError: error instanceof Error ? error.message : String(error)
      });
    });
  }, [userState]);

  const isFavorite = useCallback(
    (materialId: string) => userState.favorites.includes(materialId),
    [userState.favorites]
  );

  const toggleFavorite = useCallback((materialId: string) => {
    if (
      (!hasLoadedState.current || hydrationInFlight.current) &&
      !canMutateBeforeHydration()
    ) {
      return;
    }

    hasUserMutatedState.current = true;
    setUserState((current) => ({
      ...current,
      favorites: current.favorites.includes(materialId)
        ? current.favorites.filter((id) => id !== materialId)
        : [...current.favorites, materialId]
    }));
  }, []);

  const takeChallenge = useCallback((challengeId: string) => {
    if (
      (!hasLoadedState.current || hydrationInFlight.current) &&
      !canMutateBeforeHydration()
    ) {
      return;
    }

    hasUserMutatedState.current = true;
    setUserState((current) => {
      const shouldSwitch =
        current.activeChallengeId &&
        current.activeChallengeId !== challengeId &&
        window.confirm(
          "У тебя уже есть активный челлендж. Переключиться? Прогресс по текущему сохранится."
        );

      if (
        current.activeChallengeId &&
        current.activeChallengeId !== challengeId &&
        !shouldSwitch
      ) {
        return current;
      }

      return {
        ...current,
        activeChallengeId: challengeId,
        takenChallengeIds: current.takenChallengeIds.includes(challengeId)
          ? current.takenChallengeIds
          : [...current.takenChallengeIds, challengeId],
        completedDayIdsByChallenge: {
          ...current.completedDayIdsByChallenge,
          [challengeId]: current.completedDayIdsByChallenge[challengeId] ?? []
        },
        skippedDayIdsByChallenge: {
          ...current.skippedDayIdsByChallenge,
          [challengeId]: current.skippedDayIdsByChallenge[challengeId] ?? []
        }
      };
    });
  }, []);

  const completeChallengeDay = useCallback((challengeId: string, dayId: string) => {
    if (
      (!hasLoadedState.current || hydrationInFlight.current) &&
      !canMutateBeforeHydration()
    ) {
      return;
    }

    hasUserMutatedState.current = true;
    setUserState((current) => {
      const completed = current.completedDayIdsByChallenge[challengeId] ?? [];
      if (completed.includes(dayId)) {
        return current;
      }

      return {
        ...current,
        takenChallengeIds: current.takenChallengeIds.includes(challengeId)
          ? current.takenChallengeIds
          : [...current.takenChallengeIds, challengeId],
        completedDayIdsByChallenge: {
          ...current.completedDayIdsByChallenge,
          [challengeId]: [...completed, dayId]
        }
      };
    });
  }, []);

  const getCompletedCount = useCallback(
    (challengeId: string) =>
      userState.completedDayIdsByChallenge[challengeId]?.length ?? 0,
    [userState.completedDayIdsByChallenge]
  );

  const isChallengeActive = useCallback(
    (challengeId: string) => userState.activeChallengeId === challengeId,
    [userState.activeChallengeId]
  );

  const isChallengeTaken = useCallback(
    (challengeId: string) => userState.takenChallengeIds.includes(challengeId),
    [userState.takenChallengeIds]
  );

  const isChallengeCompleted = useCallback(
    (challengeId: string, totalDays: number) =>
      (userState.completedDayIdsByChallenge[challengeId]?.length ?? 0) >= totalDays,
    [userState.completedDayIdsByChallenge]
  );

  const getAggregateChallengeProgress = useCallback(
    (challengeDayCounts: Record<string, number>) => {
      return userState.takenChallengeIds.reduce(
        (acc, challengeId) => {
          acc.completed += userState.completedDayIdsByChallenge[challengeId]?.length ?? 0;
          acc.total += challengeDayCounts[challengeId] ?? 0;
          return acc;
        },
        { completed: 0, total: 0 }
      );
    },
    [userState.completedDayIdsByChallenge, userState.takenChallengeIds]
  );

  const value = useMemo(
    () => ({
      userState,
      favoriteIds: userState.favorites,
      favoritesHydrated: hydrated,
      activeChallengeId: userState.activeChallengeId,
      takenChallengeIds: userState.takenChallengeIds,
      completedDayIdsByChallenge: userState.completedDayIdsByChallenge,
      skippedDayIdsByChallenge: userState.skippedDayIdsByChallenge,
      challengesHydrated: hydrated,
      isFavorite,
      toggleFavorite,
      takeChallenge,
      completeChallengeDay,
      getCompletedCount,
      isChallengeActive,
      isChallengeTaken,
      isChallengeCompleted,
      getAggregateChallengeProgress,
      forceRehydrateFromStorage: async () => {
        hasUserMutatedState.current = false;
        setHydrated(false);
        await hydrateFromStorage();
      },
      forceWriteUserStateToStorage: async () => {
        await persistUserStateToStorage(userState);
      }
    }),
    [
      userState,
      userState.favorites,
      userState.activeChallengeId,
      userState.takenChallengeIds,
      userState.completedDayIdsByChallenge,
      userState.skippedDayIdsByChallenge,
      hydrated,
      isFavorite,
      toggleFavorite,
      takeChallenge,
      completeChallengeDay,
      getCompletedCount,
      isChallengeActive,
      isChallengeTaken,
      isChallengeCompleted,
      getAggregateChallengeProgress,
      hydrateFromStorage
    ]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error("useAppState must be used inside AppStateProvider");
  }

  return context;
}
