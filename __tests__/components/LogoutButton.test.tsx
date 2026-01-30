import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LogoutButton from "@/components/LogoutButton";
import { logoutAction } from "@/app/actions";

// Mock the server action
jest.mock("@/app/actions", () => ({
  logoutAction: jest.fn(),
}));

describe("LogoutButton", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("renders logout button correctly", () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      expect(button).toBeInTheDocument();
      expect(screen.getByText("Logout")).toBeInTheDocument();
    });

    it("has correct accessibility label", () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-label", "Log out of your account");
    });
  });

  describe("Confirmation Dialog", () => {
    it("shows confirmation dialog on click", async () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(button);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Confirm Logout")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to log out of your account?"),
      ).toBeInTheDocument();
    });

    it("shows Cancel and Yes, Logout buttons in dialog", async () => {
      render(<LogoutButton />);

      const button = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(button);

      expect(
        screen.getByRole("button", { name: "Cancel" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Yes, Logout" }),
      ).toBeInTheDocument();
    });

    it("closes dialog when Cancel is clicked", async () => {
      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await userEvent.click(cancelButton);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("closes dialog when clicking outside (on overlay)", async () => {
      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Click on the overlay (the outer div)
      const overlay = screen.getByRole("dialog").parentElement;
      if (overlay) {
        fireEvent.click(overlay);
      }

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Logout Action", () => {
    it("calls logout action on confirmation", async () => {
      (logoutAction as jest.Mock).mockResolvedValue(undefined);

      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      const confirmButton = screen.getByRole("button", { name: "Yes, Logout" });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(logoutAction).toHaveBeenCalled();
      });
    });

    it("does not call logout action when cancelled", async () => {
      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      const cancelButton = screen.getByRole("button", { name: "Cancel" });
      await userEvent.click(cancelButton);

      expect(logoutAction).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("shows loading state during logout", async () => {
      (logoutAction as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
      );

      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      const confirmButton = screen.getByRole("button", { name: "Yes, Logout" });
      await userEvent.click(confirmButton);

      // The main button should show loading state
      await waitFor(() => {
        expect(screen.getByText("Logging out...")).toBeInTheDocument();
      });
    });

    it("disables button during logout", async () => {
      (logoutAction as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 500)),
      );

      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      const confirmButton = screen.getByRole("button", { name: "Yes, Logout" });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        const button = screen.getByRole("button", {
          name: /log out of your account/i,
        });
        expect(button).toBeDisabled();
      });
    });
  });

  describe("Error Handling", () => {
    it("displays error message on failure", async () => {
      (logoutAction as jest.Mock).mockRejectedValue(new Error("Logout failed"));

      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await userEvent.click(logoutButton);

      const confirmButton = screen.getByRole("button", { name: "Yes, Logout" });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(
          screen.getByText("Failed to log out. Please try again."),
        ).toBeInTheDocument();
      });
    });

    it("clears error after timeout", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      (logoutAction as jest.Mock).mockRejectedValue(new Error("Logout failed"));

      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await user.click(logoutButton);

      const confirmButton = screen.getByRole("button", { name: "Yes, Logout" });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });

      // Fast-forward 3 seconds
      jest.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      });

      jest.useRealTimers();
    }, 10000);
  });

  describe("Accessibility", () => {
    it("dialog has proper ARIA attributes", async () => {
      const user = userEvent.setup();
      render(<LogoutButton />);

      const logoutButton = screen.getByRole("button", {
        name: /log out of your account/i,
      });
      await user.click(logoutButton);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby", "logout-dialog-title");
      expect(dialog).toHaveAttribute(
        "aria-describedby",
        "logout-dialog-description",
      );
    });
  });
});
