import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ToastVariant = "default" | "success" | "error" | "warning";
type Toast = {
  id: string;
  message: ReactNode;
  variant: ToastVariant;
  duration?: number;
};

const ToastContext = createContext<{
  toasts: Toast[];
  add: (t: Omit<Toast, "id">) => void;
  remove: (id: string) => void;
}>({ toasts: [], add: () => {}, remove: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((t: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    const toast: Toast = { ...t, id };
    setToasts((p) => [...p, toast]);
    const d = t.duration ?? 3000;
    setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), d);
  }, []);

  const remove = useCallback((id: string) => {
    setToasts((p) => p.filter((x) => x.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, add, remove }}>
      {children}
      <ToastContainer toasts={toasts} remove={remove} />
    </ToastContext.Provider>
  );
}

function ToastContainer({
  toasts,
  remove,
}: {
  toasts: Toast[];
  remove: (id: string) => void;
}) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto w-max max-w-sm rounded-lg px-4 py-3 text-sm shadow-lg ring-1 ring-black/10",
            t.variant === "error"
              ? "bg-red-50 text-red-800"
              : t.variant === "success"
                ? "bg-green-50 text-green-800"
                : t.variant === "warning"
                  ? "bg-amber-50 text-amber-800"
                  : "bg-card text-foreground"
          )}
          onClick={() => remove(t.id)}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};
