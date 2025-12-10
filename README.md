# 🥘 Gourmet Hunter

Une application moderne de gestion de recettes de cuisine, développée avec **Next.js**.

## ✨ Fonctionnalités

- **Catalogue de recettes** : Affichage performant via Server Side Rendering (SSR).
- **Détails dynamiques** : Pages de recettes avec instructions et méta-données (calories, temps).
- **Favoris** : Ajout et retrait de recettes en favoris.
- **Design Responsive** : Thème sombre, animations fluides et compatibilité mobile/desktop.

## 🛠 Stack Technique

- **Framework** : Next.js 15 (App Router)
- **Langage** : TypeScript
- **Style** : Tailwind CSS v4 + Shadcn/UI + Lucide Icons
- **Conteneurisation** : Docker

---

## 🐳 Déploiement Docker

L'application est conteneurisée pour être légère et sécurisée (mode `standalone` de Next.js).

### 1. Pré-requis

- Docker installé sur la machine.

### 2. Construction de l'image (Build)

L'image est construite sur une base `node:25-alpine`.

```bash
docker build -t eloidieme/the-recipe-app .
```

### 3\. Lancement du conteneur

L'application écoute sur le port **80** à l'intérieur du conteneur. Nous mappons ce port vers le port **80** de la machine hôte.

```bash
docker run -p 80:80 gourmet-hunter
```

L'application est maintenant accessible sur : **http://localhost**

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

3.  Ouvrir [http://localhost:3000](http://localhost:3000).

## 👤 Auteur

Projet réalisé par Eloi DIEME dans le cadre du cours d'Architecture Web (Theodo x CentraleSupelec).
