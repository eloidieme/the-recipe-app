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

async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch("https://gourmet.cours.quimerch.com/recipes", {
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="min-h-screen p-8 md:p-12 space-y-8">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 pb-2">
          Gourmet Hunter
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          Discover the best recipes on Earth.
        </p>
      </div>

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
                  <span>{recipe.prep_time + recipe.cook_time} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users size={14} />
                  <span>{recipe.servings} ppl.</span>
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
    </main>
  );
}
