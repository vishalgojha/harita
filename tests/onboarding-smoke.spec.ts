import { expect, test } from "@playwright/test";

test("guided onboarding smoke path stays usable", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await expect(page.getByText(/igbc documentation operations/i)).toBeVisible();

  const demoButton = page.getByRole("button", { name: /open demo workspace/i });
  if (await demoButton.isVisible()) {
    await page.goto("/dashboard");
    await expect(page.getByText("CCIL Gurgaon Experience Centre")).toBeVisible();

    await Promise.all([
      page.waitForURL(/\/projects\/.+/),
      page.getByRole("link", { name: /open workspace/i }).first().click(),
    ]);
    await expect(page.getByText(/credit tracker/i)).toBeVisible();

    await page.goto("/projects/demo-project/submission");
    await expect(page.getByRole("heading", { name: /submission pack/i })).toBeVisible();
  } else {
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
  }
});
