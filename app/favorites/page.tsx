import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Recipe } from "@/types";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame, Heart, AlertCircle } from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://gourmet.cours.quimerch.com";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Favorites | Gourmet Hunter",
  description: "Your collection of favorite recipes.",
};

async function getFavorites(): Promise<Recipe[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token")?.value;

  if (!token) {
    return [];
  }

  try {
    const res = await fetch(`${API_URL}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      if (res.status === 401) return [];
      console.error("Failed to fetch favorites:", res.status);
      return [];
    }

    const data: Array<{ recipe: Recipe }> = await res.json();
    return data.map((item) => item.recipe);
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return [];
  }
}

export default async function FavoritesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session_token");

  if (!token) {
    redirect("/login");
  }

  const recipes = await getFavorites();

  return (
    <div className="min-h-screen p-8 md:p-12 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-pink-500/20 rounded-full text-pink-500">
          <Heart size={32} fill="currentColor" aria-hidden="true" />
        </div>
        <h1 className="text-4xl font-bold text-white">My Favorites</h1>
      </div>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-3xl bg-white/5">
          <AlertCircle size={48} className="text-emerald-500/50 mb-4" aria-hidden="true" />
          <h2 className="text-xl text-emerald-100 font-semibold">
            No favorites yet
          </h2>
          <p className="text-gray-400 mt-2 mb-6 max-w-md">
            Go back to the forest and hunt for some delicious recipes to add to
            your collection.
          </p>
          <Link href="/">
            <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
              Explore Recipes
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="flex flex-col h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-pink-500/50 hover:bg-white/10 transition-all duration-300 group"
            >
              {/* Image */}
              <div className="relative w-full h-48 bg-emerald-900/20 overflow-hidden rounded-t-xl">
                {recipe.image_url ? (
                  <Image
                    src={recipe.image_url}
                    alt={recipe.name}
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-emerald-700">
                    <Flame size={40} aria-hidden="true" />
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-pink-600 text-white border-0">
                  Favorite
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-emerald-100 group-hover:text-pink-400 transition-colors">
                  {recipe.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                  {recipe.description}
                </p>

                <div className="flex items-center justify-between text-xs text-emerald-200/60 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock size={14} aria-hidden="true" />
                    <span>
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} aria-hidden="true" />
                    <span>{recipe.servings || 0} ppl</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20"
                >
                  <Link href={`/recipes/${recipe.id}`}>See Recipe</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
