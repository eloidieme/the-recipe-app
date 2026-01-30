import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FavoriteButton from "@/components/FavoriteButton";
import { toggleFavoriteAction } from "@/app/actions";

// Mock the server action
jest.mock("@/app/actions", () => ({
  toggleFavoriteAction: jest.fn(),
}));

// Get mocked router
const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: mockPush,
      refresh: mockRefresh,
      pathname: "/",
    };
  },
}));

describe("FavoriteButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders with initial favorite state (saved)", () => {
      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={true}
          isLoggedIn={true}
        />,
      );

      expect(screen.getByRole("button", { pressed: true })).toBeInTheDocument();
      expect(screen.getByText("Saved to Favorites")).toBeInTheDocument();
    });

    it("renders with initial non-favorite state", () => {
      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      expect(
        screen.getByRole("button", { pressed: false }),
      ).toBeInTheDocument();
      expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
    });

    it("has correct accessibility labels", () => {
      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Add to favorites");
      expect(button).toHaveAttribute("aria-pressed", "false");
    });

    it("updates accessibility label when favorited", () => {
      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={true}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Remove from favorites");
      expect(button).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Not Logged In", () => {
    it("redirects to login when clicked and not logged in", async () => {
      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={false}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(toggleFavoriteAction).not.toHaveBeenCalled();
    });
  });

  describe("Toggle Favorite", () => {
    it("toggles favorite on click (add to favorites)", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({ success: true });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(toggleFavoriteAction).toHaveBeenCalledWith("123", false);
      });
    });

    it("toggles favorite on click (remove from favorites)", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({ success: true });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={true}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(toggleFavoriteAction).toHaveBeenCalledWith("123", true);
      });
    });

    it("performs optimistic update", async () => {
      (toggleFavoriteAction as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100),
          ),
      );

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      // Should immediately show "Saved to Favorites" (optimistic update)
      expect(screen.getByText("Saved to Favorites")).toBeInTheDocument();
    });

    it("refreshes router on successful toggle", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({ success: true });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockRefresh).toHaveBeenCalled();
      });
    });
  });

  describe("Error Handling", () => {
    it("rolls back optimistic update on error", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({
        error: "Failed to update favorite",
      });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText("Add to Favorites")).toBeInTheDocument();
      });
    });

    it("displays error message on failure", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({
        error: "Failed to update favorite",
      });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
          screen.getByText("Failed to update favorite"),
        ).toBeInTheDocument();
      });
    });

    it("redirects to login on unauthorized error", async () => {
      (toggleFavoriteAction as jest.Mock).mockResolvedValue({
        error: "Unauthorized",
      });

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Loading State", () => {
    it("shows loading spinner during transition", async () => {
      (toggleFavoriteAction as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 500),
          ),
      );

      render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      const button = screen.getByRole("button");
      await userEvent.click(button);

      // Check if button is disabled during loading
      expect(button).toBeDisabled();
    });
  });

  describe("State Sync", () => {
    it("syncs with parent state changes", () => {
      const { rerender } = render(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={false}
          isLoggedIn={true}
        />,
      );

      expect(screen.getByText("Add to Favorites")).toBeInTheDocument();

      rerender(
        <FavoriteButton
          recipeId="123"
          initialIsFavorite={true}
          isLoggedIn={true}
        />,
      );

      expect(screen.getByText("Saved to Favorites")).toBeInTheDocument();
    });
  });
});
