'use client';

<<<<<<< HEAD
import React, { createContext, useContext, useState } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
=======
import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void;
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
<<<<<<< HEAD
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none"
=======
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, 3800);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
<<<<<<< HEAD
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white text-[#263B4D] rounded-xl shadow-elevated border border-[#C4D5E0] text-sm animate-in slide-in-from-bottom-2"
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#258A70] flex-shrink-0" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-[#C65E57] flex-shrink-0" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#416F89] flex-shrink-0" />}
            <span className="flex-1 font-medium">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="text-[#718494] hover:text-[#20364A] transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
=======
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-white text-[#20364A] rounded-xl shadow-elevated border border-[#C4D5E0] text-sm animate-in slide-in-from-bottom-2"
          >
            {t.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#1F7560] flex-shrink-0" aria-hidden="true" />}
            {t.type === 'error' && <AlertCircle className="w-4 h-4 text-[#A94842] flex-shrink-0" aria-hidden="true" />}
            {t.type === 'info' && <Info className="w-4 h-4 text-[#416F89] flex-shrink-0" aria-hidden="true" />}
            <span className="flex-1 font-medium">{t.message}</span>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 rounded text-[#4F6576] hover:text-[#20364A] hover:bg-[#F4F8FA] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#416F89]"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
>>>>>>> df8cea0f65c4bd85d419b1f00a95a836e7cd6efc
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      toast: (msg: string) => console.log('Toast:', msg),
    };
  }
  return context;
};
