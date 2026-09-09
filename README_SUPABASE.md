# 🌿 Guide de Setup Supabase — Mawada Parapharmacie

Ce guide vous explique comment configurer Supabase pas-à-pas pour activer le panneau d'administration.

---

## Étape 1 — Créer un projet Supabase

1. Allez sur [https://supabase.com](https://supabase.com) et cliquez **"Start your project"**
2. Connectez-vous avec GitHub ou créez un compte email
3. Cliquez **"New project"**
4. Remplissez :
   - **Organization** : votre organisation (ou créez-en une)
   - **Name** : `mawada-parapharmacie`
   - **Database Password** : choisissez un mot de passe fort (notez-le !)
   - **Region** : `West EU (Ireland)` *(le plus proche de la Tunisie)*
5. Cliquez **"Create new project"** — attendez 1-2 minutes

---

## Étape 2 — Récupérer vos clés API

1. Dans votre projet Supabase, allez dans **Settings** (⚙️) → **API**
2. Notez ces deux valeurs :
   - **Project URL** → c'est votre `VITE_SUPABASE_URL`
   - **anon public** (sous "Project API keys") → c'est votre `VITE_SUPABASE_ANON_KEY`

> ⚠️ **IMPORTANT** : N'utilisez JAMAIS la clé `service_role` dans le code front-end. Seule la clé `anon` est autorisée côté client.

3. Ouvrez le fichier `.env.local` à la racine du projet et remplacez les placeholders :

```
VITE_SUPABASE_URL=https://VOTRE_ID.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Étape 3 — Créer les tables (schema SQL)

1. Dans votre projet Supabase, allez dans **SQL Editor** (icône terminal)
2. Cliquez **"New query"**
3. Copiez-collez le contenu du fichier `supabase/schema.sql`
4. Cliquez **"Run"** (▶️)
5. Vérifiez dans **Table Editor** que les tables `products`, `orders`, `site_content` sont créées

---

## Étape 4 — Créer le bucket Storage pour les images

1. Dans votre projet Supabase, allez dans **Storage**
2. Cliquez **"New bucket"**
3. Remplissez :
   - **Name** : `product-images`
   - **Public bucket** : ✅ Activé (les images doivent être accessibles publiquement)
4. Cliquez **"Create bucket"**

---

## Étape 5 — Migrer le catalogue existant (une seule fois)

> Prérequis : Node.js installé sur votre machine, et `.env.local` rempli.

Ouvrez un terminal dans le dossier du projet et lancez :

```bash
node supabase/seed.js
```

Ce script va importer les 18 produits existants dans la table `products` de Supabase.

---

## Étape 6 — Créer le compte administrateur

1. Dans votre projet Supabase, allez dans **Authentication** → **Users**
2. Cliquez **"Add user"** → **"Create new user"**
3. Entrez l'email et le mot de passe de la propriétaire
4. Cliquez **"Create user"**

> 💡 Ce sera le seul compte qui peut accéder à `/admin`. Il n'y a pas d'inscription publique.

---

## Étape 7 — Lancer le projet

```bash
npm run dev
```

Puis :
- Ouvrez [http://localhost:5173](http://localhost:5173) pour le site public
- Ouvrez [http://localhost:5173/admin](http://localhost:5173/admin) pour le panneau admin

---

## Résumé des accès

| Qui | Accès |
|-----|-------|
| Visiteurs du site | Lecture produits actifs, écriture commandes uniquement |
| Administratrice | Tout gérer via `/admin` (login requis) |
| Clé `anon` (front-end) | Limitée par les règles RLS ci-dessus |
| Clé `service_role` | **Jamais exposée côté client** |
