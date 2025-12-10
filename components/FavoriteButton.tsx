"use client";

import { useState } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorite: boolean;
  isLoggedIn: boolean;
}

export default function FavoriteButton({
  recipeId,
  initialIsFavorite,
  isLoggedIn,
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    const newState = !isFavorite;
    setIsFavorite(newState);
    setIsLoading(true);

    const result = await toggleFavoriteAction(recipeId, !newState);

    if (result?.error) {
      setIsFavorite(!newState);
    }

    setIsLoading(false);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isLoading}
      variant="outline"
      className={`
        gap-2 transition-all duration-300 border shadow-lg
        ${
          isFavorite
            ? "bg-pink-500/20 text-pink-500 border-pink-500/50 hover:bg-pink-500/30"
            : "bg-white/5 text-gray-400 border-white/10 hover:text-pink-400 hover:border-pink-500/30 hover:bg-white/10"
        }
      `}
    >
      <Heart
        size={20}
        className={`transition-all ${
          isFavorite ? "fill-current scale-110" : "scale-100"
        }`}
      />
      {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
    </Button>
  );
}
