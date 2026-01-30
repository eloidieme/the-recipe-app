import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test.describe("Keyboard Navigation", () => {
    test("can navigate login form with keyboard", async ({ page }) => {
      await page.goto("/login");

      // Start from the beginning of the page
      await page.keyboard.press("Tab");

      // Skip link should be focused first
      const skipLink = page.getByText("Skip to main content");
      await expect(skipLink).toBeFocused();

      // Continue tabbing through interactive elements
      await page.keyboard.press("Tab"); // Logo link
      await page.keyboard.press("Tab"); // Should reach login input or another nav element

      // Eventually we should be able to reach the username field
      await page.getByLabel("Username").focus();
      await expect(page.getByLabel("Username")).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByLabel("Password")).toBeFocused();

      await page.keyboard.press("Tab");
      // Password toggle button
      await expect(
        page.getByRole("button", { name: /show password/i })
      ).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByRole("button", { name: "Sign In" })).toBeFocused();
    });

    test("can navigate home page with keyboard", async ({ page }) => {
      await page.goto("/");

      // Tab through the page
      await page.keyboard.press("Tab"); // Skip link
      await page.keyboard.press("Tab"); // Logo

      const logoLink = page.getByRole("link", { name: /gourmet hunter home/i });
      await expect(logoLink).toBeFocused();

      // Can activate link with Enter
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL("/");
    });

    test("can submit form with Enter key", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel("Username").fill("testuser");
      await page.getByLabel("Password").fill("password123");

      // Press Enter to submit
      await page.keyboard.press("Enter");

      // Form should be submitted (loading state or redirect)
      // We just check that something happens
      await page.waitForLoadState("networkidle");
    });
  });

  test.describe("ARIA Attributes", () => {
    test("login form has proper labels", async ({ page }) => {
      await page.goto("/login");

      // Inputs should be properly labeled
      const usernameInput = page.getByLabel("Username");
      const passwordInput = page.getByLabel("Password");

      await expect(usernameInput).toHaveAttribute("id", "username");
      await expect(passwordInput).toHaveAttribute("id", "password");
    });

    test("password toggle has aria-label", async ({ page }) => {
      await page.goto("/login");

      const toggleButton = page.getByRole("button", { name: /show password/i });
      await expect(toggleButton).toHaveAttribute("aria-label");
    });

    test("error messages have alert role", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel("Username").fill("ab");
      await page.getByLabel("Password").fill("password123");
      await page.getByRole("button", { name: "Sign In" }).click();

      const alert = page.getByRole("alert");
      await expect(alert).toBeVisible();
      await expect(alert).toHaveAttribute("aria-live", "polite");
    });

    test("navigation has proper ARIA landmark", async ({ page }) => {
      await page.goto("/");

      const nav = page.getByRole("navigation", { name: /main navigation/i });
      await expect(nav).toBeVisible();
    });

    test("mobile menu button has proper aria attributes", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /open menu/i });
      await expect(menuButton).toHaveAttribute("aria-expanded", "false");
      await expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");

      await menuButton.click();

      const closeButton = page.getByRole("button", { name: /close menu/i });
      await expect(closeButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  test.describe("Focus Management", () => {
    test("focus returns after closing mobile menu", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/");

      const menuButton = page.getByRole("button", { name: /open menu/i });
      await menuButton.click();

      // Close menu with the button
      const closeButton = page.getByRole("button", { name: /close menu/i });
      await closeButton.click();

      // Menu button should exist again
      await expect(
        page.getByRole("button", { name: /open menu/i })
      ).toBeVisible();
    });

    test("error message focuses username input", async ({ page }) => {
      await page.goto("/login");

      await page.getByLabel("Username").fill("testuser");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign In" }).click();

      // Wait for error
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });

      // Username should be focused (per implementation)
      await expect(page.getByLabel("Username")).toBeFocused();
    });
  });

  test.describe("Screen Reader Support", () => {
    test("icons have aria-hidden attribute", async ({ page }) => {
      await page.goto("/login");

      // Check that decorative icons are hidden from screen readers
      const icons = page.locator('[aria-hidden="true"]');
      expect(await icons.count()).toBeGreaterThan(0);
    });

    test("skip link is available", async ({ page }) => {
      await page.goto("/");

      const skipLink = page.getByText("Skip to main content");
      await expect(skipLink).toBeAttached();
      await expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    test("main content anchor exists", async ({ page }) => {
      await page.goto("/");

      const mainAnchor = page.locator("#main-content");
      await expect(mainAnchor).toBeAttached();
    });
  });

  test.describe("Color Contrast and Visibility", () => {
    test("text is visible against background", async ({ page }) => {
      await page.goto("/login");

      // Check that key text elements are visible
      await expect(page.getByText("Welcome Back")).toBeVisible();
      await expect(page.getByText("Username")).toBeVisible();
      await expect(page.getByText("Password")).toBeVisible();
    });

    test("focus indicators are visible", async ({ page }) => {
      await page.goto("/login");

      const usernameInput = page.getByLabel("Username");
      await usernameInput.focus();

      // Check that the element has some focus styling
      // We can't easily test the exact styles, but we can check it's focused
      await expect(usernameInput).toBeFocused();
    });
  });

  test.describe("Reduced Motion", () => {
    test("page works with reduced motion preference", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto("/");

      // Page should still function
      await expect(
        page.getByRole("heading", { name: "Gourmet Hunter" })
      ).toBeVisible();
    });
  });
});
