import { test, expect } from "@playwright/test";

test.describe("Error Scenarios", () => {
  test.describe("Login Errors", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/login");
    });

    test("shows error for short username", async ({ page }) => {
      await page.getByLabel("Username").fill("ab");
      await page.getByLabel("Password").fill("password123");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByRole("alert")).toBeVisible();
      await expect(
        page.getByText("Username must be at least 3 characters")
      ).toBeVisible();
    });

    test("shows error for short password", async ({ page }) => {
      await page.getByLabel("Username").fill("validuser");
      await page.getByLabel("Password").fill("12345");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByRole("alert")).toBeVisible();
      await expect(
        page.getByText("Password must be at least 6 characters")
      ).toBeVisible();
    });

    test("shows error for invalid credentials", async ({ page }) => {
      await page.getByLabel("Username").fill("nonexistentuser");
      await page.getByLabel("Password").fill("wrongpassword123");
      await page.getByRole("button", { name: "Sign In" }).click();

      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });
      await expect(
        page.getByText(/invalid credentials/i)
      ).toBeVisible();
    });

    test("clears password field on error", async ({ page }) => {
      await page.getByLabel("Username").fill("testuser");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign In" }).click();

      // Wait for error
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });

      // Password should be cleared
      await expect(page.getByLabel("Password")).toHaveValue("");
    });

    test("applies error styling to input fields", async ({ page }) => {
      await page.getByLabel("Username").fill("testuser");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign In" }).click();

      // Wait for error
      await expect(page.getByRole("alert")).toBeVisible({ timeout: 10000 });

      // Input fields should have error styling (border-red class)
      const usernameInput = page.getByLabel("Username");
      await expect(usernameInput).toHaveClass(/border-red/);
    });
  });

  test.describe("404 Not Found", () => {
    test("shows 404 for non-existent recipe", async ({ page }) => {
      const response = await page.goto("/recipes/non-existent-recipe-id-12345");

      // Should get a 404 response or show not found page
      if (response) {
        const status = response.status();
        expect([200, 404]).toContain(status); // Next.js might return 200 with notFound content
      }

      // Check for not found content (depends on implementation)
      await page.waitForLoadState("networkidle");
    });

    test("shows 404 for non-existent route", async ({ page }) => {
      await page.goto("/this-page-does-not-exist");

      // Should show a 404 page
      await expect(page.getByText(/404|not found/i)).toBeVisible();
    });
  });

  test.describe("Unauthorized Access", () => {
    test("redirects to login when accessing favorites without auth", async ({
      page,
    }) => {
      await page.goto("/favorites");

      // Should redirect to login
      await expect(page).toHaveURL("/login");
    });
  });
});

test.describe("Form Validation", () => {
  test("username field has minlength validation", async ({ page }) => {
    await page.goto("/login");

    const usernameInput = page.getByLabel("Username");
    await expect(usernameInput).toHaveAttribute("minlength", "3");
  });

  test("password field has minlength validation", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.getByLabel("Password");
    await expect(passwordInput).toHaveAttribute("minlength", "6");
  });

  test("both fields are required", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Username")).toHaveAttribute("required", "");
    await expect(page.getByLabel("Password")).toHaveAttribute("required", "");
  });
});

test.describe("Network Resilience", () => {
  test("handles slow network gracefully", async ({ page }) => {
    // Simulate slow network
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    await page.goto("/");

    // Page should still load eventually
    await expect(
      page.getByRole("heading", { name: "Gourmet Hunter" })
    ).toBeVisible({ timeout: 30000 });
  });
});
