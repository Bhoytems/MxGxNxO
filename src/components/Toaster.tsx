"use client";

// Renders active toasts fixed to the bottom-right of the viewport.
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Info } from "lucide-react";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-lg border p-4 shadow-lg animate-fade-up bg-white",
            t.variant === "destructive" && "border-red-200",
            t.variant === "success" && "border-green-200",
            (!t.variant || t.variant === "default") && "border-gray-200"
          )}
        >
          {t.variant === "destructive" ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          ) : t.variant === "success" ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
          ) : (
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" />
          )}
          <div>
            {t.title && <p className="text-sm font-semibold text-gray-900">{t.title}</p>}
            {t.description && <p className="text-sm text-gray-600">{t.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
