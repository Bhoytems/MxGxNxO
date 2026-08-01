"use client";

// Minimal shadcn-style toast state manager (no external store dependency).
import * as React from "react";

type ToastVariant = "default" | "destructive" | "success";

export interface ToastItem {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
}

type ToastInput = Omit<ToastItem, "id">;

let listeners: Array<(toasts: ToastItem[]) => void> = [];
let toasts: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l(toasts));
}

export function toast(input: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  toasts = [...toasts, { id, ...input }];
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, 4000);
}

export function useToast() {
  const [state, setState] = React.useState<ToastItem[]>(toasts);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      listeners = listeners.filter((l) => l !== setState);
    };
  }, []);

  return {
    toasts: state,
    toast,
    dismiss: (id: string) => {
      toasts = toasts.filter((t) => t.id !== id);
      emit();
    },
  };
}
