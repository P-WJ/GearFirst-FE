import { describe, expect, it } from "vitest";
import { resolveRedirectUri } from "./redirectUri";

describe("resolveRedirectUri", () => {
  it("returns window origin callback when env is empty", () => {
    expect(resolveRedirectUri(undefined)).toBe(`${window.location.origin}/auth/callback`);
  });

  it("selects URI that matches current origin when multiple are provided", () => {
    const current = `${window.location.origin}/auth/callback`;
    const env = `https://prod.example.com/auth/callback, ${current}`;

    expect(resolveRedirectUri(env)).toBe(current);
  });
});
