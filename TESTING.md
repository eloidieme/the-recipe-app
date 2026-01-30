# Testing and CI Guide

This guide describes the steps needed to add comprehensive testing and continuous integration to the Gourmet Hunter project.

## Testing Setup

### 1. Install Testing Dependencies

```bash
# Unit and Integration Testing
npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom

# End-to-End Testing
npm install -D @playwright/test
```

### 2. Configure Jest

Create `jest.config.js` in the project root:

```javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
```

### 3. Create Jest Setup File

Create `jest.setup.js`:

```javascript
import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      refresh: jest.fn(),
      pathname: '/',
    }
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Image component
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />
  },
}))
```

### 4. Add Test Scripts

Update `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 5. Configure Playwright

Initialize Playwright:

```bash
npx playwright install
```

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## What to Test

### Unit Tests (`__tests__/` directory)

#### Components

**`__tests__/components/FavoriteButton.test.tsx`**
- Renders correctly with initial favorite state
- Toggles favorite state on click
- Shows loading spinner during transition
- Handles errors and displays error messages
- Redirects to login when not authenticated
- Performs optimistic updates

**`__tests__/components/LogoutButton.test.tsx`**
- Shows confirmation dialog on click
- Calls logout action on confirmation
- Cancels logout on cancel button
- Displays error messages on failure
- Shows loading state during logout

**`__tests__/components/Navbar.test.tsx`**
- Displays logo and navigation links
- Shows login button when not authenticated
- Shows username and logout when authenticated
- Opens/closes mobile menu
- Highlights active page
- Renders favorites link only when logged in

#### Server Actions

**`__tests__/actions/loginAction.test.ts`**
- Validates input (username, password)
- Returns error for invalid credentials
- Sets cookies on successful login
- Implements rate limiting
- Handles network errors

**`__tests__/actions/toggleFavoriteAction.test.ts`**
- Adds recipe to favorites
- Removes recipe from favorites
- Returns error when not authenticated
- Handles API errors gracefully

### Integration Tests

**`__tests__/integration/login.test.tsx`**
- Complete login flow from form to redirect
- Error message display and clearing
- Password visibility toggle
- Form validation

**`__tests__/integration/recipe-detail.test.tsx`**
- Recipe data fetching and display
- Favorite button integration
- Not found handling
- Protected content visibility

**`__tests__/integration/favorites-page.test.tsx`**
- Displays favorite recipes
- Shows empty state when no favorites
- Redirects to login when not authenticated
- Correctly parses nested API response

### E2E Tests (`e2e/` directory)

**`e2e/user-journey.spec.ts`**
- Complete user journey:
  1. Visit home page and browse recipes
  2. Navigate to login page
  3. Submit login form with valid credentials
  4. Browse and view recipe details
  5. Add recipes to favorites
  6. Navigate to favorites page
  7. Remove recipes from favorites
  8. Logout successfully

**`e2e/error-scenarios.spec.ts`**
- Invalid login attempts
- Network failures and error handling
- Unauthorized access to protected routes
- API error responses

**`e2e/accessibility.spec.ts`**
- Keyboard navigation
- Screen reader compatibility
- Focus management
- ARIA attributes

## CI Setup (GitHub Actions)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run linter
        run: npm run lint

      - name: Run type check
        run: npx tsc --noEmit

      - name: Run unit tests
        run: npm run test:coverage

      - name: Build project
        run: npm run build
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Install Playwright browsers
        run: npx playwright install --with-deps

      - name: Run E2E tests
        run: npm run test:e2e
        env:
          NEXT_PUBLIC_API_URL: ${{ secrets.NEXT_PUBLIC_API_URL }}

      - name: Upload test coverage
        uses: codecov/codecov-action@v4
        if: always()
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

      - name: Upload Playwright report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Setting Up GitHub Secrets

Add the following secrets in your GitHub repository settings:

1. `NEXT_PUBLIC_API_URL` - Your API base URL
2. `CODECOV_TOKEN` (optional) - For coverage reporting

Navigate to: **Repository Settings → Secrets and variables → Actions → New repository secret**

## Implementation Order

Follow this order for efficient implementation:

### Phase 1: Foundation (Week 1)
1. Install all testing dependencies
2. Configure Jest and Playwright
3. Write unit tests for utility functions and simple components
4. Set up basic GitHub Actions workflow

### Phase 2: Component Testing (Week 2)
1. Test all interactive components (FavoriteButton, LogoutButton, Navbar)
2. Test forms and validation (Login page)
3. Mock server actions and API calls
4. Achieve 70%+ coverage on components

### Phase 3: Integration Testing (Week 3)
1. Test complete flows (login → browse → favorites)
2. Test data fetching and caching behavior
3. Test error handling and edge cases
4. Test protected routes and authentication

### Phase 4: E2E Testing (Week 4)
1. Write critical user journey tests
2. Add error scenario tests
3. Add accessibility tests
4. Configure CI to run E2E tests

### Phase 5: Optimization (Ongoing)
1. Improve coverage to 80%+
2. Add performance testing
3. Add visual regression testing (optional)
4. Monitor and improve test reliability

## Key Testing Principles

### Authentication
- Test login/logout flows completely
- Mock JWT tokens appropriately
- Test protected route access
- Verify cookie handling

### State Management
- Test optimistic updates (FavoriteButton)
- Test error rollback behavior
- Test loading states
- Verify state synchronization

### Data Fetching
- Mock API responses
- Test error states and retries
- Test cache behavior
- Verify proper data transformation (favorites nesting)

### Forms
- Test validation logic
- Test error message display
- Test submission handling
- Test accessibility (ARIA attributes)

### UI States
- Loading spinners and skeletons
- Empty states
- Error messages
- Success feedback

### Accessibility
- ARIA attributes presence
- Keyboard navigation
- Focus management
- Screen reader compatibility

## Example Test Files

### Component Test Example

```typescript
// __tests__/components/FavoriteButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import FavoriteButton from '@/components/FavoriteButton'
import { toggleFavoriteAction } from '@/app/actions'

jest.mock('@/app/actions')

describe('FavoriteButton', () => {
  it('renders with initial favorite state', () => {
    render(
      <FavoriteButton
        recipeId="123"
        initialIsFavorite={true}
        isLoggedIn={true}
      />
    )

    expect(screen.getByRole('button', { pressed: true })).toBeInTheDocument()
    expect(screen.getByText('Saved to Favorites')).toBeInTheDocument()
  })

  it('toggles favorite on click', async () => {
    const mockToggle = jest.fn().mockResolvedValue({ success: true })
    ;(toggleFavoriteAction as jest.Mock).mockImplementation(mockToggle)

    render(
      <FavoriteButton
        recipeId="123"
        initialIsFavorite={false}
        isLoggedIn={true}
      />
    )

    const button = screen.getByRole('button')
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockToggle).toHaveBeenCalledWith("123", false)
    })
  })
})
```

### E2E Test Example

```typescript
// e2e/user-journey.spec.ts
import { test, expect } from '@playwright/test'

test('complete user journey', async ({ page }) => {
  // Visit home page
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Gourmet Hunter' })).toBeVisible()

  // Navigate to login
  await page.getByRole('link', { name: 'Login' }).click()
  await expect(page).toHaveURL('/login')

  // Login
  await page.getByLabel('Username').fill('testuser')
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Login' }).click()

  // Should redirect to home
  await expect(page).toHaveURL('/')
  await expect(page.getByText('testuser')).toBeVisible()

  // Add to favorites
  const firstRecipe = page.locator('article').first()
  await firstRecipe.getByRole('link', { name: 'See recipe' }).click()
  await page.getByRole('button', { name: 'Add to favorites' }).click()
  await expect(page.getByText('Saved to Favorites')).toBeVisible()

  // View favorites
  await page.getByRole('link', { name: 'Favorites' }).click()
  await expect(page).toHaveURL('/favorites')
  await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible()

  // Logout
  await page.getByRole('button', { name: 'Logout' }).click()
  await page.getByRole('button', { name: 'Yes, Logout' }).click()
  await expect(page).toHaveURL('/login')
})
```

## Coverage Goals

Target these coverage percentages:

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

Focus on critical paths:
- Authentication flows (100% coverage)
- Server actions (90% coverage)
- Interactive components (85% coverage)
- Pages (75% coverage)

## Continuous Improvement

### Regular Tasks
- Review test failures immediately
- Update tests when features change
- Monitor test execution time
- Refactor slow or flaky tests
- Keep dependencies updated

### Quality Metrics
- Test execution time < 5 minutes
- E2E test pass rate > 95%
- Zero flaky tests
- Code coverage trend upward

## Resources

- [Next.js Testing Documentation](https://nextjs.org/docs/app/building-your-application/testing)
- [Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
