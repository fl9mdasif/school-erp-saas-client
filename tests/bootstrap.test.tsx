import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { AuthBootstrap } from "@/components/auth/AuthBootstrap";
import { baseApi } from "@/redux/api/baseApi";
import { useAppSelector } from "@/redux/hooks";
import { clearSession, setAuthStatus } from "@/redux/slices/authSlice";
import { store } from "@/redux/store";

// Reproduces "refresh returns 200 but the dashboard never opens" after a page reload.
const ME = {
  user: { id: "u1", name: "Head Teacher", role: "admin", mustChangePassword: false },
  tenant: { id: "t1", name: "Bright Model School", slug: "bright", institutionType: "school", status: "trial", trialEndsAt: "2099-01-01T00:00:00.000Z", terminology: {}, settings: { locale: "bn", weekendDays: [5], defaultFeeCycle: "monthly" }, plan: null },
};

let refreshCalls = 0;
let meCalls: { auth: string | null }[] = [];
let meFirstResponds401 = false;

const server = setupServer(
  http.post("*/api/v1/auth/refresh", () => {
    refreshCalls += 1;
    return HttpResponse.json({ success: true, data: { accessToken: `token-${refreshCalls}` } });
  }),
  http.get("*/api/v1/auth/me", ({ request }) => {
    const auth = request.headers.get("authorization");
    meCalls.push({ auth });
    // The real API answers a request without a Bearer header with this exact error
    if (!auth || (meFirstResponds401 && meCalls.length === 1)) {
      return HttpResponse.json({ success: false, code: "UNAUTHORIZED", message: "Authentication required" }, { status: 401 });
    }
    return HttpResponse.json({ success: true, data: ME });
  })
);

beforeAll(() => server.listen());
afterAll(() => server.close());
beforeEach(() => {
  refreshCalls = 0;
  meCalls = [];
  meFirstResponds401 = false;
  // a fresh page load: no token, status idle
  store.dispatch(clearSession());
  store.dispatch(baseApi.util.resetApiState());
  store.dispatch(setAuthStatus("idle"));
});
afterEach(() => server.resetHandlers());

const Probe = () => {
  const status = useAppSelector((s) => s.auth.status);
  const name = useAppSelector((s) => s.auth.user?.name);
  return <p data-testid="probe">{`${status}|${name ?? ""}`}</p>;
};

const mount = () =>
  render(
    <StrictMode>
      <Provider store={store}>
        <AuthBootstrap />
        <Probe />
      </Provider>
    </StrictMode>
  );

describe("session restore after a page reload", () => {
  it("ends authenticated, and /auth/me carries the access token", async () => {
    mount();
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("authenticated|Head Teacher"), { timeout: 3000 });
    expect(meCalls.length).toBeGreaterThan(0);
    for (const c of meCalls) expect(c.auth).toMatch(/^Bearer token-\d+$/);
    expect(refreshCalls).toBe(1);
  });

  it("recovers when /auth/me answers 401 once: refreshes and retries instead of signing out", async () => {
    meFirstResponds401 = true;
    mount();
    await waitFor(() => expect(screen.getByTestId("probe")).toHaveTextContent("authenticated|Head Teacher"), { timeout: 3000 });
    expect(meCalls.length).toBe(2);
  });
});
