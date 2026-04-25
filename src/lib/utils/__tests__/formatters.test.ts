import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatRelativeTime,
  getStatusConfig,
  getPriorityConfig,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
} from "@/lib/utils/formatters";

describe("formatRelativeTime", () => {
  beforeEach(() => {
    // Fixujemy czas żeby testy były deterministyczne
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-15T12:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns "just now" for dates less than 60 seconds ago', () => {
    const date = new Date("2024-01-15T11:59:30Z"); // 30 sekund temu
    expect(formatRelativeTime(date)).toBe("just now");
  });

  it("returns minutes ago for dates less than 1 hour ago", () => {
    const date = new Date("2024-01-15T11:45:00Z"); // 15 minut temu
    expect(formatRelativeTime(date)).toBe("15m ago");
  });

  it("returns hours ago for dates less than 24 hours ago", () => {
    const date = new Date("2024-01-15T09:00:00Z"); // 3 godziny temu
    expect(formatRelativeTime(date)).toBe("3h ago");
  });

  it("returns days ago for dates less than 7 days ago", () => {
    const date = new Date("2024-01-12T12:00:00Z"); // 3 dni temu
    expect(formatRelativeTime(date)).toBe("3d ago");
  });

  it("accepts string dates", () => {
    const date = "2024-01-15T11:59:30Z";
    expect(formatRelativeTime(date)).toBe("just now");
  });
});

describe("getStatusConfig", () => {
  it("returns correct config for OPEN status", () => {
    const config = getStatusConfig("OPEN");
    expect(config.label).toBe("Open");
    expect(config.color).toContain("blue");
  });

  it("returns correct config for RESOLVED status", () => {
    const config = getStatusConfig("RESOLVED");
    expect(config.label).toBe("Resolved");
    expect(config.color).toContain("green");
  });

  it("returns config for all valid statuses", () => {
    const statuses = Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>;
    statuses.forEach((status) => {
      const config = getStatusConfig(status);
      expect(config).toBeDefined();
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
    });
  });
});

describe("getPriorityConfig", () => {
  it("returns correct label for URGENT priority", () => {
    const config = getPriorityConfig("URGENT");
    expect(config.label).toBe("Urgent");
  });

  it("priorities have correct order (LOW < MEDIUM < HIGH < URGENT)", () => {
    expect(PRIORITY_CONFIG.LOW.order).toBeLessThan(PRIORITY_CONFIG.MEDIUM.order);
    expect(PRIORITY_CONFIG.MEDIUM.order).toBeLessThan(PRIORITY_CONFIG.HIGH.order);
    expect(PRIORITY_CONFIG.HIGH.order).toBeLessThan(PRIORITY_CONFIG.URGENT.order);
  });
});
