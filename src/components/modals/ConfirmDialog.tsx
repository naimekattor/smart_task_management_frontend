import React from 'react';
import { Modal } from './Modal';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  onConfirm: () => void | Promise<void>;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  message,
  onConfirm,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="flex flex-col items-center text-center">
        {isDestructive && (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400">
            <AlertTriangle className="h-6 w-6" />
          </div>
        )}
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {message}
        </p>
        
        <div className="mt-8 flex w-full gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex-1 inline-flex h-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 shadow-sm transition-all hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
              onClose();
            }}
            className={`flex-1 inline-flex h-9 items-center justify-center rounded-lg text-sm font-semibold text-white shadow-sm transition-all disabled:opacity-50 active:scale-98 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 hover:shadow-red-500/10 dark:bg-red-500 dark:hover:bg-red-400'
                : 'bg-violet-600 hover:bg-violet-500 hover:shadow-violet-500/10 dark:bg-violet-500 dark:hover:bg-violet-400'
            }`}
          >
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
