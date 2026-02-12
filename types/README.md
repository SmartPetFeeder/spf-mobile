# Types TypeScript - Smart Pet Feeder

Ce dossier centralise toutes les interfaces et types TypeScript utilisés dans l'application Smart Pet Feeder.

## 📋 Structure

Le fichier `index.ts` contient tous les types organisés par catégorie :

### 🔐 User & Authentication Types

- **User** : Profil utilisateur de l'application
- **AuthContextType** : Interface pour le contexte d'authentification

### 🐾 Animal Types

- **Animal** : Données complètes d'un animal
- **AnimalType** : Type d'animal (chien, chat, etc.)
- **AnimalBreed** : Race d'animal

### 📦 Distributor Types

- **Distributor** : Distributeur de nourriture
- **DistributorSettings** : Paramètres de configuration d'un distributeur

### 🍽️ Meal Types

- **Meal** : Repas planifié ou distribué

### 📊 Statistics Types

- **Statistic** : Données statistiques pour l'analyse
- **CurrentStats** : Statistiques agrégées pour l'affichage

### 🔔 Notification Types

- **Notification** : Notification système

### 🛠️ Form & UI Types

- **FormData** : Données de formulaire générique
- **SelectOption** : Option de sélection pour les listes déroulantes

### 🌐 API Response Types

- **ApiResponse** : Format de réponse API standard
- **PaginatedResponse** : Réponse paginée de l'API

## 💡 Utilisation

### Import simple

```typescript
import { Animal, User, Distributor } from '@/types';
```

### Exemple d'utilisation

```typescript
import { Animal, Meal } from '@/types';
import { useState } from 'react';

export default function MyComponent() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);

  // ... votre code
}
```

### Types génériques

```typescript
import { ApiResponse } from '@/types';

async function fetchData(): Promise<ApiResponse<Animal[]>> {
  const response = await api.get('/animals');
  return response.data;
}
```

## ✅ Avantages

1. **Centralisation** : Un seul endroit pour définir tous les types
2. **Réutilisabilité** : Évite la duplication des interfaces
3. **Maintenabilité** : Modifications propagées automatiquement partout
4. **Cohérence** : Structure de données unifiée dans tout le projet
5. **Auto-complétion** : Meilleure expérience de développement avec IntelliSense

## 🔄 Flexibilité des IDs

Les types utilisent `string | number` pour les IDs afin de supporter différents backends :

- **number** : Pour les bases de données SQL (MySQL, PostgreSQL)
- **string** : Pour les bases de données NoSQL (MongoDB) ou les UUIDs

```typescript
interface Animal {
  id: string | number; // Flexible selon le backend
  // ...
}
```

## 📝 Bonnes pratiques

1. **Toujours importer depuis `@/types`** au lieu de redéfinir les interfaces
2. **Utiliser `Partial<Type>`** pour les mises à jour partielles
3. **Étendre les types** si vous avez besoin de propriétés supplémentaires :

```typescript
import { Animal } from '@/types';

interface ExtendedAnimal extends Animal {
  customField: string;
}
```

4. **Créer de nouveaux types** dans ce fichier s'ils sont utilisés dans plusieurs composants

## 🚀 Ajout de nouveaux types

Pour ajouter un nouveau type :

1. Ouvrir `types/index.ts`
2. Ajouter l'interface dans la section appropriée
3. Exporter l'interface avec `export interface`
4. Mettre à jour cette documentation si nécessaire

## 📚 Ressources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
