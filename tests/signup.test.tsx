import { fireEvent, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { SignupWizard } from "@/components/auth/SignupWizard";
import { renderWithStore } from "./utils/render";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/signup",
}));

const TAKEN = new Set(["taken-school"]);
const server = setupServer(
  http.get("*/api/v1/auth/slug-available", ({ request }) => {
    const slug = new URL(request.url).searchParams.get("slug") ?? "";
    const normalized = slug.toLowerCase();
    const body = TAKEN.has(normalized)
      ? { normalized, available: false, reason: "SLUG_TAKEN" }
      : { normalized, available: true };
    return HttpResponse.json({ success: true, data: body });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const fillStepOne = async () => {
  fireEvent.change(screen.getByLabelText(/Institution name/), { target: { value: "Bright Model School" } });
  fireEvent.click(screen.getByRole("radio", { name: /School/ }));
  fireEvent.change(screen.getByLabelText(/Institution mobile number/), { target: { value: "01712345678" } });
  fireEvent.click(screen.getByRole("button", { name: "Next" }));
  await screen.findByLabelText(/Site address/);
};

describe("signup wizard", () => {
  it("does not let the visitor leave step 1 with missing details", async () => {
    renderWithStore(<SignupWizard />);
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(await screen.findAllByText(/required|Choose a type|valid Bangladesh/i)).not.toHaveLength(0);
  });

  it("shows the normalized address while typing and confirms it is available", async () => {
    renderWithStore(<SignupWizard />);
    await fillStepOne();
    fireEvent.change(screen.getByLabelText(/Site address/), { target: { value: "brightModel" } });
    // normalized at once, before the server answers
    expect(screen.getByText(/We will use: bright-model/)).toBeInTheDocument();
    expect(screen.getByText(/digitalpathshala\.com\/schools\/bright-model/)).toBeInTheDocument();
    expect(await screen.findByText("bright-model is available", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeEnabled();
  });

  it("blocks a taken address and offers two alternatives", async () => {
    renderWithStore(<SignupWizard />);
    await fillStepOne();
    fireEvent.change(screen.getByLabelText(/Site address/), { target: { value: "taken-school" } });
    expect(await screen.findByText("taken-school is already taken", {}, { timeout: 3000 })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "taken-school-2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "taken-school-school" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "taken-school-2" }));
    await waitFor(() => expect(screen.getByText("taken-school-2 is available")).toBeInTheDocument(), { timeout: 3000 });
  });

  it("keeps what the visitor typed when going back", async () => {
    renderWithStore(<SignupWizard />);
    await fillStepOne();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByLabelText(/Institution name/)).toHaveValue("Bright Model School");
  });
});
