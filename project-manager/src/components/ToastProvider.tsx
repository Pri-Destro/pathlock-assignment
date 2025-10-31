import React, { createContext, useCallback, useContext, useState } from 'react';
import * as Toast from '@radix-ui/react-toast';

type Variant = 'info' | 'success' | 'error';

type ToastItem = {
  id: number;
  title?: string;
  description: string;
  variant: Variant;
  open: boolean;
};

type ToastContextType = {
  showToast: (description: string, variant?: Variant, title?: string) => void;
};

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
});

export const useToast = () => useContext(ToastContext);

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((description: string, variant: Variant = 'info', title?: string) => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const item: ToastItem = { id, title, description, variant, open: true };
    setToasts((t) => [...t, item]);

    // Close then remove after a short delay
    setTimeout(() => {
      setToasts((t) => t.map((tt) => (tt.id === id ? { ...tt, open: false } : tt)));
    }, 3000);
    setTimeout(() => {
      setToasts((t) => t.filter((tt) => tt.id !== id));
    }, 3600);
  }, []);

  return (
    <Toast.Provider swipeDirection="right">
      <ToastContext.Provider value={{ showToast }}>
        {children}

        {/* Render toasts */}
        {toasts.map((t) => (
          <Toast.Root
            className="max-w-md w-full rounded-lg p-3 shadow-lg bg-slate-800 text-white border"
            key={t.id}
            open={t.open}
            onOpenChange={(open: boolean) => {
              if (!open) setToasts((prev) => prev.map((tt) => (tt.id === t.id ? { ...tt, open: false } : tt)));
            }}
          >
            <div className="flex items-start space-x-3">
              <div className={`mt-0.5 h-3 w-3 rounded-full ${t.variant === 'error' ? 'bg-red-500' : t.variant === 'success' ? 'bg-emerald-500' : 'bg-sky-400'}`} />
              <div className="flex-1">
                {t.title && <Toast.Title className="font-semibold">{t.title}</Toast.Title>}
                <Toast.Description className="text-sm text-slate-200">{t.description}</Toast.Description>
              </div>
              <Toast.Close className="ml-3 text-slate-400 hover:text-white">Close</Toast.Close>
            </div>
          </Toast.Root>
        ))}

        <Toast.Viewport className="fixed bottom-4 right-4 flex flex-col gap-3 z-50 outline-none" />
      </ToastContext.Provider>
    </Toast.Provider>
  );
}
