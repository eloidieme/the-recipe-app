import Link from "next/link";
import { cookies } from "next/headers";
import { Button } from "@/components/ui/button";
import { ChefHat, Heart, LogIn } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has("session_token");

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-emerald-950/20 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          <ChefHat size={28} />
          <span className="text-xl font-bold tracking-tight text-white">
            Gourmet Hunter
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/favorites">
            <Button
              variant="ghost"
              className="text-emerald-100 hover:text-white hover:bg-emerald-500/20"
            >
              <Heart size={20} className="mr-2" />
              Favorites
            </Button>
          </Link>

          <div className="h-6 w-px bg-white/10" />

          {isLoggedIn ? (
            <LogoutButton />
          ) : (
            <Link href="/login">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20">
                <LogIn size={18} className="mr-2" />
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
