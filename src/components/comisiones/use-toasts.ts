import { useRef, useState } from 'react';

export interface ToastItem {
  id: number;
  text: string;
  tone?: 'brand' | 'sync' | 'warning';
}

/** Hook: push auto-dismissing toasts (4.5s). */
export function useToasts() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const push = (text: string, tone?: ToastItem['tone']) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, text, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500);
  };
  return { toasts, push };
}
