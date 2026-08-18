import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Your path", "Account", "Personalize"];

export function SignupProgress({ currentStep }: { currentStep: 1 | 2 | 3 }) {
  return (
    <div
      aria-label={`Signup progress: step ${currentStep} of 3`}
      className="mb-8"
    >
      <div className="mb-3 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">
        <span>Step {currentStep} of 3</span>
        <span>{STEPS[currentStep - 1]}</span>
      </div>
      <ol className="grid grid-cols-3 gap-2" aria-label="Signup steps">
        {STEPS.map((label, index) => {
          const step = (index + 1) as 1 | 2 | 3;
          const complete = step < currentStep;
          const active = step === currentStep;
          return (
            <li key={label} className="space-y-2">
              <div
                className={cn(
                  "h-1 rounded-full transition-colors duration-300",
                  step <= currentStep ? "bg-primary" : "bg-gray-200",
                )}
              />
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  active
                    ? "font-semibold text-primary"
                    : complete
                      ? "text-gray-600"
                      : "text-gray-400",
                )}
              >
                <span className="flex h-4 w-4 items-center justify-center">
                  {complete ? <Check className="h-3.5 w-3.5" /> : step}
                </span>
                <span className="hidden sm:inline">{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
