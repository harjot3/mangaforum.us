import { expect, test } from "@playwright/test";
test("browse publisher-sourced manga and chapter availability", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Manga database" }),
  ).toBeVisible();
  await expect(page.locator(".home-catalog .catalog-item")).toHaveCount(8);
  await page.getByAltText("Chainsaw Man cover").scrollIntoViewIfNeeded();
  await expect(page.getByAltText("Chainsaw Man cover")).toBeVisible();
  await expect
    .poll(
      async () =>
        await page
          .getByAltText("Chainsaw Man cover")
          .evaluate((image) => (image as HTMLImageElement).naturalWidth),
    )
    .toBeGreaterThan(0);
  await page.screenshot({
    path: `../docs/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Manga database", exact: true }).click();
  await page.getByLabel("Find a title").fill("Chainsaw");
  await page.getByRole("button", { name: "Browse", exact: true }).click();
  await expect(page.getByText("1 titles found")).toBeVisible();
  await page
    .getByRole("heading", { name: "Chainsaw Man", exact: true })
    .getByRole("link")
    .click();
  await expect(
    page.getByRole("heading", { name: "Chainsaw Man", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Chapters (0)" }).click();
  await expect(page.getByText("No chapters on this page.")).toBeVisible();
  await expect
    .poll(
      async () =>
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
    )
    .toBeTruthy();
});
test("empty searches and missing titles are recoverable", async ({ page }) => {
  await page.goto("/discover?q=no-such-title");
  await expect(
    page.getByRole("heading", { name: "No manga found." }),
  ).toBeVisible();
  await page.goto("/manga/no-such-title");
  await expect(
    page.getByRole("heading", { name: "Page not found" }),
  ).toBeVisible();
});
