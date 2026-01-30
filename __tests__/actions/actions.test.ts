/**
 * Tests for server actions
 * Note: These tests mock the cookies and fetch to test the action logic
 */

import { loginAction, logoutAction, toggleFavoriteAction } from "@/app/actions";

// Mock Next.js modules
jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

// Import mocked modules
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginAction", () => {
    const mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    };

    beforeEach(() => {
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    });

    describe("Input Validation", () => {
      it("returns error when username is missing", async () => {
        const formData = new FormData();
        formData.set("password", "password123");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Username is required." });
      });

      it("returns error when username is empty", async () => {
        const formData = new FormData();
        formData.set("username", "   ");
        formData.set("password", "password123");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Username is required." });
      });

      it("returns error when password is missing", async () => {
        const formData = new FormData();
        formData.set("username", "testuser");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Password is required." });
      });

      it("returns error when password is empty", async () => {
        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "   ");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Password is required." });
      });

      it("returns error when username is too short", async () => {
        const formData = new FormData();
        formData.set("username", "ab");
        formData.set("password", "password123");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Username must be at least 3 characters." });
      });

      it("returns error when password is too short", async () => {
        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "12345");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Password must be at least 6 characters." });
      });
    });

    describe("API Integration", () => {
      it("calls API with correct credentials", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "test-token" }),
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        try {
          await loginAction(null, formData);
        } catch {
          // Redirect throws, which is expected
        }

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/login"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              "Content-Type": "application/json",
            }),
            body: JSON.stringify({ username: "testuser", password: "password123" }),
          })
        );
      });

      it("returns error for invalid credentials", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 401,
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "wrongpassword");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Invalid credentials. Please try again." });
      });

      it("returns error when no token received", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({}),
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        const result = await loginAction(null, formData);

        expect(result).toEqual({ message: "Login failed. No token received." });
      });

      it("handles network errors", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        const result = await loginAction(null, formData);

        expect(result).toEqual({
          message: "Unable to connect to the server. Please try again later.",
        });
      });
    });

    describe("Cookie Management", () => {
      it("sets session cookie on successful login", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "test-token" }),
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        try {
          await loginAction(null, formData);
        } catch {
          // Redirect throws
        }

        expect(mockCookieStore.set).toHaveBeenCalledWith(
          "session_token",
          "test-token",
          expect.objectContaining({
            httpOnly: true,
            path: "/",
          })
        );
      });

      it("sets username cookie on successful login", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "test-token" }),
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        try {
          await loginAction(null, formData);
        } catch {
          // Redirect throws
        }

        expect(mockCookieStore.set).toHaveBeenCalledWith(
          "username",
          "testuser",
          expect.objectContaining({
            httpOnly: true,
            path: "/",
          })
        );
      });

      it("redirects to home on successful login", async () => {
        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ token: "test-token" }),
        });

        const formData = new FormData();
        formData.set("username", "testuser");
        formData.set("password", "password123");

        await loginAction(null, formData);

        expect(redirect).toHaveBeenCalledWith("/");
      });
    });
  });

  describe("logoutAction", () => {
    const mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    };

    beforeEach(() => {
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    });

    it("deletes session_token cookie", async () => {
      await logoutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("session_token");
    });

    it("deletes username cookie", async () => {
      await logoutAction();

      expect(mockCookieStore.delete).toHaveBeenCalledWith("username");
    });

    it("redirects to login page", async () => {
      await logoutAction();

      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });

  describe("toggleFavoriteAction", () => {
    const mockCookieStore = {
      set: jest.fn(),
      get: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
    };

    beforeEach(() => {
      (cookies as jest.Mock).mockResolvedValue(mockCookieStore);
    });

    describe("Authentication", () => {
      it("returns unauthorized when no token", async () => {
        mockCookieStore.get.mockReturnValue(undefined);

        const result = await toggleFavoriteAction("recipe-123", false);

        expect(result).toEqual({ error: "Unauthorized" });
      });

      it("returns unauthorized when no username and /me fails", async () => {
        mockCookieStore.get
          .mockReturnValueOnce({ value: "test-token" }) // session_token
          .mockReturnValueOnce(undefined); // username

        mockFetch.mockRejectedValueOnce(new Error("API error"));

        const result = await toggleFavoriteAction("recipe-123", false);

        expect(result).toEqual({ error: "Unauthorized" });
      });
    });

    describe("Add to Favorites", () => {
      beforeEach(() => {
        mockCookieStore.get
          .mockReturnValueOnce({ value: "test-token" })
          .mockReturnValueOnce({ value: "testuser" });
      });

      it("calls POST endpoint to add favorite", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await toggleFavoriteAction("recipe-123", false);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/users/testuser/favorites?recipeID=recipe-123"),
          expect.objectContaining({
            method: "POST",
            headers: expect.objectContaining({
              Authorization: "Bearer test-token",
            }),
          })
        );
      });

      it("revalidates paths on success", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await toggleFavoriteAction("recipe-123", false);

        expect(revalidatePath).toHaveBeenCalledWith("/favorites");
        expect(revalidatePath).toHaveBeenCalledWith("/recipes/recipe-123");
      });

      it("returns success on successful add", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        const result = await toggleFavoriteAction("recipe-123", false);

        expect(result).toEqual({ success: true });
      });
    });

    describe("Remove from Favorites", () => {
      beforeEach(() => {
        mockCookieStore.get
          .mockReturnValueOnce({ value: "test-token" })
          .mockReturnValueOnce({ value: "testuser" });
      });

      it("calls DELETE endpoint to remove favorite", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        await toggleFavoriteAction("recipe-123", true);

        expect(mockFetch).toHaveBeenCalledWith(
          expect.stringContaining("/users/testuser/favorites?recipeID=recipe-123"),
          expect.objectContaining({
            method: "DELETE",
            headers: expect.objectContaining({
              Authorization: "Bearer test-token",
            }),
          })
        );
      });

      it("returns success on successful remove", async () => {
        mockFetch.mockResolvedValueOnce({ ok: true });

        const result = await toggleFavoriteAction("recipe-123", true);

        expect(result).toEqual({ success: true });
      });
    });

    describe("Error Handling", () => {
      beforeEach(() => {
        mockCookieStore.get
          .mockReturnValueOnce({ value: "test-token" })
          .mockReturnValueOnce({ value: "testuser" });
      });

      it("returns error when API responds with error", async () => {
        mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

        const result = await toggleFavoriteAction("recipe-123", false);

        expect(result).toEqual({ error: "Failed to update favorite" });
      });

      it("returns error when fetch throws", async () => {
        mockFetch.mockRejectedValueOnce(new Error("Network error"));

        const result = await toggleFavoriteAction("recipe-123", false);

        expect(result).toEqual({ error: "Failed to update favorite" });
      });
    });

    describe("Username Fallback", () => {
      it("fetches username from /me if not in cookies", async () => {
        mockCookieStore.get
          .mockReturnValueOnce({ value: "test-token" })
          .mockReturnValueOnce(undefined); // No username in cookies

        mockFetch
          .mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ username: "fetcheduser" }),
          })
          .mockResolvedValueOnce({ ok: true }); // For the toggle request

        await toggleFavoriteAction("recipe-123", false);

        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          expect.stringContaining("/me"),
          expect.objectContaining({
            method: "GET",
            headers: expect.objectContaining({
              Authorization: "Bearer test-token",
            }),
          })
        );
      });
    });
  });
});
