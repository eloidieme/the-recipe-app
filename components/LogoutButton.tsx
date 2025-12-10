"use client";
import { logoutAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  return (
    <Button
      onClick={() => logoutAction()}
      variant="ghost"
      className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
    >
      <LogOut size={18} className="mr-2" />
      Logout
    </Button>
  );
}
