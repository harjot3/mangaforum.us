import { expect, test } from "@playwright/test";
test("browse a series and its chapter ledger", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Between chapters." }),
  ).toBeVisible();
  await page.screenshot({
    path: `../docs/screenshots/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("link", { name: "Manga index", exact: true }).click();
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
  await page.getByRole("link", { name: "Chapters (12)" }).click();
  await expect(page.getByText("Chapter 12", { exact: true })).toBeVisible();
  await expect(page.getByText("Chapter 1", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBeTruthy();
});
test("empty searches and missing titles are recoverable", async ({ page }) => {
  await page.goto("/discover?q=no-such-title");
  await expect(
    page.getByRole("heading", { name: "No titles on this shelf." }),
  ).toBeVisible();
  await page.goto("/manga/no-such-title");
  await expect(
    page.getByRole("heading", { name: "Nothing on this shelf." }),
  ).toBeVisible();
});
