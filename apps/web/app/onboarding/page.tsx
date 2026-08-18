import { OnboardingForm } from "@/components/auth/onboarding-form";
import { AuthShell } from "@/components/layout/auth-shell";

export const metadata = {
  title: "Personalize Your Experience - SkillBridge",
  description: "Complete your SkillBridge onboarding",
};

export default function OnboardingPage() {
  return (
    <AuthShell
      mode="register"
      title="Make SkillBridge yours"
      subtitle="A few essentials now unlock a more relevant first experience."
    >
      <OnboardingForm />
    </AuthShell>
  );
}
