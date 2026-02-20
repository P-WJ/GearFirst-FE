import React, { useEffect, useMemo, useState, type JSX, useRef } from "react";
import { useNavigate } from "react-router-dom";
import type { TokenResponse } from "../types/auth";
import { syncUserProfileFromToken } from "../utils/userProfile";
import { resolveRedirectUri } from "../utils/redirectUri";
import { AUTH_BYPASS, ensureBypassAuth } from "../utils/bypassAuth";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER ?? "";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "gearfirst-client";
const REDIRECT_URI = resolveRedirectUri(import.meta.env.VITE_REDIRECT_URI);

type Status = "loading" | "success" | "error";

function AuthCallback(): JSX.Element {
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("로그인 처리 중입니다...");
  const [detail, setDetail] = useState(
    "계정 정보를 확인하고 있습니다. 잠시만 기다려주세요.",
  );
  const navigate = useNavigate();
  const redirectTimeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    const handleAuth = async (): Promise<void> => {
      if (AUTH_BYPASS) {
        ensureBypassAuth();
        if (cancelled) return;
        setStatus("success");
        setMessage("개발용 로그인 우회");
        setDetail("인증 서버 없이 대시보드로 이동합니다...");
        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 300);
        return;
      }

      if (!AUTH_SERVER) {
        setStatus("error");
        setMessage("인증 서버 설정이 필요합니다.");
        setDetail("VITE_AUTH_SERVER 환경변수를 확인해주세요.");
        return;
      }

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const returnedState = params.get("state");
        const savedState = sessionStorage.getItem("oauth_state");
        const verifier = sessionStorage.getItem("pkce_verifier");

        sessionStorage.removeItem("oauth_state");
        sessionStorage.removeItem("pkce_verifier");

        if (!returnedState || returnedState !== savedState) {
          setStatus("error");
          setMessage("보안 검증에 실패했습니다.");
          setDetail("로그인 페이지에서 다시 시도해주세요.");
          return;
        }

        if (!code || !verifier) {
          setStatus("error");
          setMessage("인증 코드가 유효하지 않습니다.");
          setDetail("브라우저를 새로고침 후 다시 시도해주세요.");
          return;
        }

        setMessage("토큰을 발급받고 있습니다...");

        const body = new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
          client_id: CLIENT_ID,
        });

        const res = await fetch(`${AUTH_SERVER}/oauth2/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body,
        });

        if (!res.ok) {
          const text = await res.text();
          setStatus("error");
          setMessage("로그인에 실패했습니다.");
          setDetail(`${res.status} ${text}`);
          return;
        }

        const data = (await res.json()) as TokenResponse;

        if (!data.access_token) {
          setStatus("error");
          setMessage("로그인에 실패했습니다.");
          setDetail("access_token이 응답에 없습니다.");
          return;
        }

        sessionStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        syncUserProfileFromToken(data.access_token);

        if (cancelled) return;

        setStatus("success");
        setMessage("로그인 성공");
        setDetail("대시보드로 이동합니다...");

        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate("/dashboard", { replace: true });
        }, 700);
      } catch {
        if (!cancelled) {
          setStatus("error");
          setMessage("로그인 처리 중 오류가 발생했습니다.");
          setDetail("네트워크 상태를 확인하고 다시 시도해주세요.");
        }
      }
    };

    void handleAuth();

    return () => {
      cancelled = true;
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [navigate]);

  const spinnerStyles = useMemo(
    () => ({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "3px solid rgba(37,99,235,0.2)",
      borderTopColor: "#2563eb",
      animation: "gearfirst-login-spin 0.85s linear infinite",
      margin: "0 auto 20px",
    }),
    [],
  );

  const successStyles = useMemo(
    () => ({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      margin: "0 auto 20px",
      background: "rgba(34,197,94,0.15)",
      color: "#16a34a",
      display: "grid",
      placeItems: "center",
      fontSize: "22px",
      border: "2px solid rgba(34,197,94,0.3)",
    }),
    [],
  );

  const errorStyles = useMemo(
    () => ({
      width: "48px",
      height: "48px",
      borderRadius: "50%",
      margin: "0 auto 20px",
      background: "rgba(239,68,68,0.12)",
      color: "#dc2626",
      display: "grid",
      placeItems: "center",
      fontSize: "22px",
      border: "2px solid rgba(239,68,68,0.25)",
    }),
    [],
  );

  const indicator =
    status === "success" ? (
      <div style={successStyles} aria-hidden>
        ✓
      </div>
    ) : status === "error" ? (
      <div style={errorStyles} aria-hidden>
        !
      </div>
    ) : (
      <div style={spinnerStyles} aria-hidden />
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f5",
      }}
    >
      <style>
        {`
          @keyframes gearfirst-login-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          textAlign: "center",
          padding: "48px 40px",
          borderRadius: "20px",
          background: "#ffffff",
          border: "1px solid #e4e4e7",
          boxShadow: "0 24px 40px rgba(15, 23, 42, 0.08)",
        }}
      >
        {indicator}
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: status === "error" ? "#b91c1c" : "#0f172a",
            marginBottom: "12px",
          }}
        >
          {message}
        </h2>
        <p
          style={{
            fontSize: "0.95rem",
            color: status === "error" ? "#b91c1c" : "#4b5563",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {detail}
        </p>
        {status === "error" ? (
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            style={{
              marginTop: "20px",
              padding: "10px 16px",
              borderRadius: "12px",
              border: "1px solid #d4d4d8",
              background: "#111827",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            로그인 페이지로 이동
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default AuthCallback;
