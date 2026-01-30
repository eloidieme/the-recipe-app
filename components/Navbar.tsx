"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChefHat, Heart, LogIn, Menu, X, User } from "lucide-react";
import LogoutButton from "./LogoutButton";

interface NavbarProps {
  isLoggedIn: boolean;
  username?: string | null;
}

export default function Navbar({ isLoggedIn, username }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded"
      >
        Skip to main content
      </a>

      <header>
        <nav
          className="sticky top-0 z-50 w-full border-b border-white/10 bg-emerald-950/20 backdrop-blur-md"
          aria-label="Main navigation"
        >
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              aria-label="Gourmet Hunter home"
              aria-current={isActive("/") ? "page" : undefined}
            >
              <ChefHat size={28} aria-hidden="true" />
              <span className="text-xl font-bold tracking-tight text-white">
                Gourmet Hunter
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
              {isLoggedIn && (
                <Button
                  asChild
                  variant="ghost"
                  className="text-emerald-100 hover:text-white hover:bg-emerald-500/20"
                  aria-current={isActive("/favorites") ? "page" : undefined}
                >
                  <Link href="/favorites">
                    <Heart size={20} className="mr-2" aria-hidden="true" />
                    Favorites
                  </Link>
                </Button>
              )}

              {isLoggedIn && username && (
                <>
                  <hr
                    className="h-6 w-px bg-white/10 border-0"
                    aria-orientation="vertical"
                  />
                  <div className="flex items-center gap-2 text-emerald-100 text-sm">
                    <User size={16} aria-hidden="true" />
                    <span>{username}</span>
                  </div>
                </>
              )}

              <hr
                className="h-6 w-px bg-white/10 border-0"
                aria-orientation="vertical"
              />

              {isLoggedIn ? (
                <LogoutButton />
              ) : (
                <Button
                  asChild
                  className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20"
                >
                  <Link href="/login">
                    <LogIn size={18} className="mr-2" aria-hidden="true" />
                    Login
                  </Link>
                </Button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-emerald-400 hover:text-emerald-300 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div
              id="mobile-menu"
              className="md:hidden fixed inset-0 top-16 bg-emerald-950/95 backdrop-blur-md z-40"
            >
              <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
                {isLoggedIn && username && (
                  <div className="flex items-center gap-2 text-emerald-100 p-3 bg-emerald-900/20 rounded-lg border border-white/10">
                    <User size={20} aria-hidden="true" />
                    <span className="font-medium">{username}</span>
                  </div>
                )}

                {isLoggedIn && (
                  <Button
                    asChild
                    variant="ghost"
                    className="justify-start text-emerald-100 hover:text-white hover:bg-emerald-500/20 h-12"
                    aria-current={isActive("/favorites") ? "page" : undefined}
                  >
                    <Link href="/favorites">
                      <Heart size={20} className="mr-2" aria-hidden="true" />
                      Favorites
                    </Link>
                  </Button>
                )}

                <hr className="border-white/10" />

                {isLoggedIn ? (
                  <div className="w-full">
                    <LogoutButton />
                  </div>
                ) : (
                  <Button
                    asChild
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-900/20 h-12"
                  >
                    <Link href="/login">
                      <LogIn size={18} className="mr-2" aria-hidden="true" />
                      Login
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Main content anchor */}
      <div id="main-content" />
    </>
  );
}
