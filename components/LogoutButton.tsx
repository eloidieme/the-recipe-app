"use client";

import { useState, useTransition } from "react";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from "lucide-react";

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition();
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    setShowConfirm(true);
  };

  const confirmLogout = () => {
    setError(null);
    setShowConfirm(false);

    startTransition(async () => {
      try {
        await logoutAction();
      } catch (err) {
        console.error("Logout error:", err);
        setError("Failed to log out. Please try again.");

        // Clear error after 3 seconds
        setTimeout(() => setError(null), 3000);
      }
    });
  };

  const cancelLogout = () => {
    setShowConfirm(false);
  };

  return (
    <div className="relative">
      <Button
        onClick={handleLogout}
        disabled={isPending}
        variant="ghost"
        aria-label="Log out of your account"
        className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
      >
        {isPending ? (
          <Loader2 size={18} className="mr-2 animate-spin" aria-hidden="true" />
        ) : (
          <LogOut size={18} className="mr-2" aria-hidden="true" />
        )}
        {isPending ? "Logging out..." : "Logout"}
      </Button>

      {showConfirm && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={cancelLogout}
        >
          <div
            className="bg-gray-900 border border-white/10 rounded-lg p-6 max-w-sm mx-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-labelledby="logout-dialog-title"
            aria-describedby="logout-dialog-description"
          >
            <h2
              id="logout-dialog-title"
              className="text-xl font-bold text-white mb-2"
            >
              Confirm Logout
            </h2>
            <p
              id="logout-dialog-description"
              className="text-gray-400 mb-6"
            >
              Are you sure you want to log out of your account?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={cancelLogout}
                variant="outline"
                className="border-white/10 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmLogout}
                className="bg-red-600 hover:bg-red-500 text-white"
              >
                Yes, Logout
              </Button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-full mt-2 right-0 min-w-[200px]">
          <p
            role="alert"
            aria-live="polite"
            className="text-sm text-red-400 text-center bg-red-900/20 p-2 rounded border border-red-900/50"
          >
            {error}
          </p>
        </div>
      )}
    </div>
  );
}
