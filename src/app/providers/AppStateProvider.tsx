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
  completedChallengeIds: string[];
  finishedChallengeIds: string[];
};

type ChallengeConfirmationDialog = {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
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
  toggleChallengeDay: (challengeId: string, dayId: string) => void;
  toggleSkipChallengeDay: (challengeId: string, dayId: string) => void;
  finishActiveChallenge: () => void;
  completeChallenge: (challengeId: string) => void;
  requestResetChallengeProgress: (challengeId: string) => void;
  getCompletedCount: (challengeId: string) => number;
  isChallengeActive: (challengeId: string) => boolean;
  isChallengeTaken: (challengeId: string) => boolean;
  isChallengeCompleted: (challengeId: string, totalDays?: number) => boolean;
  isChallengeFinishedEarly: (challengeId: string) => boolean;
  getAggregateChallengeProgress: (challengeDayCounts: Record<string, number>) => {
    completed: number;
    total: number;
  };
  resetAllChallenges: () => void;
  forceRehydrateFromStorage: () => Promise<void>;
  forceWriteUserStateToStorage: () => Promise<void>;
  challengeConfirmationDialog: ChallengeConfirmationDialog | null;
  confirmChallengeDialog: () => void;
  dismissChallengeDialog: () => void;
};

const EMPTY_USER_STATE: PersistedUserState = {
  favorites: [],
  activeChallengeId: null,
  takenChallengeIds: [],
  completedDayIdsByChallenge: {},
  skippedDayIdsByChallenge: {},
  completedChallengeIds: [],
  finishedChallengeIds: []
};

const AppStateContext = createContext<AppStateContextValue | null>(null);

declare global {
  interface Window {
    __MINI_APP_USER_STATE_DEBUG__?: {
      hydrated: boolean;
      storageMode?: "telegram" | "local" | "unavailable";
      storageReady?: boolean;
      hydrationAttempts?: number;
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

const TELEGRAM_HYDRATION_RETRY_DELAYS_MS = [0, 400, 1_200];
const FOREGROUND_REHYDRATE_COOLDOWN_MS = 1_500;

function debugUserState(update: Partial<NonNullable<Window["__MINI_APP_USER_STATE_DEBUG__"]>>) {
  if (typeof window === "undefined") {
    return;
  }

  window.__MINI_APP_USER_STATE_DEBUG__ = {
    hydrated: false,
    ...(window.__MINI_APP_USER_STATE_DEBUG__ ?? {}),
    ...update
  };

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV) {
    console.info("[mini-app-user-state]", window.__MINI_APP_USER_STATE_DEBUG__);
  }
}

function canUseLocalStorageMode() {
  return getCloudStorageMode().mode === "local";
}

function hasPersistedData(state: PersistedUserState) {
  return (
    state.favorites.length > 0 ||
    state.takenChallengeIds.length > 0 ||
    state.activeChallengeId !== null ||
    state.completedChallengeIds.length > 0 ||
    state.finishedChallengeIds.length > 0 ||
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
    skippedDayIdsByChallenge: normalizeMap(source.skippedDayIdsByChallenge),
    completedChallengeIds: normalizeIdList(source.completedChallengeIds),
    finishedChallengeIds: normalizeIdList(source.finishedChallengeIds)
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
    skippedDayIdsByChallenge: {},
    completedChallengeIds: [],
    finishedChallengeIds: []
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

async function loadUserStateFromStorageWithRetry() {
  const delays = canUseLocalStorageMode() ? [0] : TELEGRAM_HYDRATION_RETRY_DELAYS_MS;
  let lastError: unknown;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    const delay = delays[attempt];

    if (delay > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, delay));
    }

    debugUserState({
      hydrationAttempts: attempt + 1,
      storageMode: getCloudStorageMode().mode,
      storageReady: false
    });

    try {
      const result = await loadUserStateFromStorage();

      return {
        ...result,
        attempts: attempt + 1
      };
    } catch (error) {
      lastError = error;

      debugUserState({
        hydrationAttempts: attempt + 1,
        storageMode: getCloudStorageMode().mode,
        storageReady: false,
        lastReadAt: new Date().toISOString(),
        lastReadOk: false,
        lastOperation: "read",
        lastError: error instanceof Error ? error.message : String(error)
      });
    }
  }

  throw lastError;
}

async function persistUserStateToStorage(userState: PersistedUserState) {
  const serializedState = JSON.stringify(userState);
  await cloudStorage.setItem(STORAGE_KEYS.userState, serializedState);
  debugUserState({
    storageMode: getCloudStorageMode().mode,
    storageReady: true,
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
  const [challengeConfirmationDialog, setChallengeConfirmationDialog] =
    useState<ChallengeConfirmationDialog | null>(null);
  const hasLoadedState = useRef(false);
  const hasUserMutatedState = useRef(false);
  const hydrationInFlight = useRef(false);
  const storageReadyRef = useRef(canUseLocalStorageMode());
  const pendingMutationsRef = useRef<Array<(state: PersistedUserState) => PersistedUserState>>([]);
  const lastForegroundRehydrateAtRef = useRef(0);

  const hydrateFromStorage = useCallback(async () => {
    hydrationInFlight.current = true;
    storageReadyRef.current = canUseLocalStorageMode();

    try {
      const result = await loadUserStateFromStorageWithRetry();
      let nextState = result.state;
      const pendingMutations = pendingMutationsRef.current;
      
      if (pendingMutations.length > 0) {
        pendingMutations.forEach((mutate) => {
          nextState = mutate(nextState);
        });
        pendingMutationsRef.current = [];
      }

      setUserState(nextState);
      storageReadyRef.current = true;
      debugUserState({
        hydrationAttempts: result.attempts,
        storageMode: getCloudStorageMode().mode,
        storageReady: true
      });

      if (pendingMutations.length > 0) {
        await persistUserStateToStorage(nextState);
      } else if (result.source === "legacy" && hasPersistedData(result.state)) {
        await persistUserStateToStorage(result.state);
      }
    } catch (error) {
      storageReadyRef.current = canUseLocalStorageMode();
      debugUserState({
        hydrated: false,
        readSource: "empty",
        storageMode: getCloudStorageMode().mode,
        storageReady: storageReadyRef.current,
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
      debugUserState({
        hydrated: true,
        storageMode: getCloudStorageMode().mode,
        storageReady: storageReadyRef.current
      });
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
    function rehydrateOnForeground() {
      if (getCloudStorageMode().mode !== "telegram") {
        return;
      }

      if (hydrationInFlight.current) {
        return;
      }

      const now = Date.now();
      if (now - lastForegroundRehydrateAtRef.current < FOREGROUND_REHYDRATE_COOLDOWN_MS) {
        return;
      }

      lastForegroundRehydrateAtRef.current = now;
      hasUserMutatedState.current = false;
      void hydrateFromStorage();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        rehydrateOnForeground();
      }
    }

    window.addEventListener("focus", rehydrateOnForeground);
    window.addEventListener("pageshow", rehydrateOnForeground);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", rehydrateOnForeground);
      window.removeEventListener("pageshow", rehydrateOnForeground);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (
      !hasLoadedState.current ||
      !hasUserMutatedState.current ||
      hydrationInFlight.current ||
      !storageReadyRef.current
    ) {
      return;
    }

    void persistUserStateToStorage(userState).catch((error) => {
      debugUserState({
        lastPersistedRaw: JSON.stringify(userState),
        storageMode: getCloudStorageMode().mode,
        storageReady: storageReadyRef.current,
        lastWriteAt: new Date().toISOString(),
        lastWriteOk: false,
        lastOperation: "write",
        lastError: error instanceof Error ? error.message : String(error)
      });
    });
  }, [userState]);

  const canMutatePersistedState = useCallback(() => {
    if (hydrationInFlight.current) {
      return false;
    }

    if (!hasLoadedState.current) {
      return canUseLocalStorageMode();
    }

    return storageReadyRef.current;
  }, []);

  const applyUserStateMutation = useCallback(
    (mutate: (current: PersistedUserState) => PersistedUserState) => {
      hasUserMutatedState.current = true;

      setUserState((current) => {
        const next = mutate(current);

        if (!storageReadyRef.current) {
          pendingMutationsRef.current.push(mutate);
        }

        return next;
      });

      if (!canMutatePersistedState() && !hydrationInFlight.current && !canUseLocalStorageMode()) {
        void hydrateFromStorage();
      }
    },
    [canMutatePersistedState, hydrateFromStorage]
  );

  const isFavorite = useCallback(
    (materialId: string) => userState.favorites.includes(materialId),
    [userState.favorites]
  );

  const toggleFavorite = useCallback((materialId: string) => {
    applyUserStateMutation((current) => ({
      ...current,
      favorites: current.favorites.includes(materialId)
        ? current.favorites.filter((id) => id !== materialId)
        : [...current.favorites, materialId]
    }));
  }, [applyUserStateMutation]);

  const startChallenge = useCallback((challengeId: string) => {
    applyUserStateMutation((current) => {
      const isRestartingClosedChallenge =
        current.completedChallengeIds.includes(challengeId) ||
        current.finishedChallengeIds.includes(challengeId);

      const previousActiveChallengeId =
        current.activeChallengeId && current.activeChallengeId !== challengeId
          ? current.activeChallengeId
          : null;

      return {
        ...current,
        activeChallengeId: challengeId,
        takenChallengeIds: current.takenChallengeIds.includes(challengeId)
          ? current.takenChallengeIds
          : [...current.takenChallengeIds, challengeId],
        completedDayIdsByChallenge: isRestartingClosedChallenge
          ? {
              ...current.completedDayIdsByChallenge,
              [challengeId]: []
            }
          : current.completedDayIdsByChallenge,
        skippedDayIdsByChallenge: isRestartingClosedChallenge
          ? {
              ...current.skippedDayIdsByChallenge,
              [challengeId]: []
            }
          : current.skippedDayIdsByChallenge,
        completedChallengeIds: current.completedChallengeIds.filter((id) => id !== challengeId),
        finishedChallengeIds: [
          ...new Set(
            [
              ...current.finishedChallengeIds.filter((id) => id !== challengeId),
              ...(previousActiveChallengeId &&
              !current.completedChallengeIds.includes(previousActiveChallengeId)
                ? [previousActiveChallengeId]
                : [])
            ]
          )
        ]
      };
    });
  }, [applyUserStateMutation]);

  const askToRestartChallenge = useCallback(
    (challengeId: string) => {
      setChallengeConfirmationDialog({
        title: "Начать заново?",
        description: "Прогресс сбросится. Хочешь пройти заново?",
        confirmLabel: "Да",
        cancelLabel: "Отмена",
        onConfirm: () => {
          setChallengeConfirmationDialog(null);
          startChallenge(challengeId);
        }
      });
    },
    [startChallenge]
  );

  const takeChallenge = useCallback(
    (challengeId: string) => {
      const isRestartingClosedChallenge =
        userState.completedChallengeIds.includes(challengeId) ||
        userState.finishedChallengeIds.includes(challengeId);

      if (userState.activeChallengeId && userState.activeChallengeId !== challengeId) {
        setChallengeConfirmationDialog({
          title: "Можно взять только один челлендж",
          description: "Чтобы начать новый челлендж, нужно завершить текущий.",
          confirmLabel: "Ок",
          cancelLabel: "Отмена",
          onConfirm: () => {
            setChallengeConfirmationDialog(null);

            if (isRestartingClosedChallenge) {
              askToRestartChallenge(challengeId);
              return;
            }

            startChallenge(challengeId);
          }
        });
        return;
      }

      if (isRestartingClosedChallenge) {
        askToRestartChallenge(challengeId);
        return;
      }

      startChallenge(challengeId);
    },
    [askToRestartChallenge, startChallenge, userState]
  );

  const finishActiveChallenge = useCallback(() => {
    applyUserStateMutation((current) => {
      if (!current.activeChallengeId) {
        return current;
      }

      if (current.completedChallengeIds.includes(current.activeChallengeId)) {
        return {
          ...current,
          activeChallengeId: null
        };
      }

      return {
        ...current,
        activeChallengeId: null,
        finishedChallengeIds: current.finishedChallengeIds.includes(current.activeChallengeId)
          ? current.finishedChallengeIds
          : [...current.finishedChallengeIds, current.activeChallengeId]
      };
    });
  }, [applyUserStateMutation]);

  const completeChallenge = useCallback((challengeId: string) => {
    applyUserStateMutation((current) => ({
      ...current,
      activeChallengeId: current.activeChallengeId === challengeId ? null : current.activeChallengeId,
      completedChallengeIds: current.completedChallengeIds.includes(challengeId)
        ? current.completedChallengeIds
        : [...current.completedChallengeIds, challengeId],
      finishedChallengeIds: current.finishedChallengeIds.filter((id) => id !== challengeId),
      takenChallengeIds: current.takenChallengeIds.includes(challengeId)
        ? current.takenChallengeIds
        : [...current.takenChallengeIds, challengeId]
    }));
  }, [applyUserStateMutation]);

  const resetChallengeProgress = useCallback((challengeId: string) => {
    applyUserStateMutation((current) => {
      const nextCompletedDayIdsByChallenge = { ...current.completedDayIdsByChallenge };
      const nextSkippedDayIdsByChallenge = { ...current.skippedDayIdsByChallenge };

      delete nextCompletedDayIdsByChallenge[challengeId];
      delete nextSkippedDayIdsByChallenge[challengeId];

      return {
        ...current,
        activeChallengeId: current.activeChallengeId === challengeId ? null : current.activeChallengeId,
        takenChallengeIds: current.takenChallengeIds.filter((id) => id !== challengeId),
        completedDayIdsByChallenge: nextCompletedDayIdsByChallenge,
        skippedDayIdsByChallenge: nextSkippedDayIdsByChallenge,
        completedChallengeIds: current.completedChallengeIds.filter((id) => id !== challengeId),
        finishedChallengeIds: current.finishedChallengeIds.filter((id) => id !== challengeId)
      };
    });
  }, [applyUserStateMutation]);

  const requestResetChallengeProgress = useCallback((challengeId: string) => {
    setChallengeConfirmationDialog({
      title: "Сбросить прогресс?",
      description: "Все отмеченные дни и результаты будут удалены без возможности восстановления.",
      confirmLabel: "Сбросить",
      cancelLabel: "Отмена",
      onConfirm: () => {
        setChallengeConfirmationDialog(null);
        resetChallengeProgress(challengeId);
      }
    });
  }, [resetChallengeProgress]);

  const toggleChallengeDay = useCallback((challengeId: string, dayId: string) => {
    applyUserStateMutation((current) => {
      if (
        current.completedChallengeIds.includes(challengeId) ||
        current.finishedChallengeIds.includes(challengeId)
      ) {
        return current;
      }

      const completed = current.completedDayIdsByChallenge[challengeId] ?? [];
      const skipped = current.skippedDayIdsByChallenge[challengeId] ?? [];
      const isCompleted = completed.includes(dayId);

      return {
        ...current,
        takenChallengeIds: current.takenChallengeIds.includes(challengeId)
          ? current.takenChallengeIds
          : [...current.takenChallengeIds, challengeId],
        completedDayIdsByChallenge: {
          ...current.completedDayIdsByChallenge,
          [challengeId]: isCompleted
            ? completed.filter((id) => id !== dayId)
            : [...completed, dayId]
        },
        skippedDayIdsByChallenge: {
          ...current.skippedDayIdsByChallenge,
          [challengeId]: skipped.includes(dayId) && !isCompleted
            ? skipped.filter((id) => id !== dayId) // un-skip if we are completing it
            : skipped
        }
      };
    });
  }, [applyUserStateMutation]);

  const toggleSkipChallengeDay = useCallback((challengeId: string, dayId: string) => {
    applyUserStateMutation((current) => {
      if (
        current.completedChallengeIds.includes(challengeId) ||
        current.finishedChallengeIds.includes(challengeId)
      ) {
        return current;
      }

      const skipped = current.skippedDayIdsByChallenge[challengeId] ?? [];
      const completed = current.completedDayIdsByChallenge[challengeId] ?? [];
      const isSkipped = skipped.includes(dayId);

      return {
        ...current,
        takenChallengeIds: current.takenChallengeIds.includes(challengeId)
          ? current.takenChallengeIds
          : [...current.takenChallengeIds, challengeId],
        skippedDayIdsByChallenge: {
          ...current.skippedDayIdsByChallenge,
          [challengeId]: isSkipped
            ? skipped.filter((id) => id !== dayId)
            : [...skipped, dayId]
        },
        completedDayIdsByChallenge: {
          ...current.completedDayIdsByChallenge,
          [challengeId]: completed.includes(dayId) && !isSkipped
            ? completed.filter((id) => id !== dayId) // un-complete if we are skipping it
            : completed
        }
      };
    });
  }, [applyUserStateMutation]);

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
    (challengeId: string) => userState.completedChallengeIds.includes(challengeId),
    [userState.completedChallengeIds]
  );

  const isChallengeFinishedEarly = useCallback(
    (challengeId: string) => userState.finishedChallengeIds.includes(challengeId),
    [userState.finishedChallengeIds]
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

  const resetAllChallenges = useCallback(() => {
    applyUserStateMutation((current) => ({
      ...current,
      activeChallengeId: null,
      takenChallengeIds: [],
      completedDayIdsByChallenge: {},
      skippedDayIdsByChallenge: {},
      completedChallengeIds: [],
      finishedChallengeIds: []
    }));
  }, [applyUserStateMutation]);

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
      toggleChallengeDay,
      toggleSkipChallengeDay,
      finishActiveChallenge,
      completeChallenge,
      requestResetChallengeProgress,
      resetAllChallenges,
      getCompletedCount,
      isChallengeActive,
      isChallengeTaken,
      isChallengeCompleted,
      isChallengeFinishedEarly,
      getAggregateChallengeProgress,
      forceRehydrateFromStorage: async () => {
        hasUserMutatedState.current = false;
        storageReadyRef.current = canUseLocalStorageMode();
        setHydrated(false);
        await hydrateFromStorage();
      },
      forceWriteUserStateToStorage: async () => {
        await persistUserStateToStorage(userState);
      },
      challengeConfirmationDialog,
      confirmChallengeDialog: () => {
        challengeConfirmationDialog?.onConfirm();
      },
      dismissChallengeDialog: () => {
        setChallengeConfirmationDialog(null);
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
      toggleChallengeDay,
      toggleSkipChallengeDay,
      finishActiveChallenge,
      completeChallenge,
      requestResetChallengeProgress,
      resetAllChallenges,
      getCompletedCount,
      isChallengeActive,
      isChallengeTaken,
      isChallengeCompleted,
      isChallengeFinishedEarly,
      getAggregateChallengeProgress,
      hydrateFromStorage,
      challengeConfirmationDialog
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
