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
    page.getByRole("heading", { name: process.env.EXPECT_CATALOG_SOURCE === "fallback" ? "Catalog unavailable" : "Page not found" }),
  ).toBeVisible();
});

test("homepage icons and security policy work without injected scripts", async ({
  page,
  request,
}) => {
  await page.route("**/", async (route) => {
    const response = await route.fetch();
    const html = await response.text();
    await route.fulfill({ response, body: html.replace("</head>", "<script>window.__injected = true</script></head>") });
  });
  const response = await page.goto("/");
  const csp = response!.headers()["content-security-policy"];
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toMatch(/script-src[^;]*'nonce-[^']+'/);
  expect(csp.split("script-src")[1].split(";")[0]).not.toContain(
    "'unsafe-inline'",
  );
  expect(response!.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response!.headers()["x-powered-by"]).toBeUndefined();
  await expect(page.locator(".character-icon")).toHaveCount(3);
  for (const icon of await page.locator(".character-icon img").all()) {
    await icon.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        icon.evaluate((img) => (img as HTMLImageElement).naturalWidth),
      )
      .toBeGreaterThan(0);
  }
  expect(await page.evaluate(() => "__injected" in window)).toBe(false);
  await page.getByRole("link", { name: "Coco — view series" }).click();
  await expect(
    page.getByRole("heading", { name: "Witch Hat Atelier", exact: true }),
  ).toBeVisible();

  const catalog = await request.get("/api/manga");
  expect(catalog.status()).toBe(200);
  expect(["bundled", "backend", "fallback"]).toContain(
    catalog.headers()["x-catalog-source"],
  );
  if (process.env.EXPECT_CATALOG_SOURCE)
    expect(catalog.headers()["x-catalog-source"]).toBe(
      process.env.EXPECT_CATALOG_SOURCE,
    );
  expect((await catalog.json()).totalItems).toBe(8);
  for (const path of [
    "/api/manga?page=-1",
    "/api/manga?status=bad",
    "/api/manga?q=" + "a".repeat(101),
    "/api/manga?q=a&q=b",
  ]) {
    expect((await request.get(path)).status()).toBe(400);
  }
  expect((await request.get("/api/users")).status()).toBe(404);
  expect(
    (
      await request.post("/api/manga", { data: { title: "unwanted" } })
    ).status(),
  ).toBe(405);
  const injection = await request.get("/api/manga", {
    params: { q: "' OR 1=1 --" },
  });
  expect((await injection.json()).totalItems).toBe(0);
});
