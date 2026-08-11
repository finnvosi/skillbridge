"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, API_ENDPOINTS } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { EmptyState } from "@/components/ui/empty-state";
import { Stagger, StaggerItem } from "@/components/motion";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setStatus("error");
      setMessage("Enter a valid email.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      await apiRequest(API_ENDPOINTS.auth.forgotPassword || "/auth/forgot-password", {
        method: "POST",
        body: { email },
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  if (status === "sent") {
    return (
      <EmptyState
        title="Check your inbox"
        description="If an account exists for that email, a reset link is on its way."
        actionLabel="Back to sign in"
        onAction={() => router.push("/auth/login")}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Stagger>
        <StaggerItem>
          <AuthField
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="you@skillbridge.co"
            autoComplete="email"
            required
            error={status === "error" ? message : undefined}
          />
        </StaggerItem>

        <StaggerItem>
          <Button
            type="submit"
            disabled={status === "loading"}
            variant="primary"
            size="lg"
            className="w-full"
          >
            {status === "loading" ? "Sending…" : "Send reset link"}
          </Button>
        </StaggerItem>

        <StaggerItem>
          <div className="text-center text-sm text-gray-600">
            <a
              href="/auth/login"
              className="inline font-medium text-gray-900 underline transition-colors hover:text-primary"
            >
              Back to sign in
            </a>
          </div>
        </StaggerItem>
      </Stagger>
    </form>
  );
}
