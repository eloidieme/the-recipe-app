import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Recipe } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Users, Flame, ChevronLeft, ChefHat } from "lucide-react";
import Image from "next/image";
import FavoriteButton from "@/components/FavoriteButton";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gourmet.cours.quimerch.com";

export const dynamic = 'force-dynamic';

async function getRecipe(id: string): Promise<Recipe | null> {
  try {
    const res = await fetch(`${API_URL}/recipes/${id}`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Error fetching recipe:", error);
    return null;
  }
}

async function checkIfFavorite(recipeId: string): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) return false;

  // Try to get username from cache first
  let username = cookieStore.get("username")?.value;

  // Fallback to API call if not cached
  if (!username) {
    const userData = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json, application/xml",
      },
    })
      .then((res) => res.json())
      .then((data) => data.username)
      .catch(() => null);

    username = userData;
  }

  if (!username) return false;

  try {
    const res = await fetch(`${API_URL}/users/${username}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) return false;

    const favorites: Recipe[] = await res.json();
    return favorites.some((fav) => fav.id === recipeId);
  } catch {
    return false;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    return {
      title: "Recipe Not Found | Gourmet Hunter",
      description: "The recipe you're looking for could not be found.",
    };
  }

  return {
    title: `${recipe.name} | Gourmet Hunter`,
    description: recipe.description || `Discover how to make ${recipe.name}`,
  };
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const recipeData = getRecipe(id);
  const isFavoriteData = checkIfFavorite(id);

  const [recipe, isFavorite] = await Promise.all([recipeData, isFavoriteData]);

  if (!recipe) {
    notFound();
  }

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session_token");

  return (
    <div className="min-h-screen p-6 md:p-12 max-w-6xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors mb-4"
      >
        <ChevronLeft size={20} aria-hidden="true" />
        <span className="ml-1 font-medium">Back to recipes</span>
      </Link>

      <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-emerald-900/50 group h-80 md:h-[400px]">
        <div className="absolute inset-0 bg-emerald-900/40 mix-blend-multiply z-10" />
        {recipe.image_url ? (
          <Image
            src={recipe.image_url}
            alt={recipe.name}
            className="w-full h-full object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        ) : (
          <div className="w-full h-full bg-emerald-950 flex items-center justify-center">
            <ChefHat
              size={80}
              className="text-emerald-800"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/90 via-black/50 to-transparent p-8 z-20">
          <Badge className="bg-emerald-500 text-white mb-3 hover:bg-emerald-600 border-0">
            {recipe.category}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-md">
            {recipe.name}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <Card className="bg-white/5 backdrop-blur-md border-white/10 text-emerald-100">
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Clock
                    size={20}
                    className="text-emerald-400"
                    aria-hidden="true"
                  />{" "}
                  <span>Total Time</span>
                </div>
                <span className="font-bold">
                  {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                </span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Users
                    size={20}
                    className="text-emerald-400"
                    aria-hidden="true"
                  />{" "}
                  <span>Servings</span>
                </div>
                <span className="font-bold">{recipe.servings || 0} ppl</span>
              </div>
              <Separator className="bg-white/10" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Flame
                    size={20}
                    className="text-orange-400"
                    aria-hidden="true"
                  />{" "}
                  <span>Calories</span>
                </div>
                <span className="font-bold">{recipe.calories || 0} kcal</span>
              </div>
            </CardContent>
          </Card>

          <div className="grid">
            <FavoriteButton
              recipeId={recipe.id}
              initialIsFavorite={isFavorite}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full bg-white/5 backdrop-blur-md border-white/10">
            <CardContent className="p-8">
              <h2 className="text-2xl font-semibold text-emerald-400 mb-6 flex items-center gap-2">
                <ChefHat aria-hidden="true" /> Instructions
              </h2>
              <div className="prose prose-invert prose-emerald max-w-none text-gray-300 leading-relaxed whitespace-pre-line text-lg">
                {recipe.instructions}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
