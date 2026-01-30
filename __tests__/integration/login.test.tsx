import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginPage from "@/app/login/page";

// Mock the loginAction
jest.mock("@/app/actions", () => ({
  loginAction: jest.fn(),
}));

// Mock useActionState to properly simulate the form state
let mockState: { message: string };
let mockIsPending: boolean;

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useActionState: jest.fn((action) => {
      const mockFormAction = async (formData: FormData) => {
        mockIsPending = true;
        const result = await action(mockState, formData);
        mockState = result || { message: "" };
        mockIsPending = false;
      };
      return [mockState, mockFormAction, mockIsPending];
    }),
  };
});

describe("LoginPage Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState = { message: "" };
    mockIsPending = false;
  });

  describe("Form Rendering", () => {
    it("renders login form with all elements", () => {
      render(<LoginPage />);

      expect(screen.getByText("Welcome Back")).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(document.getElementById("password")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i }),
      ).toBeInTheDocument();
    });

    it("has proper placeholders", () => {
      render(<LoginPage />);

      expect(
        screen.getByPlaceholderText("GourmetHunter99"),
      ).toBeInTheDocument();
    });

    it("has proper input attributes", () => {
      render(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      expect(usernameInput).toHaveAttribute("type", "text");
      expect(usernameInput).toHaveAttribute("name", "username");
      expect(usernameInput).toHaveAttribute("autocomplete", "username");
      expect(usernameInput).toHaveAttribute("minlength", "3");
      expect(usernameInput).toBeRequired();

      const passwordInput = document.getElementById("password");
      expect(passwordInput).toHaveAttribute("type", "password");
      expect(passwordInput).toHaveAttribute("name", "password");
      expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
      expect(passwordInput).toHaveAttribute("minlength", "6");
      expect(passwordInput).toBeRequired();
    });
  });

  describe("Password Visibility Toggle", () => {
    it("toggles password visibility when eye icon is clicked", async () => {
      render(<LoginPage />);

      const passwordInput = document.getElementById(
        "password",
      ) as HTMLInputElement;
      expect(passwordInput).toHaveAttribute("type", "password");

      const toggleButton = screen.getByRole("button", {
        name: /show password/i,
      });
      await userEvent.click(toggleButton);

      expect(passwordInput).toHaveAttribute("type", "text");

      const hideButton = screen.getByRole("button", { name: /hide password/i });
      await userEvent.click(hideButton);

      expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  describe("Form Input", () => {
    it("allows typing in username field", async () => {
      render(<LoginPage />);

      const usernameInput = screen.getByLabelText(/username/i);
      await userEvent.type(usernameInput, "testuser");

      expect(usernameInput).toHaveValue("testuser");
    });

    it("allows typing in password field", async () => {
      render(<LoginPage />);

      const passwordInput = document.getElementById(
        "password",
      ) as HTMLInputElement;
      await userEvent.type(passwordInput, "password123");

      expect(passwordInput).toHaveValue("password123");
    });
  });

  describe("Branding", () => {
    it("displays chef hat icon", () => {
      render(<LoginPage />);

      // The ChefHat icon should be rendered
      const iconContainer = document.querySelector(".bg-emerald-500\\/20");
      expect(iconContainer).toBeInTheDocument();
    });

    it("displays descriptive text", () => {
      render(<LoginPage />);

      expect(
        screen.getByText(
          "Enter your hunter credentials to access your recipes",
        ),
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has properly associated labels", () => {
      render(<LoginPage />);

      const usernameLabel = screen.getByText("Username");
      const passwordLabel = screen.getByText("Password");

      expect(usernameLabel).toHaveAttribute("for", "username");
      expect(passwordLabel).toHaveAttribute("for", "password");
    });

    it("password toggle has aria-label", () => {
      render(<LoginPage />);

      const toggleButton = screen.getByRole("button", {
        name: /show password/i,
      });
      expect(toggleButton).toHaveAttribute("aria-label");
    });
  });
});
