"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { loginAction } from "@/app/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChefHat, Lock, User, Eye, EyeOff, Loader2 } from "lucide-react";

const initialState = {
  message: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Set page title
  useEffect(() => {
    document.title = "Login | Gourmet Hunter";
  }, []);

  // Clear password and focus username on error
  useEffect(() => {
    if (state?.message) {
      if (passwordRef.current) {
        passwordRef.current.value = "";
      }
      if (usernameRef.current) {
        usernameRef.current.focus();
      }
    }
  }, [state?.message]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-md border-white/10 shadow-2xl shadow-emerald-900/50">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-500/20 rounded-full text-emerald-400">
              <ChefHat size={40} />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-gray-400">
            Enter your hunter credentials to access your recipes
          </CardDescription>
        </CardHeader>

        <form action={formAction}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-emerald-100">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                <Input
                  ref={usernameRef}
                  id="username"
                  name="username"
                  type="text"
                  placeholder="GourmetHunter99"
                  required
                  autoComplete="username"
                  minLength={3}
                  className={`pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-emerald-500 ${
                    state?.message ? "border-red-500/50 focus-visible:ring-red-500" : ""
                  }`}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-100">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" aria-hidden="true" />
                <Input
                  ref={passwordRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  minLength={6}
                  className={`pl-10 pr-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-emerald-500 ${
                    state?.message ? "border-red-500/50 focus-visible:ring-red-500" : ""
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-emerald-400 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {state?.message && (
              <p
                role="alert"
                aria-live="polite"
                className="text-sm text-red-400 text-center bg-red-900/20 p-3 rounded border border-red-900/50 font-medium"
              >
                {state.message}
              </p>
            )}
          </CardContent>

          <CardFooter className="pt-6">
            <Button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 shadow-lg shadow-emerald-900/20"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
