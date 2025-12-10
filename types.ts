export interface CreateDosingParams {
  ingredient_id: string;
  quantity: number;
  recipe_id: string;
  unit: string;
}

export interface CreateIngredientParams {
  id: string;
  name: string;
  description: string;
  default_unit: string;
  category: string;
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

export interface CreateRecipeParams {
  id: string;
  name: string;
  category: string;
  cook_time: number;
  description: string;
  image_url: string;
  instructions: string;
  prep_time: number;
  published: boolean;
  servings: number;
  when_to_eat: string;
}

export interface UpdateRecipeParams {
  id: string;
  name: string;
  category: string;
  cook_time: number;
  description: string;
  image_url: string;
  instructions: string;
  prep_time: number;
  published: boolean;
  servings: number;
  when_to_eat: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  full_name: string;
  username: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface TokenResponse {
  token: string;
}

export interface User {
  email: string;
  full_name: string;
  username: string;
  encrypted_password: string;
  created_at: string;
}

export interface UserFavorite {
  recipe_id: string;
  username: string;
}

export interface UsersRecipeFavorite {
  recipe_id: string;
  username: string;
  created_at: string;
}

export interface Recipe {
  id: string;
  name: string;
  calories: number;
  category: string;
  cook_time: number;
  cost: number;
  created_at: string;
  created_by: string;
  description: string;
  disclaimer: string;
  image_url: string;
  instructions: string;
  prep_time: number;
  published: boolean;
  servings: number;
  when_to_eat: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  created_at: string;
  default_unit: string;
  category: string;
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

export interface RecipeIngredient extends Ingredient {
  quantity: number;
  unit: string;
}