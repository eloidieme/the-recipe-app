"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gourmet.cours.quimerch.com";

const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt || now > attempt.resetAt) {
    // First attempt or window expired
    loginAttempts.set(identifier, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 min window
    return true;
  }

  if (attempt.count >= 5) {
    // Too many attempts
    return false;
  }

  attempt.count++;
  return true;
}

function clearRateLimit(identifier: string) {
  loginAttempts.delete(identifier);
}

export async function loginAction(
  prevState: { message?: string } | null,
  formData: FormData,
) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (!username || typeof username !== "string" || username.trim() === "") {
    return { message: "Username is required." };
  }

  if (!password || typeof password !== "string" || password.trim() === "") {
    return { message: "Password is required." };
  }

  if (username.length < 3) {
    return { message: "Username must be at least 3 characters." };
  }

  if (password.length < 6) {
    return { message: "Password must be at least 6 characters." };
  }

  if (!checkRateLimit(username)) {
    return {
      message: "Too many login attempts. Please try again in 15 minutes.",
    };
  }

  try {
    const res = await fetchWithRetry(`${API_URL}/login`, {
      method: "POST",
      headers: {
        Accept: "application/json, application/xml",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      return { message: "Invalid credentials. Please try again." };
    }

    const data = await res.json();

    if (!data.token) {
      return { message: "Login failed. No token received." };
    }

    const token = data.token;

    const cookieStore = await cookies();

    // Store both token and username in a single cookie to avoid
    // multiple Set-Cookie header issues in some production environments
    cookieStore.set("session", JSON.stringify({ token, username }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    clearRateLimit(username);
  } catch (error) {
    console.error("Login error:", error);
    return {
      message: "Unable to connect to the server. Please try again later.",
    };
  }

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  // Also delete old cookies for backwards compatibility
  cookieStore.delete("session_token");
  cookieStore.delete("username");
  redirect("/login");
}

export async function toggleFavoriteAction(
  recipeId: string,
  isCurrentlyFavorite: boolean,
) {
  const cookieStore = await cookies();

  // Try new combined session cookie first, fall back to old separate cookies
  const sessionCookie = cookieStore.get("session")?.value;
  let token: string | undefined;
  let username: string | undefined;

  if (sessionCookie) {
    try {
      const session = JSON.parse(sessionCookie);
      token = session.token;
      username = session.username;
    } catch {
      // Invalid JSON, ignore
    }
  }

  // Fallback to old cookies for backwards compatibility
  if (!token) {
    token = cookieStore.get("session_token")?.value;
  }
  if (!username) {
    username = cookieStore.get("username")?.value;
  }

  if (!token) return { error: "Unauthorized" };

  if (!username) {
    username = await fetchWithRetry(`${API_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, application/xml",
      },
    })
      .then((res) => res.json())
      .then((data) => data.username)
      .catch(() => null);
  }

  if (!username) return { error: "Unauthorized" };

  try {
    let res;

    if (isCurrentlyFavorite) {
      res = await fetchWithRetry(
        `${API_URL}/users/${username}/favorites?recipeID=${recipeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json, application/xml",
          },
        },
      );
    } else {
      res = await fetchWithRetry(
        `${API_URL}/users/${username}/favorites?recipeID=${recipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json, application/xml",
          },
        },
      );
    }

    if (!res.ok) {
      console.error("Failed to toggle favorite:", res.status);
      return { error: "Failed to update favorite" };
    }

    revalidatePath("/favorites");
    revalidatePath(`/recipes/${recipeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { error: "Failed to update favorite" };
  }
}
