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
- **Tests** : Jest + Testing Library
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

Le projet dispose d'une suite de tests couvrant les composants et les actions serveur.

### Lancer les tests

```bash
# Lancer tous les tests
npm test

# Mode watch (relance automatique)
npm run test:watch

# Avec rapport de couverture
npm run test:coverage
```

### Structure des tests

```
__tests__/
  actions/          # Tests des server actions (login, logout, favoris)
  components/       # Tests unitaires des composants React
  integration/      # Tests d'intégration (formulaires, flux)
```

---

## Intégration Continue

Le projet utilise GitHub Actions pour automatiser les vérifications à chaque push et pull request :

1. **Lint** : Vérification du style de code
2. **Type Check** : Validation TypeScript
3. **Tests Unitaires** : Exécution de Jest avec rapport de couverture
4. **Build** : Construction de l'application

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
