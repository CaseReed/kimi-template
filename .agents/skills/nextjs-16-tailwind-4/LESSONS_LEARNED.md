# Lessons Learned - Dashboard Implementation

Ce document récapitule tous les problèmes rencontrés et leurs solutions lors de l'implémentation du dashboard.

---

## 🚨 Problèmes Critiques

### 1. Hydration Error avec Motion dans les Tables

**Problème:**
```tsx
// ❌ ERREUR - Hydration failed
<tbody>
  <motion.div> {/* div cannot be child of tbody */}
    {rows.map(row => <tr>...</tr>)}
  </motion.div>
</tbody>
```

**Solution:**
```tsx
// ✅ CORRECT - Animer les tr directement
<tbody>
  {rows.map((row, index) => (
    <motion.tr
      key={row.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      ...
    </motion.tr>
  ))}
</tbody>
```

**Pourquoi:** HTML table elements ont des règles strictes de parent-enfant. `motion.div` dans `tbody` casse la structure HTML.

---

### 2. useOptimistic sans Transition

**Problème:**
```tsx
// ❌ ERREUR - Warning React
addOptimisticUpdate({ transactionId, newStatus });
```

**Solution:**
```tsx
// ✅ CORRECT - Wrapper dans startTransition
const [, startOptimisticUpdate] = useTransition();

startOptimisticUpdate(() => {
  addOptimisticUpdate({ transactionId, newStatus });
});
```

**Pourquoi:** React 19 exige que les mises à jour optimistes soient dans une transition pour le rollback automatique.

---

### 3. Animation de Pagination Trop Courte

**Problème:**
```tsx
// ❌ ERREUR - Animation disparaît immédiatement
const [isPending, startTransition] = useTransition();
// isPending ne dure que le temps du rendu
```

**Solution:**
```tsx
// ✅ CORRECT - État avec délai minimum
const [isNavigating, setIsNavigating] = useState(false);

useEffect(() => {
  if (!isFetching && isNavigating) {
    const timeout = setTimeout(() => {
      setIsNavigating(false);
    }, 300); // Minimum 300ms pour voir l'animation
    return () => clearTimeout(timeout);
  }
}, [isFetching, isNavigating]);
```

**Pourquoi:** `placeholderData` rend `isFetching` false immédiatement quand les données sont en cache.

---

### 4. Boutons "Changer" Tous Désactivés

**Problème:**
```tsx
// ❌ ERREUR - Tous les boutons désactivés
disabled={isPending || isFetching}
```

**Solution:**
```tsx
// ✅ CORRECT - Suivre chaque mutation individuellement
const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

const handleUpdate = async (id: string) => {
  if (pendingIds.has(id)) return;
  setPendingIds(prev => new Set(prev).add(id));
  
  try {
    await updateItem(id);
  } finally {
    setPendingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }
};

// Dans le render:
disabled={pendingIds.has(item.id)} // Seul ce bouton est désactivé
```

**Pourquoi:** Les mutations doivent être indépendantes pour permettre des actions parallèles.

---

### 5. Ombre de Card Hover Coupée

**Problème:**
```tsx
// ❌ ERREUR - Shadow coupée par le parent
<motion.div
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
>
  <Card>...</Card>
</motion.div>
```

**Solution:**
```tsx
// ✅ CORRECT - Ajouter overflow-hidden et rounded
<motion.div
  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
  className="rounded-xl overflow-hidden"
>
  <Card>...</Card>
</motion.div>
```

**Pourquoi:** L'ombre dépasse du conteneur parent si `overflow: visible` (défaut).

---

### 6. Cursor-Pointer sur les Boutons

**Problème:** Les boutons shadcn/ui n'ont pas de cursor-pointer par défaut.

**Solution:**
```css
/* globals.css */
@layer base {
  button:not([disabled]),
  [role="button"]:not([disabled]) {
    cursor: pointer;
  }
}
```

**Pourquoi:** Changement intentionnel de Tailwind CSS v4 pour matcher le comportement natif des navigateurs.

---

### 7. AnimatePresence sans Key

**Problème:**
```tsx
// ❌ ERREUR - Exit animation ne fonctionne pas
<AnimatePresence>
  {show && <motion.div exit={{ opacity: 0 }} />}
</AnimatePresence>
```

**Solution:**
```tsx
// ✅ CORRECT - Key requise pour AnimatePresence
<AnimatePresence>
  {show && (
    <motion.div 
      key="unique-id"
      exit={{ opacity: 0 }} 
    />
  )}
</AnimatePresence>
```

**Pourquoi:** AnimatePresence utilise la key pour tracker les éléments et déclencher les animations de sortie.

---

## 📚 Bonnes Pratiques Validées

### 1. Structure des Query Keys

```typescript
export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    transactions: (page: number) => 
      [...queryKeys.dashboard.all, 'transactions', page] as const,
  },
};
```

### 2. Gestion des Erreurs dans les Composants

```tsx
const [updateError, setUpdateError] = useState<string | null>(null);

// Afficher l'erreur à l'utilisateur
{updateError && (
  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md" role="alert">
    {updateError}
  </div>
)}
```

### 3. Reduced Motion Support

```tsx
const shouldReduceMotion = useReducedMotion();

<motion.div
  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
/>
```

### 4. SSR avec Prefetch

```tsx
// Server Component
export default async function DashboardPage() {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.stats(),
      queryFn: fetchStats,
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Dashboard />
    </HydrationBoundary>
  );
}
```

---

## 🛠️ Configuration Recommandée

### Query Client

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Button avec Cursor-Pointer

```css
@layer base {
  button:not([disabled]),
  [role="button"]:not([disabled]) {
    cursor: pointer;
  }
}
```

### Layout avec Langue FR

```tsx
<html lang="fr">
```

---

## ✅ Checklist de Validation

Avant de considérer une feature terminée :

- [ ] Build passe sans erreur (`pnpm build`)
- [ ] Pas de warnings console
- [ ] Animations avec `useReducedMotion` 
- [ ] Hydration OK (pas de mismatch)
- [ ] Pagination avec loading state
- [ ] Mutations individuelles (pas global)
- [ ] Erreurs affichées à l'utilisateur
- [ ] Aria-labels sur les boutons d'action
- [ ] Cursor-pointer sur les boutons
- [ ] Shadows pas coupées sur hover

---

## 📖 Ressources

- [React 19 useOptimistic](https://react.dev/reference/react/useOptimistic)
- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates)
- [Motion Documentation](https://motion.dev/)
- [Tailwind CSS v4 Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
