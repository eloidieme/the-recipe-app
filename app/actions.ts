"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function loginAction(
  prevState: { message?: string } | null,
  formData: FormData
) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  const res = await fetch("https://gourmet.cours.quimerch.com/login", {
    method: "POST",
    headers: {
      Accept: "application/json, application/xml",
      "Content-Type": "*/*",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    return { message: "Invalid credentials. Please try again." };
  }

  const data = await res.json();
  const token = data.token;

  const cookieStore = await cookies();

  cookieStore.set("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: "/",
  });

  redirect("/");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  redirect("/login");
}

export async function toggleFavoriteAction(
  recipeId: string,
  isCurrentlyFavorite: boolean
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return { error: "Unauthorized" };

  const username = await fetch("https://gourmet.cours.quimerch.com/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json, application/xml",
    },
  })
    .then((res) => res.json())
    .then((data) => data.username)
    .catch(() => null);

  if (!username) return { error: "Unauthorized" };

  try {
    if (isCurrentlyFavorite) {
      await fetch(
        `https://gourmet.cours.quimerch.com/users/${username}/favorites?recipe_id=${recipeId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json, application/xml",
          },
        }
      );
    } else {
      await fetch(
        `https://gourmet.cours.quimerch.com/users/${username}/favorites?recipe_id=${recipeId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            Accept: "application/json, application/xml",
          },
        }
      );
    }

    revalidatePath("/favorites");
    revalidatePath(`/recipes/${recipeId}`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return { error: "Failed to update favorite" };
  }
}
