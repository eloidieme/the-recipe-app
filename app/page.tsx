import Link from 'next/link';
import { Recipe } from '@/types';

async function getRecipes(): Promise<Recipe[]> {
  const res = await fetch('https://gourmet.cours.quimerch.com/recipes', { cache: 'no-store' , headers: {'Accept': 'application/json, application/xml'}});
  
  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }
  return res.json();
}

export default async function Home() {
  const recipes = await getRecipes();

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Recipes 🥘</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="border p-4 rounded shadow hover:shadow-lg transition">
            <h2 className="text-xl font-bold">{recipe.name}</h2>
            <p className="text-gray-600 truncate">{recipe.description}</p>
            <Link 
              href={`/recipes/${recipe.id}`} 
              className="text-blue-500 mt-2 inline-block hover:underline"
            >
              See recipe &rarr;
            </Link>
          </div>
        ))}
      </div>
    </main>
  );
}