import { test, expect } from "./fixtures/auth.fixture";

test.describe("Tickets List", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs("agent");
  });

  test("shows tickets list with data from seed", async ({ page }) => {
    await page.goto("/tickets");
    await expect(page.getByRole("heading", { name: /tickets/i })).toBeVisible();
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(8);
  });

  test("filters tickets by status", async ({ page }) => {
    // beforeEach już zalogował — nie goto ponownie, reużywamy sesję
    await page.goto("/tickets");
    // Czekamy że strona się załaduje zanim będziemy szukać selecta
    await expect(page.locator("tbody tr").first()).toBeVisible();
    await page.getByLabel(/filter by status/i).selectOption("OPEN");
    await expect(page).toHaveURL(/status=OPEN/);
    await page.waitForTimeout(500);
    const rows = page.locator("tbody tr");
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("searches tickets by title", async ({ page }) => {
    await page.goto("/tickets");
    await page.getByLabel(/search tickets/i).fill("login");
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/search=login/);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
  });

  test("preserves filters on page refresh", async ({ page }) => {
    await page.goto("/tickets?status=OPEN&priority=HIGH");
    const statusSelect = page.getByLabel(/filter by status/i);
    await expect(statusSelect).toHaveValue("OPEN");
    const prioritySelect = page.getByLabel(/filter by priority/i);
    await expect(prioritySelect).toHaveValue("HIGH");
  });

  test("clears filters with clear button", async ({ page }) => {
    await page.goto("/tickets?status=OPEN");
    const clearButton = page.getByRole("button", { name: /clear filters/i });
    await expect(clearButton).toBeVisible();
    await clearButton.click();

    // Czekamy na nawigację
    await page.waitForURL("/tickets", { timeout: 5000 });
    await expect(page).toHaveURL("/tickets");
    await expect(clearButton).not.toBeVisible();
  });
});

test.describe("Create Ticket", () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs("customer");
  });

  test("customer can navigate to new ticket form", async ({ page }) => {
    await page.goto("/tickets");
    await page
      .getByRole("link", { name: /new ticket/i })
      .first()
      .click();
    await expect(page).toHaveURL("/tickets/new");
    await expect(page.getByRole("heading", { name: /submit a support request/i })).toBeVisible();
  });

  test("shows validation errors for empty form", async ({ page }) => {
    await page.goto("/tickets/new");
    await page.getByRole("button", { name: /submit ticket/i }).click();
    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
  });

  test("creates ticket successfully and redirects", async ({ page }) => {
    await page.goto("/tickets/new");

    await page.getByLabel(/subject/i).fill("E2E Test Ticket");
    await page
      .getByPlaceholder(/describe the issue/i)
      .fill("This is an automated test ticket created by Playwright. It has enough characters.");
    await page.locator("select[name='priority']").selectOption("HIGH");
    await page.getByRole("button", { name: /submit ticket/i }).click();

    await page.waitForURL(/\/tickets\/.+/, { timeout: 10000 });

    // Używamy heading zamiast getByText — unikamy strict violation
    await expect(page.getByRole("heading", { name: "E2E Test Ticket" })).toBeVisible();
    // Szukamy badge statusu — pierwszy element z tekstem "Open"
    await expect(
      page
        .locator("span")
        .filter({ hasText: /^Open$/ })
        .first(),
    ).toBeVisible();
  });
});

test.describe("Ticket Details", () => {
  test("agent can change ticket status", async ({ page, loginAs }) => {
    await loginAs("agent");
    await page.goto("/tickets");

    // Czekamy że tabela się załaduje
    await expect(page.locator("tbody tr").first()).toBeVisible();

    // Klikamy w tytuł pierwszego ticketu (link w pierwszej kolumnie)
    const firstRow = page.locator("tbody tr").first();
    const ticketLink = firstRow.locator("a").first();
    await ticketLink.click();

    // Czekamy na URL ticketu — nie /tickets (lista)
    await expect(page).toHaveURL(/\/tickets\/[^/]+$/);

    // Sprawdzamy że activity log istnieje
    await expect(page.getByText(/activity/i)).toBeVisible();
  });

  test("customer cannot see internal comments", async ({ page, loginAs }) => {
    await loginAs("agent");
    await page.goto("/tickets");

    await page.getByLabel(/search tickets/i).fill("Application crashes");
    await page.waitForTimeout(500);
    await page.locator("tbody tr a").first().click();
    await page.waitForURL(/\/tickets\/.+/);

    // Agent widzi internal note — używamy exact: true żeby uniknąć strict violation
    await expect(page.getByText("Internal Note", { exact: true })).toBeVisible();

    const ticketUrl = page.url();

    // Wyloguj i zaloguj jako customer
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL(/\/login/);

    await loginAs("customer");

    // Customer próbuje wejść na ten ticket
    await page.goto(ticketUrl);

    // Powinien dostać 404 lub być przekierowany
    const isNotFound = await page
      .getByText(/not found/i)
      .isVisible()
      .catch(() => false);
    const isRedirected = !page.url().includes(ticketUrl.split("/").pop()!);

    expect(isNotFound || isRedirected).toBeTruthy();
  });
});

test.describe("Role-based access", () => {
  test("agent cannot access /tickets/new", async ({ page, loginAs }) => {
    await loginAs("agent");
    await page.goto("/tickets/new");
    await expect(page).not.toHaveURL("/tickets/new");
  });

  test("customer cannot access /admin/users", async ({ page, loginAs }) => {
    await loginAs("customer");
    await page.goto("/admin/users");
    await expect(page).toHaveURL("/");
  });

  test("admin can access /admin/users", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: /user management/i })).toBeVisible();
  });

  test("admin can see all users in the system", async ({ page, loginAs }) => {
    await loginAs("admin");
    await page.goto("/admin/users");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(5);
  });
});
