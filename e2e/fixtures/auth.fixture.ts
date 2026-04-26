import { test as base, expect } from "@playwright/test";

type Role = "admin" | "agent" | "customer";

const CREDENTIALS: Record<Role, { email: string; password: string }> = {
  admin: { email: "admin@example.com", password: "admin123" },
  agent: { email: "agent1@example.com", password: "agent123" },
  customer: { email: "customer1@example.com", password: "customer123" },
};

type AuthFixtures = {
  loginAs: (role: Role) => Promise<void>;
};

export const test = base.extend<AuthFixtures>({
  loginAs: async ({ page }, use) => {
    await use(async (role: Role) => {
      const creds = CREDENTIALS[role];
      await page.goto("/login");
      await page.getByLabel(/email address/i).fill(creds.email);
      await page.getByLabel(/password/i).fill(creds.password);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL("/");
    });
  },
});

export { expect };
