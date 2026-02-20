import { syncUserProfileFromToken } from "./userProfile";

type BypassProfile = {
  name: string;
  email: string;
  sub: string;
};

const DEFAULT_PROFILE: BypassProfile = {
  name: "admin",
  email: "admin@gearfirst.local",
  sub: "1001",
};

export const AUTH_BYPASS = import.meta.env.VITE_AUTH_BYPASS === "true";

function encodeBase64Url(value: string): string {
  const toBase64 = () => {
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      return window.btoa(unescape(encodeURIComponent(value)));
    }

    const globalBuffer = (globalThis as Record<string, unknown>).Buffer as
      | undefined
      | {
          from(
            data: string,
            encoding?: string,
          ): {
            toString(encoding: string): string;
          };
        };

    if (globalBuffer) {
      return globalBuffer.from(value, "utf8").toString("base64");
    }

    return "";
  };

  return toBase64().replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function createBypassAccessToken(profile: BypassProfile): string {
  const header = encodeBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = encodeBase64Url(
    JSON.stringify({
      sub: profile.sub,
      name: profile.name,
      email: profile.email,
      preferred_username: profile.email,
      orgType: "본사",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8,
    }),
  );

  return `${header}.${payload}.bypass-signature`;
}

export function ensureBypassAuth(profile: Partial<BypassProfile> = {}): string {
  const resolved: BypassProfile = {
    ...DEFAULT_PROFILE,
    ...profile,
  };

  const token = createBypassAccessToken(resolved);
  sessionStorage.setItem("access_token", token);
  localStorage.setItem("refresh_token", "bypass-refresh-token");
  syncUserProfileFromToken(token, {
    name: resolved.name,
    email: resolved.email,
  });

  return token;
}
