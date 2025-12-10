# 🥘 Gourmet Hunter

Une application moderne de gestion de recettes de cuisine, développée avec **Next.js 15 (App Router)**.
Ce projet propose une interface immersive "Dark Leaves" (Glassmorphism) et une architecture optimisée pour la performance et la sécurité.

## ✨ Fonctionnalités

- **Catalogue de recettes** : Affichage performant via Server Side Rendering (SSR).
- **Détails dynamiques** : Pages de recettes avec gestion des instructions et méta-données (calories, temps).
- **Authentification Sécurisée** : Login via **Server Actions** et gestion de session par Cookies HTTPOnly.
- **Favoris** : Ajout et retrait de recettes en favoris avec mise à jour optimiste de l'UI (Client Components).
- **Design Responsive** : Thème sombre, animations fluides et compatibilité mobile/desktop.

## 🛠 Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4 + Shadcn/UI + Lucide Icons
- **Conteneurisation** : Docker (Multi-stage build)

---

## 🐳 Déploiement Docker

L'application est conteneurisée pour être légère et sécurisée (mode `standalone` de Next.js).

### 1. Pré-requis

- Docker installé sur la machine.

### 2. Construction de l'image (Build)

L'image est construite sur une base `node:18-alpine` optimisée.

```bash
docker build -t gourmet-hunter .
```

_Note : Si vous êtes sur un Mac (Apple Silicon) et que vous devez livrer pour un serveur Linux standard, utilisez :_
`docker build --platform linux/amd64 -t gourmet-hunter .`

### 3\. Lancement du conteneur

L'application écoute sur le port **8080** à l'intérieur du conteneur (pour respecter la contrainte d'exécution **non-root**). Nous mappons ce port vers le port **80** de la machine hôte.

```bash
docker run -p 80:8080 gourmet-hunter
```

L'application est maintenant accessible sur : **http://localhost**

---

## ✅ Respect des Contraintes du Projet

1.  **Utilisation de Docker** : Image construite via un `Dockerfile` multi-stage.
2.  **Architecture** : Utilisation de Next.js App Router (Server Components & Server Actions).
3.  **Port 80** : Accessible via mapping de port (`-p 80:8080`).
4.  **Non-root (Security)** : L'application tourne avec l'utilisateur `nextjs` (UID 1001) et non `root`.
5.  **Architecture AMD64** : Compatible avec les environnements Linux standards.

---

## 💻 Installation Locale (Développement)

Si vous souhaitez lancer le projet sans Docker pour le modifier :

1.  Installer les dépendances :

    ```bash
    npm install
    ```

2.  Lancer le serveur de développement :

    ```bash
    npm run dev
    ```

3.  Ouvrir [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).

---

## 🎨 Choix de Design

- **Thème "Dark Leaves"** : Utilisation de dégradés verts profonds et d'un pattern SVG "feuilles" en arrière-plan (fixé via pseudo-élément pour compatibilité Safari).
- **Glassmorphism** : Les cartes utilisent `backdrop-blur` et des bordures semi-transparentes pour créer un effet de profondeur.
- **Feedback Utilisateur** : Boutons interactifs avec états de chargement et animations au clic (ex: Cœur des favoris).

## 👤 Auteur

Projet réalisé dans le cadre du cours d'Architecture Web.
