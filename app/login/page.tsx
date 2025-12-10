"use client";

import { useActionState } from "react";
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
import { ChefHat, Lock, User } from "lucide-react";

const initialState = {
  message: "",
};

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialState
  );

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
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="username"
                  name="username"
                  placeholder="GourmetHunter99"
                  required
                  className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-emerald-100">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="pl-10 bg-black/20 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-emerald-500"
                />
              </div>
            </div>

            {state?.message && (
              <p className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded border border-red-900/50">
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
              {isPending ? "Logging in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
