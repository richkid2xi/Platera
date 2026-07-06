import { createContext, useContext, useState, type ReactNode } from 'react';

interface UnsavedChangesContextType {
  checkUnsaved: (onConfirm: () => void) => void;
  confirmDiscard: () => void;
  cancelDiscard: () => void;
  setUnsavedDiff: (diff: string[]) => void;
  unsavedDiff: string[];
  isWarningVisible: boolean;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | undefined>(undefined);

export function UnsavedChangesProvider({ children }: { children: ReactNode }) {
  const [unsavedDiff, setUnsavedDiff] = useState<string[]>([]);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const checkUnsaved = (onConfirm: () => void) => {
    if (unsavedDiff.length > 0) {
      setPendingAction(() => onConfirm);
    } else {
      onConfirm();
    }
  };

  const confirmDiscard = () => {
    if (pendingAction) {
      pendingAction();
    }
    setUnsavedDiff([]);
    setPendingAction(null);
  };

  const cancelDiscard = () => {
    setPendingAction(null);
  };

  return (
    <UnsavedChangesContext.Provider
      value={{
        checkUnsaved,
        confirmDiscard,
        cancelDiscard,
        setUnsavedDiff,
        unsavedDiff,
        isWarningVisible: pendingAction !== null,
      }}
    >
      {children}
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChanges() {
  const context = useContext(UnsavedChangesContext);
  if (context === undefined) {
    throw new Error('useUnsavedChanges must be used within an UnsavedChangesProvider');
  }
  return context;
}
