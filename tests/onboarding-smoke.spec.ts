import { expect, test } from "@playwright/test";

test("guided onboarding smoke path stays usable", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText(/igbc documentation operations/i)).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByRole("button", { name: /send magic link|connect supabase first/i })).toBeVisible();
});
