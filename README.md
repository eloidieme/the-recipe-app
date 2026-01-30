# Gourmet Hunter

Une application moderne de gestion de recettes de cuisine, développée avec Next.js.

## Fonctionnalités

- **Catalogue de recettes** : Affichage performant via Server Side Rendering (SSR).
- **Détails dynamiques** : Pages de recettes avec instructions et méta-données (calories, temps).
- **Favoris** : Ajout et retrait de recettes en favoris.
- **Design Responsive** : Thème sombre, animations fluides et compatibilité mobile/desktop.

## Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4 + Shadcn/UI + Lucide Icons
- **Tests** : Jest + Testing Library + Playwright
- **CI/CD** : GitHub Actions
- **Conteneurisation** : Docker

---

## Développement Local

### Pré-requis

- Node.js 20+
- npm

### Installation

```bash
npm install
```

### Lancer le serveur de développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Tests

Le projet dispose d'une suite de tests complète couvrant les composants, les actions serveur et les parcours utilisateur.

### Tests unitaires et d'intégration

```bash
# Lancer tous les tests
npm test

# Mode watch (relance automatique)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage
```

### Tests End-to-End (E2E)

Les tests E2E utilisent Playwright pour simuler de vrais parcours utilisateur dans un navigateur.

```bash
# Installer les navigateurs (première fois)
npx playwright install

# Lancer les tests E2E
npm run test:e2e

# Avec interface graphique
npm run test:e2e:ui
```

### Structure des tests

```
__tests__/
  actions/          # Tests des server actions (login, logout, favoris)
  components/       # Tests unitaires des composants React
  integration/      # Tests d'intégration (formulaires, flux)
e2e/
  user-journey.spec.ts      # Parcours utilisateur complet
  error-scenarios.spec.ts   # Gestion des erreurs
  accessibility.spec.ts     # Accessibilité et navigation clavier
```

---

## Intégration Continue

Le projet utilise GitHub Actions pour automatiser les vérifications à chaque push et pull request :

1. **Lint** : Vérification du style de code
2. **Type Check** : Validation TypeScript
3. **Tests Unitaires** : Exécution de Jest avec rapport de couverture
4. **Build** : Construction de l'application
5. **Tests E2E** : Exécution de Playwright

Pour que le CI fonctionne, ajoutez ces secrets dans les paramètres du repository GitHub :

- `NEXT_PUBLIC_API_URL` : URL de l'API backend

---

## Déploiement Docker

L'application est conteneurisée pour être légère et sécurisée (mode `standalone` de Next.js).

### Pré-requis

- Docker installé sur la machine.

### Construction de l'image

```bash
docker build -t eloidieme/the-recipe-app .
```

### Lancement du conteneur

L'application écoute sur le port 80 à l'intérieur du conteneur.

```bash
docker run -p 80:80 eloidieme/the-recipe-app
```

L'application est alors accessible sur [http://localhost](http://localhost).

---

## Auteur

Projet réalisé par Eloi Dieme dans le cadre du cours d'Architecture Web (Theodo x CentraleSupelec).
