"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiRequest, API_ENDPOINTS } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { Stagger, StaggerItem } from "@/components/motion";

function InnerForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setStatus("error");
      setMessage("8+ chars with uppercase, lowercase, and a number.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const token = params.get("token");
      await apiRequest(API_ENDPOINTS.auth.resetPassword || "/auth/reset-password", {
        method: "POST",
        body: { token, password },
      });
      setStatus("done");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch {
      setStatus("error");
      setMessage("Could not reset password. The link may have expired.");
    }
  };

  if (status === "done") {
    return (
      <p className="text-center text-sm text-green-700">
        Password updated. Redirecting to sign in…
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Stagger className="space-y-7">
        <StaggerItem>
          <AuthField
            id="password"
            label="New password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            showStrength
            error={status === "error" ? message : undefined}
          />
        </StaggerItem>

        <StaggerItem>
          <AuthField
            id="confirm"
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={setConfirm}
            placeholder="••••••••"
            autoComplete="new-password"
            required
            error={status === "error" && password !== confirm ? "Passwords do not match." : status === "error" ? message : undefined}
          />
        </StaggerItem>

        <StaggerItem>
          <div className="pt-1 text-xs text-gray-500">
            8+ chars · 1 uppercase · 1 number · 1 symbol
          </div>
        </StaggerItem>

        <StaggerItem>
          <Button type="submit" disabled={status === "loading"} variant="primary" size="lg" className="w-full">
            {status === "loading" ? "Updating…" : "Update password"}
          </Button>
        </StaggerItem>
      </Stagger>
    </form>
  );
}

export function ResetPasswordForm() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Loading…</div>}>
      <InnerForm />
    </Suspense>
  );
}
