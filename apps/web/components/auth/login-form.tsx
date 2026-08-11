"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiRequest, ApiError, AuthResponse, API_ENDPOINTS, storeToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { Stagger, StaggerItem } from "@/components/motion";

const EASE = [0.16, 1, 0.3, 1] as const;

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validate() {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return "Enter a valid email.";
    if (!password) return "Password is required.";
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
        method: "POST",
        body: { email, password },
      });
      storeToken(data.token, data.refreshToken);

      const roleRedirects: Record<string, string> = {
        student: "/dashboard/student",
        employer: "/dashboard/employer",
        admin: "/dashboard/admin",
      };
      router.push(roleRedirects[data.user.role] || "/dashboard");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <Stagger className="space-y-9">
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
            error={error}
          />
        </StaggerItem>

        <StaggerItem>
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            autoComplete="current-password"
            required
            error={error}
          />
        </StaggerItem>

        <StaggerItem>
          <div className="flex items-center justify-end">
            <a
              href="/auth/forgot-password"
              className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
            >
              Forgot password?
            </a>
          </div>
        </StaggerItem>

        <StaggerItem>
          <Button
            type="submit"
            disabled={loading}
            variant="primary"
            size="lg"
            className="relative isolate overflow-hidden w-full transition-transform active:scale-[0.985]"
          >
            {loading && (
              <motion.span
                className="absolute inset-0 -z-10"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.8, ease: EASE }}
              />
            )}
            <motion.span
              key={loading ? "loading" : "idle"}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              {loading ? "Signing in…" : "Sign In"}
            </motion.span>
          </Button>
        </StaggerItem>

        <StaggerItem>
          <div className="text-center text-sm text-gray-600">
            Don&apos;t have an account?{" "}
            <a
              href="/auth/register"
              className="inline font-medium text-gray-900 underline transition-colors hover:text-primary"
            >
              Sign up
            </a>
          </div>
        </StaggerItem>
      </Stagger>
    </form>
  );
}
