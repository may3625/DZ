# Système de Modales Unifié - Dalil.dz

## Vue d'ensemble

Le système de modales unifié de Dalil.dz est une architecture centralisée et optimisée pour gérer tous les types de modales dans l'application. Il offre une expérience utilisateur cohérente, une accessibilité améliorée et une maintenance simplifiée.

## Architecture

### Composants principaux

- **ModalProvider** : Contexte React pour la gestion globale des modales
- **UnifiedModal** : Composant modal de base avec support de tous les types
- **ModalRenderer** : Rendu automatique des modales actives
- **Composants spécialisés** : Modales spécifiques pour chaque cas d'usage

### Types de modales supportés

1. **ConfirmationModal** : Confirmations, alertes, notifications
2. **FormModal** : Formulaires avec validation
3. **WorkflowModal** : Processus multi-étapes
4. **ApprovalModal** : Workflows d'approbation
5. **OCRModal** : Extraction et traitement OCR
6. **SearchModal** : Recherche avancée avec filtres
7. **LegalModal** : Documents juridiques
8. **ProcedureModal** : Procédures administratives
9. **AnalyticsModal** : Visualisations et tableaux de bord

## Utilisation

### Configuration de base

```tsx
import { ModalProvider, useModal } from '@/components/modals/unified';

function App() {
  return (
    <ModalProvider maxConcurrentModals={3}>
      {/* Votre application */}
    </ModalProvider>
  );
}
```

### Ouverture d'une modale

```tsx
import { useModal } from '@/components/modals/unified';

function MyComponent() {
  const { openModal } = useModal();

  const handleOpenModal = () => {
    openModal({
      id: 'unique-id',
      type: 'confirmation',
      title: 'Confirmation',
      message: 'Êtes-vous sûr ?',
      onConfirm: () => console.log('Confirmé'),
      size: 'md'
    });
  };

  return <button onClick={handleOpenModal}>Ouvrir Modal</button>;
}
```

### Hooks utilitaires

```tsx
import { 
  useConfirmationModal, 
  useFormModal, 
  useDisplayModal 
} from '@/components/modals/unified';

function MyComponent() {
  const showConfirmation = useConfirmationModal();
  const showForm = useFormModal();
  const showDisplay = useDisplayModal();

  const handleDelete = () => {
    showConfirmation(
      'Supprimer l\'élément',
      'Cette action est irréversible',
      () => deleteItem(),
      { variant: 'destructive' }
    );
  };

  const handleCreate = () => {
    showForm(
      'Créer un utilisateur',
      UserFormComponent,
      (data) => createUser(data),
      { size: 'lg' }
    );
  };
}
```

## Composants spécialisés

### ConfirmationModal

```tsx
openModal({
  id: 'delete-confirm',
  type: 'confirmation',
  title: 'Confirmation de suppression',
  message: 'Êtes-vous sûr de vouloir supprimer cet élément ?',
  variant: 'destructive', // 'default' | 'destructive' | 'warning' | 'info' | 'success'
  confirmText: 'Supprimer',
  cancelText: 'Annuler',
  onConfirm: () => deleteItem(),
  size: 'md'
});
```

### FormModal

```tsx
openModal({
  id: 'user-form',
  type: 'form',
  title: 'Créer un utilisateur',
  description: 'Remplissez le formulaire ci-dessous',
  formComponent: UserFormComponent,
  onSubmit: (data) => createUser(data),
  initialData: { role: 'user' },
  size: 'lg',
  validation: (data) => validateUserData(data)
});
```

### WorkflowModal

```tsx
openModal({
  id: 'approval-workflow',
  type: 'workflow',
  title: 'Processus d\'approbation',
  description: 'Suivez les étapes pour approuver le document',
  steps: [
    {
      id: 'step1',
      title: 'Vérification',
      description: 'Vérifiez les informations',
      component: VerificationStep,
      validation: (data) => data.verified === true
    },
    // ... autres étapes
  ],
  onComplete: (data) => console.log('Workflow terminé', data),
  size: 'xl'
});
```

### ApprovalModal

```tsx
openModal({
  id: 'document-approval',
  type: 'approval',
  title: 'Approbation de document',
  item: documentData,
  approvalSteps: [
    {
      id: 'tech-review',
      title: 'Révision technique',
      description: 'Vérification technique',
      required: true,
      isComplete: false
    }
  ],
  onApprove: (item, comment) => approveDocument(item, comment),
  onReject: (item, reason) => rejectDocument(item, reason),
  onRequestChanges: (item, changes) => requestChanges(item, changes),
  size: 'lg'
});
```

### OCRModal

```tsx
openModal({
  id: 'ocr-extraction',
  type: 'ocr',
  title: 'Extraction OCR',
  mode: 'workflow', // 'workflow' | 'simple'
  onExtract: (data) => processExtraction(data),
  onValidate: (data) => validateExtraction(data),
  onSave: (data) => saveExtraction(data),
  onComplete: (result) => finishOCRProcess(result),
  size: 'xl'
});
```

### SearchModal

```tsx
openModal({
  id: 'advanced-search',
  type: 'search',
  title: 'Recherche avancée',
  initialQuery: 'procédure administrative',
  searchCategory: 'procedures',
  onSearch: (query, filters) => performSearch(query, filters),
  onSelect: (item) => selectSearchResult(item),
  size: 'lg'
});
```

### LegalModal

```tsx
openModal({
  id: 'legal-document',
  type: 'legal',
  title: 'Document juridique',
  document: legalDocument,
  mode: 'view', // 'view' | 'edit' | 'create' | 'approve'
  onSave: (document) => saveLegalDocument(document),
  onApprove: (document) => approveLegalDocument(document),
  onReject: (document, reason) => rejectLegalDocument(document, reason),
  size: 'lg'
});
```

### ProcedureModal

```tsx
openModal({
  id: 'procedure-management',
  type: 'procedure',
  title: 'Gestion de procédure',
  procedure: procedureData,
  mode: 'edit', // 'view' | 'edit' | 'create' | 'execute'
  onSave: (procedure) => saveProcedure(procedure),
  onExecute: (procedure, data) => executeProcedure(procedure, data),
  onComplete: (procedure, result) => completeProcedure(procedure, result),
  size: 'lg'
});
```

### AnalyticsModal

```tsx
openModal({
  id: 'analytics-dashboard',
  type: 'analytics',
  title: 'Tableau de bord analytique',
  chartType: 'bar', // 'bar' | 'line' | 'pie' | 'area' | 'table'
  data: chartData,
  period: 'month',
  onExport: (format) => exportData(format),
  size: 'xl'
});
```

## Personnalisation

### Tailles disponibles

- `sm` : Petite (max-w-sm)
- `md` : Moyenne (max-w-md)
- `lg` : Grande (max-w-lg)
- `xl` : Très grande (max-w-xl)
- `2xl` : Extra large (max-w-2xl)
- `full` : Plein écran (95vw x 95vh)

### Variantes de confirmation

- `default` : Bleu (information)
- `destructive` : Rouge (danger)
- `warning` : Jaune (avertissement)
- `info` : Bleu (information)
- `success` : Vert (succès)

## Accessibilité

Le système de modales unifié respecte les standards d'accessibilité WCAG 2.1 :

- Gestion automatique du focus
- Support des raccourcis clavier (Échap)
- Annonces ARIA appropriées
- Navigation au clavier
- Support des lecteurs d'écran

## Performance

- Limitation du nombre de modales concurrentes
- Rendu conditionnel des composants
- Gestion optimisée de la mémoire
- Fermeture automatique des modales inactives

## Tests

Pour tester le système de modales, naviguez vers `/modal-test` dans l'application.

## Maintenance

### Ajout d'un nouveau type de modal

1. Créer le composant dans `specialized/`
2. Ajouter les types dans `types.ts`
3. Implémenter le rendu dans `UnifiedModal.tsx`
4. Exporter depuis `specialized/index.ts`
5. Ajouter à la démonstration dans `ModalDemo.tsx`

### Personnalisation des styles

Les modales utilisent Tailwind CSS et peuvent être personnalisées via :
- Classes CSS personnalisées via la prop `className`
- Variables CSS personnalisées
- Thèmes Tailwind personnalisés

## Support

Pour toute question ou problème avec le système de modales unifié, consultez :
- La documentation technique
- Les exemples dans `ModalDemo.tsx`
- Les tests unitaires
- L'équipe de développement