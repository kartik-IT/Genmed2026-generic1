import React, { useEffect } from 'react';

export interface ToastData {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning';
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}

interface ToastProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[92%] max-w-md pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastData; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getIcon = () => {
    if (toast.icon) return toast.icon;
    switch (toast.type) {
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'check_circle';
    }
  };

  return (
    <div className="pointer-events-auto bg-surface-container-lowest/98 backdrop-blur-md text-on-surface border border-surface-container/70 shadow-xl rounded-xl p-3 flex items-center justify-between gap-3 animate-fadeIn transition-all">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className={`material-symbols-outlined text-[20px] flex-shrink-0 ${
            toast.type === 'warning'
              ? 'text-error'
              : toast.type === 'info'
              ? 'text-primary'
              : 'text-secondary'
          }`}
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          {getIcon()}
        </span>
        <span className="font-body-sm text-[13px] font-semibold text-on-surface leading-snug">
          {toast.message}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {toast.actionText && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onDismiss(toast.id);
            }}
            className="font-label-sm text-[11px] px-2 py-1 rounded bg-secondary-container text-on-secondary-container font-bold hover:opacity-90"
          >
            {toast.actionText}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="text-on-surface-variant hover:text-on-surface p-1 rounded hover:bg-surface-container"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    </div>
  );
};
