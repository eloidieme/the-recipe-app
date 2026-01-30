"use client";

import { useState, useEffect, useTransition } from "react";
import { toggleFavoriteAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Sync with parent state changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite);
  }, [initialIsFavorite]);

  const handleClick = async () => {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }

    // Clear any previous errors
    setError(null);

    // Store current state before optimistic update
    const currentState = isFavorite;
    const newState = !currentState;

    // Optimistic update
    setIsFavorite(newState);

    startTransition(async () => {
      const result = await toggleFavoriteAction(recipeId, currentState);

      if (result?.error) {
        // Rollback on error
        setIsFavorite(currentState);

        // Handle unauthorized error
        if (result.error === "Unauthorized") {
          router.push("/login");
          return;
        }

        // Show error message
        setError(result.error);

        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      } else {
        // Success - refresh server state
        router.refresh();
      }
    });
  };

  const buttonClassName = isFavorite
    ? "bg-pink-500/20 text-pink-500 border-pink-500/50 hover:bg-pink-500/30"
    : "bg-white/5 text-gray-400 border-white/10 hover:text-pink-400 hover:border-pink-500/30 hover:bg-white/10";

  return (
    <div className="space-y-2">
      <Button
        onClick={handleClick}
        disabled={isPending}
        variant="outline"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`gap-2 transition-all duration-300 border shadow-lg w-full ${buttonClassName}`}
      >
        {isPending ? (
          <Loader2 size={20} className="animate-spin" aria-hidden="true" />
        ) : (
          <Heart
            size={20}
            className={`transition-all ${
              isFavorite ? "fill-current scale-110" : "scale-100"
            }`}
            aria-hidden="true"
          />
        )}
        {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
      </Button>
      {error && (
        <p
          role="alert"
          aria-live="polite"
          className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded border border-red-900/50"
        >
          {error}
        </p>
      )}
    </div>
  );
}
