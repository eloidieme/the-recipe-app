import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      refresh: jest.fn(),
      pathname: "/",
      back: jest.fn(),
      forward: jest.fn(),
      prefetch: jest.fn(),
      replace: jest.fn(),
    };
  },
  usePathname() {
    return "/";
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  redirect: jest.fn(),
}));

// Mock Next.js Image component
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    const { priority, fill, ...rest } = props;
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...rest} data-priority={priority ? "true" : undefined} data-fill={fill ? "true" : undefined} />;
  },
}));

// Mock Next.js Link component
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string; [key: string]: unknown }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Global test utilities
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Suppress expected console.error during tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: unknown[]) => {
    const message = typeof args[0] === "string" ? args[0] : "";
    // Suppress expected errors in tests
    if (
      message.includes("Warning: ReactDOM.render") ||
      message.includes("Logout error:") ||
      message.includes("Login error:") ||
      message.includes("Failed to toggle favorite:") ||
      message.includes("Error toggling favorite:") ||
      message.includes("not wrapped in act")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});
