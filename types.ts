/**
 * Represents a recipe in the application.
 * Used throughout the app for displaying recipe information.
 */
export interface Recipe {
  id: string;
  name: string;
  category: string;
  instructions: string;
  published: boolean;
  when_to_eat: string;
  /** Optional fields that may not be present in all API responses */
  calories?: number;
  cook_time?: number;
  cost?: number;
  created_at?: string;
  created_by?: string;
  description?: string;
  disclaimer?: string;
  image_url?: string | null;
  prep_time?: number;
  servings?: number;
}

/**
 * User login credentials.
 * Used in the login form and authentication flow.
 */
export interface LoginPayload {
  username: string;
  password: string;
}

/**
 * JWT token response from successful authentication.
 */
export interface TokenResponse {
  token: string;
}

/**
 * User information returned from the API.
 * Note: Does NOT include password for security.
 */
export interface User {
  email: string;
  full_name: string;
  username: string;
  created_at?: string;
}

/**
 * Ingredient information.
 * Used for recipe ingredients and admin functionality.
 */
export interface Ingredient {
  id: string;
  name: string;
  description: string;
  default_unit: string;
  category: string;
  created_at?: string;
  available_all_year: boolean;
  available_jan: boolean;
  available_feb: boolean;
  available_mar: boolean;
  available_apr: boolean;
  available_may: boolean;
  available_jun: boolean;
  available_jul: boolean;
  available_aug: boolean;
  available_sep: boolean;
  available_oct: boolean;
  available_nov: boolean;
  available_dec: boolean;
}

/**
 * HTTP error response structure from the API.
 * Used for handling and displaying error messages.
 */
export interface HTTPError {
  detail?: string | null;
  errors?: Array<{
    name?: string;
    reason?: string;
    more?: Record<string, unknown> | null;
  }> | null;
  instance?: string | null;
  status?: number | null;
  title?: string | null;
  type?: string | null;
}
