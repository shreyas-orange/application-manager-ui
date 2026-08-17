const ACCESS_TOKEN_KEY = "application_manager_access_token";
const REFRESH_TOKEN_KEY = "application_manager_refresh_token";

/**
 * "Remember me" decides *where* a token is persisted, not which key holds it:
 * remembered tokens go in localStorage (survive a browser restart), session
 * tokens go in sessionStorage (cleared when the tab/browser closes). Reads
 * always check both so callers never need to know which mode was used.
 */
function readFromEither(key: string): string | null {
  return sessionStorage.getItem(key) ?? localStorage.getItem(key);
}

function writeTo(key: string, value: string, remember: boolean): void {
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  target.setItem(key, value);
  other.removeItem(key);
}

function isRemembered(): boolean {
  return Boolean(
    localStorage.getItem(ACCESS_TOKEN_KEY) ||
    localStorage.getItem(REFRESH_TOKEN_KEY),
  );
}

export const tokenService = {
  getAccessToken(): string | null {
    return readFromEither(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return readFromEither(REFRESH_TOKEN_KEY);
  },

  setTokens(
    accessToken: string,
    refreshToken?: string,
    options?: { remember?: boolean },
  ): void {
    // Login supplies an explicit preference. Token refresh does not, so keep
    // using the storage selected at login instead of falling back to session.
    const remember = options?.remember ?? isRemembered();

    writeTo(ACCESS_TOKEN_KEY, accessToken, remember);

    if (refreshToken) {
      writeTo(REFRESH_TOKEN_KEY, refreshToken, remember);
    } else if (options?.remember !== undefined) {
      // A fresh login without a refresh token must not reuse one left by a
      // previous account or persistence mode.
      sessionStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  },

  isRemembered(): boolean {
    return isRemembered();
  },

  clearTokens(): void {
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  hasAccessToken(): boolean {
    return Boolean(readFromEither(ACCESS_TOKEN_KEY));
  },
};
