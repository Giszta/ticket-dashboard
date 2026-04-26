import { test, expect } from "./fixtures/auth.fixture";

test.describe("Authentication", () => {
  test("shows login page for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    // Middleware dodaje callbackUrl — sprawdzamy tylko że jesteśmy na /login
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  });

  test("shows demo credentials on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Demo credentials")).toBeVisible();
    await expect(page.getByText(/admin@example\.com/i)).toBeVisible();
  });

  test("shows error for invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@example.com");
    await page.getByLabel(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid email or password/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("redirects to dashboard after successful login", async ({ page, loginAs }) => {
    await loginAs("admin");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    // Szukamy w sidebarze — exact location żeby uniknąć strict violation
    await expect(page.getByRole("complementary").getByText("Alice Admin")).toBeVisible();
  });

  test("redirects already logged in user away from login page", async ({ page, loginAs }) => {
    await loginAs("agent");
    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("signs out successfully", async ({ page, loginAs }) => {
    await loginAs("customer");
    await page.getByRole("button", { name: /sign out/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
