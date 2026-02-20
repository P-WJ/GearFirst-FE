import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateState,
} from "../utils/pkce";
import { type JSX, useCallback, useEffect, useMemo, useState } from "react";
import { resolveRedirectUri } from "../utils/redirectUri";
import { AUTH_BYPASS, ensureBypassAuth } from "../utils/bypassAuth";

const AUTH_SERVER = import.meta.env.VITE_AUTH_SERVER ?? "";
const CLIENT_ID = import.meta.env.VITE_CLIENT_ID ?? "gearfirst-client";
const REDIRECT_URI = resolveRedirectUri(import.meta.env.VITE_REDIRECT_URI);

function Login(): JSX.Element {
  const [statusMessage, setStatusMessage] = useState("로그인 준비 중입니다.");
  const [subMessage, setSubMessage] = useState(
    "보안 로그인 페이지로 이동합니다.",
  );

  const handleLogin = useCallback(async (): Promise<void> => {
    if (AUTH_BYPASS) {
      setStatusMessage("개발용 로그인 우회 모드");
      setSubMessage("인증 서버 없이 대시보드로 이동합니다.");
      ensureBypassAuth();
      window.location.href = "/dashboard";
      return;
    }

    if (!AUTH_SERVER) {
      setStatusMessage("인증 서버 설정이 필요합니다.");
      setSubMessage("VITE_AUTH_SERVER 환경변수를 확인해주세요.");
      return;
    }

    setStatusMessage("보안 토큰을 생성하고 있습니다.");

    const verifier = generateCodeVerifier();
    const challenge = await generateCodeChallenge(verifier);
    const state = generateState();

    sessionStorage.setItem("pkce_verifier", verifier);
    sessionStorage.setItem("oauth_state", state);
    setSubMessage("인증 페이지로 이동 중입니다...");

    const params = new URLSearchParams({
      response_type: "code",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: "openid email offline_access",
      code_challenge: challenge,
      code_challenge_method: "S256",
      state,
    });

    window.location.href = `${AUTH_SERVER}/oauth2/authorize?${params.toString()}`;
  }, []);

  useEffect(() => {
    void handleLogin();
  }, [handleLogin]);

  const spinnerStyles = useMemo(
    () => ({
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      border: "3px solid rgba(37,99,235,0.2)",
      borderTopColor: "#2563eb",
      animation: "gearfirst-login-spin 0.8s linear infinite",
      margin: "0 auto 20px",
    }),
    [],
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f4f5",
        padding: "40px 20px",
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
        <div style={spinnerStyles} aria-hidden />
        <h1 style={{ fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
          {statusMessage}
        </h1>
        <p
          style={{
            marginTop: "12px",
            fontSize: "0.95rem",
            color: "#4b5563",
            lineHeight: 1.5,
          }}
        >
          {subMessage}
        </p>
      </div>
    </div>
  );
}

export default Login;
