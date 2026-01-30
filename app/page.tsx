import Link from "next/link";
import { Recipe } from "@/types";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame } from "lucide-react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

async function getRecipes(): Promise<Recipe[]> {
  try {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL || "https://gourmet.cours.quimerch.com";
    const res = await fetchWithRetry(`${API_URL}/recipes`, {
      next: { revalidate: 3600 },
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      console.error("Failed to fetch recipes:", res.status);
      return [];
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching recipes:", error);
    return [];
  }
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="min-h-screen p-8 md:p-12 space-y-8">
      <section
        className="relative w-full h-[400px] flex items-center justify-center rounded-xl overflow-hidden mb-12 shadow-2xl"
        style={{ position: "relative" }}
      >
        <Image
          src="/cuisine.jpeg"
          alt="Delicious cuisine banner"
          fill
          className="object-cover object-top brightness-[0.4]"
          priority
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
        />
        <div className="relative z-10 flex flex-col items-center justify-center space-y-4 text-center p-4">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white pb-2 drop-shadow-lg">
            Gourmet Hunter
          </h1>
          <p className="text-emerald-50 text-lg max-w-2xl drop-shadow-md font-medium">
            Discover the best recipes on Earth.
          </p>
        </div>
      </section>

      {recipes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Flame size={64} className="text-emerald-600 mb-4" />
          <h2 className="text-2xl font-bold text-emerald-100 mb-2">
            No recipes found
          </h2>
          <p className="text-gray-400">
            Check back later for delicious recipes!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recipes.map((recipe) => (
            <Card
              key={recipe.id}
              className="flex flex-col h-full bg-white/5 backdrop-blur-md border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300 group"
            >
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
                    <Flame size={40} />
                  </div>
                )}
                <Badge className="absolute top-3 right-3 bg-emerald-600 hover:bg-emerald-500 text-white border-0">
                  {recipe.category || "General"}
                </Badge>
              </div>

              <CardHeader>
                <CardTitle className="text-xl text-emerald-100 group-hover:text-emerald-400 transition-colors">
                  {recipe.name}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex-grow">
                <p className="text-sm text-gray-400 line-clamp-3 mb-4">
                  {recipe.description}
                </p>
                <div className="flex items-center justify-between text-xs text-emerald-200/60 font-medium">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {(recipe.prep_time || 0) + (recipe.cook_time || 0)} min
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{recipe.servings || 0} ppl.</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/20"
                >
                  <Link href={`/recipes/${recipe.id}`}>See recipe</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
