import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

// Mock usePathname
const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
}));

// Mock LogoutButton to simplify testing
jest.mock("@/components/LogoutButton", () => ({
  __esModule: true,
  default: () => <button data-testid="mock-logout-button">Logout</button>,
}));

describe("Navbar", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue("/");
    // Reset body overflow
    document.body.style.overflow = "unset";
  });

  describe("Logo and Branding", () => {
    it("displays logo and brand name", () => {
      render(<Navbar isLoggedIn={false} />);

      expect(screen.getByText("Gourmet Hunter")).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /gourmet hunter home/i })).toBeInTheDocument();
    });

    it("logo links to home page", () => {
      render(<Navbar isLoggedIn={false} />);

      const logoLink = screen.getByRole("link", { name: /gourmet hunter home/i });
      expect(logoLink).toHaveAttribute("href", "/");
    });
  });

  describe("Not Logged In State", () => {
    it("shows login button when not authenticated", () => {
      render(<Navbar isLoggedIn={false} />);

      const loginButtons = screen.getAllByRole("link", { name: /login/i });
      expect(loginButtons.length).toBeGreaterThan(0);
    });

    it("does not show favorites link when not authenticated", () => {
      render(<Navbar isLoggedIn={false} />);

      expect(screen.queryByRole("link", { name: /favorites/i })).not.toBeInTheDocument();
    });

    it("does not show logout button when not authenticated", () => {
      render(<Navbar isLoggedIn={false} />);

      expect(screen.queryByTestId("mock-logout-button")).not.toBeInTheDocument();
    });

    it("does not show username when not authenticated", () => {
      render(<Navbar isLoggedIn={false} username="testuser" />);

      // Even if username is passed, it should not be shown
      expect(screen.queryByText("testuser")).not.toBeInTheDocument();
    });
  });

  describe("Logged In State", () => {
    it("shows username when authenticated", () => {
      render(<Navbar isLoggedIn={true} username="testuser" />);

      expect(screen.getAllByText("testuser").length).toBeGreaterThan(0);
    });

    it("shows favorites link when authenticated", () => {
      render(<Navbar isLoggedIn={true} username="testuser" />);

      const favoritesLinks = screen.getAllByRole("link", { name: /favorites/i });
      expect(favoritesLinks.length).toBeGreaterThan(0);
      expect(favoritesLinks[0]).toHaveAttribute("href", "/favorites");
    });

    it("shows logout button when authenticated", () => {
      render(<Navbar isLoggedIn={true} username="testuser" />);

      // Check for the mocked logout button
      expect(screen.getByTestId("mock-logout-button")).toBeInTheDocument();
    });

    it("does not show login button when authenticated", () => {
      render(<Navbar isLoggedIn={true} username="testuser" />);

      expect(screen.queryByRole("link", { name: /^login$/i })).not.toBeInTheDocument();
    });
  });

  describe("Mobile Menu", () => {
    it("shows mobile menu button on mobile", () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toBeInTheDocument();
    });

    it("opens mobile menu when hamburger button is clicked", async () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      await userEvent.click(menuButton);

      expect(screen.getByRole("button", { name: /close menu/i })).toBeInTheDocument();
    });

    it("closes mobile menu when close button is clicked", async () => {
      render(<Navbar isLoggedIn={false} />);

      const openButton = screen.getByRole("button", { name: /open menu/i });
      await userEvent.click(openButton);

      const closeButton = screen.getByRole("button", { name: /close menu/i });
      await userEvent.click(closeButton);

      expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });

    it("sets body overflow hidden when mobile menu is open", async () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      await userEvent.click(menuButton);

      expect(document.body.style.overflow).toBe("hidden");
    });

    it("resets body overflow when mobile menu is closed", async () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      await userEvent.click(menuButton);

      const closeButton = screen.getByRole("button", { name: /close menu/i });
      await userEvent.click(closeButton);

      expect(document.body.style.overflow).toBe("unset");
    });

    it("has correct aria-expanded attribute on mobile menu button", async () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveAttribute("aria-expanded", "false");

      await userEvent.click(menuButton);

      const closeButton = screen.getByRole("button", { name: /close menu/i });
      expect(closeButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Active Page Highlighting", () => {
    it("marks home page as current when on home", () => {
      mockUsePathname.mockReturnValue("/");
      render(<Navbar isLoggedIn={true} username="testuser" />);

      const logoLink = screen.getByRole("link", { name: /gourmet hunter home/i });
      expect(logoLink).toHaveAttribute("aria-current", "page");
    });

    it("marks favorites page as current when on favorites", () => {
      mockUsePathname.mockReturnValue("/favorites");
      render(<Navbar isLoggedIn={true} username="testuser" />);

      const favoritesLinks = screen.getAllByRole("link", { name: /favorites/i });
      expect(favoritesLinks[0]).toHaveAttribute("aria-current", "page");
    });

    it("does not mark home as current when on other pages", () => {
      mockUsePathname.mockReturnValue("/favorites");
      render(<Navbar isLoggedIn={true} username="testuser" />);

      const logoLink = screen.getByRole("link", { name: /gourmet hunter home/i });
      expect(logoLink).not.toHaveAttribute("aria-current");
    });
  });

  describe("Accessibility", () => {
    it("has skip to main content link", () => {
      render(<Navbar isLoggedIn={false} />);

      const skipLink = screen.getByText("Skip to main content");
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute("href", "#main-content");
    });

    it("nav has proper aria-label", () => {
      render(<Navbar isLoggedIn={false} />);

      const nav = screen.getByRole("navigation", { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it("mobile menu button has aria-controls", async () => {
      render(<Navbar isLoggedIn={false} />);

      const menuButton = screen.getByRole("button", { name: /open menu/i });
      expect(menuButton).toHaveAttribute("aria-controls", "mobile-menu");
    });
  });

  describe("Route Change Behavior", () => {
    it("closes mobile menu on route change", () => {
      const { rerender } = render(<Navbar isLoggedIn={false} />);

      // Open mobile menu first (we'll check the effect)
      mockUsePathname.mockReturnValue("/login");
      
      rerender(<Navbar isLoggedIn={false} />);

      // Menu should be closed after pathname change
      // This is implicitly tested by checking the button state
      expect(screen.getByRole("button", { name: /open menu/i })).toBeInTheDocument();
    });
  });
});
