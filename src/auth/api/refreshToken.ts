import type { TokenResponse } from "../types/auth";
import { syncUserProfileFromToken } from "../utils/userProfile";
import { AUTH_BYPASS, ensureBypassAuth } from "../utils/bypassAuth";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER;
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "gearfirst-client";

export async function refreshAccessToken(): Promise<string | null> {
  if (AUTH_BYPASS) {
    return ensureBypassAuth();
  }

  if (!AUTH_SERVER) {
    window.location.href = "/login";
    return null;
  }

  const refreshToken = localStorage.getItem("refresh_token");
  if (!refreshToken) {
    alert("로그인이 필요합니다.");
    window.location.href = "/login";
    return null;
  }

  const res = await fetch(`${AUTH_SERVER}/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: CLIENT_ID,
    }),
  });

  if (!res.ok) {
    alert("토큰 갱신 실패. 다시 로그인해주세요.");
    window.location.href = "/login";
    return null;
  }

  const data = (await res.json()) as TokenResponse;

  if (data.access_token) {
    sessionStorage.setItem("access_token", data.access_token);
    syncUserProfileFromToken(data.access_token);
  }
  if (data.refresh_token) {
    localStorage.setItem("refresh_token", data.refresh_token);
  }

  return data.access_token ?? null;
}
