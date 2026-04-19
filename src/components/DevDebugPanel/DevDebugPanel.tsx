import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/Button/Button";
import { useAppState } from "@/app/providers/AppStateProvider";
import { getTelegramRuntimeInfo } from "@/features/telegram/telegram";
import {
  cloudStorage,
  getCloudStorageDebugState,
  getCloudStorageMode,
  resetLocalFallbackStorage
} from "@/storage/cloud-storage/cloudStorage";
import { STORAGE_KEYS } from "@/storage/user-state/keys";

type UserStateDebugSnapshot = NonNullable<Window["__MINI_APP_USER_STATE_DEBUG__"]> | null;

const LOCAL_RESET_KEYS = [
  STORAGE_KEYS.userState,
  STORAGE_KEYS.favorites,
  STORAGE_KEYS.challengeActive,
  STORAGE_KEYS.challengeProgress,
  STORAGE_KEYS.userMeta
];

function formatStorageMode(mode: ReturnType<typeof getCloudStorageMode>["mode"]) {
  if (mode === "unavailable") {
    return "none";
  }

  return mode;
}

function formatTimestamp(value?: string) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString("ru-RU");
}

function formatResultStatus(value?: boolean) {
  if (value === true) {
    return "success";
  }

  if (value === false) {
    return "error";
  }

  return "—";
}

export function DevDebugPanel() {
  const { userState, forceRehydrateFromStorage, forceWriteUserStateToStorage } = useAppState();
  const [expanded, setExpanded] = useState(false);
  const [storageDebug, setStorageDebug] = useState(() => getCloudStorageDebugState());
  const [userStateDebug, setUserStateDebug] = useState<UserStateDebugSnapshot>(
    () => window.__MINI_APP_USER_STATE_DEBUG__ ?? null
  );
  const [manualReadResult, setManualReadResult] = useState<string>("—");
  const [runtime, setRuntime] = useState(() => getTelegramRuntimeInfo());
  const storageMode = getCloudStorageMode();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRuntime(getTelegramRuntimeInfo());
      setStorageDebug(getCloudStorageDebugState());
      setUserStateDebug(window.__MINI_APP_USER_STATE_DEBUG__ ?? null);
    }, 400);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <aside className="pointer-events-none fixed inset-x-3 bottom-[88px] z-50 mx-auto max-w-md">
      <div className="frost-panel-strong pointer-events-auto surface-card-elevated overflow-hidden border-border-medium backdrop-blur">
        <button
          type="button"
          onClick={() => setExpanded((current) => !current)}
          className="pressable flex w-full items-center justify-between px-4 py-3 text-left"
        >
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-text-secondary">
              storage debug
            </p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              Storage: {formatStorageMode(storageMode.mode)}
            </p>
          </div>
          <span className="text-sm font-semibold text-accent-deep">
            {expanded ? "Скрыть" : "Открыть"}
          </span>
        </button>

        {expanded ? (
          <div className="max-h-[min(58vh,28rem)] space-y-4 overflow-y-auto border-t border-border-soft px-4 py-4 text-sm text-text-primary">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-bg-soft p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  Telegram version
                </p>
                <p className="mt-1 font-semibold">{runtime.version ?? "—"}</p>
              </div>
              <div className="rounded-[18px] bg-bg-soft p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  platform
                </p>
                <p className="mt-1 font-semibold">{runtime.platform ?? "—"}</p>
              </div>
              <div className="rounded-[18px] bg-bg-soft p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  WebApp
                </p>
                <p className="mt-1 font-semibold">{runtime.isAvailable ? "yes" : "no"}</p>
              </div>
              <div className="rounded-[18px] bg-bg-soft p-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  CloudStorage
                </p>
                <p className="mt-1 font-semibold">
                  {runtime.hasCloudStorage ? "available" : "unavailable"}
                </p>
              </div>
            </div>

            <div className="grid gap-2 rounded-[20px] bg-bg-soft p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Active storage</span>
                <strong>{formatStorageMode(storageMode.mode)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Last read</span>
                <strong>{formatTimestamp(userStateDebug?.lastReadAt)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Last write</span>
                <strong>{formatTimestamp(userStateDebug?.lastWriteAt)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Last read result</span>
                <strong>{formatResultStatus(userStateDebug?.lastReadOk)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Last write result</span>
                <strong>{formatResultStatus(userStateDebug?.lastWriteOk)}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Storage ready</span>
                <strong>
                  {typeof userStateDebug?.storageReady === "boolean"
                    ? userStateDebug.storageReady
                      ? "yes"
                      : "no"
                    : "—"}
                </strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Hydration attempts</span>
                <strong>{userStateDebug?.hydrationAttempts ?? "—"}</strong>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-text-secondary">Last source</span>
                <strong>{userStateDebug?.readSource ?? "—"}</strong>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-text-secondary">Last error</span>
                <strong className="max-w-[55%] break-words text-right">
                  {userStateDebug?.lastError ?? storageDebug?.lastError ?? "—"}
                </strong>
              </div>
            </div>

            <div className="grid gap-2">
              <Button
                variant="secondary"
                className="min-h-11 text-sm"
                onClick={async () => {
                  try {
                    const result = await cloudStorage.getItem(STORAGE_KEYS.userState);
                    setManualReadResult(result ?? "null");
                  } catch (error) {
                    setManualReadResult(
                      `ERROR: ${error instanceof Error ? error.message : String(error)}`
                    );
                  }
                }}
              >
                Read user_state from storage
              </Button>
              <Button
                variant="secondary"
                className="min-h-11 text-sm"
                onClick={async () => {
                  try {
                    await forceWriteUserStateToStorage();
                  } catch {
                    // debug state will show the error
                  }
                }}
              >
                Write current user_state to storage
              </Button>
              <Button
                variant="secondary"
                className="min-h-11 text-sm"
                onClick={async () => {
                  await resetLocalFallbackStorage(LOCAL_RESET_KEYS);
                  setManualReadResult("local fallback cleared");
                }}
              >
                Reset local fallback
              </Button>
              <Button
                variant="primary"
                className="min-h-11 text-sm"
                onClick={async () => {
                  await forceRehydrateFromStorage();
                }}
              >
                Force rehydrate from storage
              </Button>
            </div>

            <div className="grid gap-2 rounded-[20px] bg-bg-soft p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                Manual read result
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-text-primary">
                {manualReadResult}
              </pre>
            </div>

            <div className="grid gap-2 rounded-[20px] bg-bg-soft p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                Current user_state:v2
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-text-primary">
                {JSON.stringify(userState, null, 2)}
              </pre>
            </div>

            <div className="grid gap-2 rounded-[20px] bg-bg-soft p-4">
              <p className="text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                Last hydrated payload
              </p>
              <pre className="overflow-x-auto whitespace-pre-wrap break-words text-xs leading-5 text-text-primary">
                {userStateDebug?.lastReadRaw ?? "—"}
              </pre>
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
