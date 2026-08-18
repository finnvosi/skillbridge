"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import {
  apiRequest,
  ApiError,
  AuthResponse,
  API_ENDPOINTS,
  storeToken,
} from "@/lib/api-client";
import { getPostAuthDestination } from "@/lib/auth-routing";
import { Button } from "@/components/ui/button";
import { AuthField } from "@/components/auth/auth-field";
import { SignupProgress } from "@/components/auth/signup-progress";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;
type Role = "student" | "employer";
type AccountField = "name" | "email" | "password";

const ROLE_OPTIONS: Array<{
  value: Role;
  title: string;
  description: string;
  detail: string;
  icon: typeof GraduationCap;
}> = [
  {
    value: "student",
    title: "I’m a student",
    description: "Find opportunities and prove what you can do.",
    detail: "Projects · internships · entry roles",
    icon: GraduationCap,
  },
  {
    value: "employer",
    title: "I’m an employer",
    description: "Discover emerging talent and grow your team.",
    detail: "Talent search · opportunities · applicants",
    icon: Building2,
  },
];

export function RegisterForm() {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<AccountField, string>>
  >({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function validateAccount() {
    const errors: Partial<Record<AccountField, string>> = {};
    if (!name.trim()) errors.name = "Enter your full name.";
    if (!email || !/\S+@\S+\.\S+/.test(email))
      errors.email = "Enter a valid email.";
    if (password.length < 8) {
      errors.password = "Use at least 8 characters.";
    } else if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      errors.password = "Add uppercase, lowercase, number, and symbol.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    if (step === 1) {
      if (!role) {
        setFormError("Choose the path that fits you.");
        return;
      }
      setStep(2);
      return;
    }

    if (!role || !validateAccount()) return;

    setLoading(true);
    try {
      const data = await apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
        method: "POST",
        body: { email, password, name: name.trim(), role },
      });
      storeToken(data.token, data.refreshToken);
      router.push(getPostAuthDestination(data.user));
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : "We couldn’t create your account. Try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="min-h-[430px] min-w-0 w-full max-w-full"
    >
      <SignupProgress currentStep={step} />

      <AnimatePresence mode="wait" initial={false}>
        {step === 1 ? (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 12 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="space-y-6"
          >
            <div>
              <p className="label-mono-muted mb-2">Choose your path</p>
              <h2 className="display text-3xl text-gray-900">
                What brings you here?
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                We’ll shape SkillBridge around your next move.
              </p>
            </div>

            <div className="grid gap-3">
              {ROLE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const active = role === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setRole(option.value);
                      setFormError("");
                    }}
                    className={cn(
                      "group relative w-full rounded-2xl border p-4 text-left transition-all duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
                      active
                        ? "border-primary/35 bg-white/75 shadow-[0_14px_34px_rgba(60,9,108,0.10)]"
                        : "border-white/70 bg-white/35 hover:border-primary/20 hover:bg-white/60",
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-colors",
                          active
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-gray-200 bg-white/70 text-gray-500 group-hover:text-primary",
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-3">
                          <span className="font-display text-lg font-bold text-gray-900">
                            {option.title}
                          </span>
                          <span
                            className={cn(
                              "flex h-5 w-5 items-center justify-center rounded-full border",
                              active
                                ? "border-primary bg-primary text-white"
                                : "border-gray-300 bg-white/60 text-transparent",
                            )}
                          >
                            <Check className="h-3 w-3" />
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-5 text-gray-600">
                          {option.description}
                        </span>
                        <span className="mt-2 block text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-400">
                          {option.detail}
                        </span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {formError && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {formError}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full gap-2">
              Continue <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="account"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="space-y-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="label-mono-muted mb-2">Create your account</p>
                <h2 className="display text-3xl text-gray-900">
                  {role === "student"
                    ? "Build your career bridge."
                    : "Meet your next great hire."}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setFormError("");
                }}
                className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white/60 text-gray-500 transition-colors hover:border-primary/25 hover:text-primary"
                aria-label="Back to role selection"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>

            <AuthField
              id="name"
              label="Full name"
              value={name}
              onChange={(value) => {
                setName(value);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              placeholder="Sopanha Vosi"
              autoComplete="name"
              required
              error={fieldErrors.name}
            />
            <AuthField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setFieldErrors((current) => ({ ...current, email: undefined }));
              }}
              placeholder={
                role === "student" ? "you@university.edu" : "you@company.com"
              }
              autoComplete="email"
              required
              error={fieldErrors.email}
            />
            <AuthField
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                setFieldErrors((current) => ({
                  ...current,
                  password: undefined,
                }));
              }}
              placeholder="••••••••"
              autoComplete="new-password"
              required
              showStrength
              error={fieldErrors.password}
            />

            {formError && (
              <p role="alert" className="text-sm font-medium text-red-600">
                {formError}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Your role can only be changed by support after signup.
            </div>

            <Button
              type="submit"
              disabled={loading}
              size="lg"
              className="relative isolate w-full gap-2 overflow-hidden active:scale-[0.985]"
            >
              <motion.span
                key={loading ? "loading" : "idle"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="flex items-center gap-2"
              >
                {loading ? "Creating your account…" : "Create account"}
                {!loading && <ArrowRight className="h-4 w-4" />}
              </motion.span>
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <a
                href="/auth/login"
                className="font-medium text-gray-900 underline hover:text-primary"
              >
                Sign in
              </a>
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
