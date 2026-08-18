"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  CheckCircle2,
  GraduationCap,
  MapPin,
  Plus,
  Sparkles,
  X,
} from "lucide-react";
import {
  apiRequest,
  ApiError,
  ApiUser,
  API_ENDPOINTS,
  getToken,
} from "@/lib/api-client";
import { getPostAuthDestination } from "@/lib/auth-routing";
import { SignupProgress } from "@/components/auth/signup-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type PublicRole = "student" | "employer";
type OpportunityType = "internship" | "part_time" | "freelance" | "full_time";
type WorkPreference = "remote" | "onsite" | "hybrid" | "either";

const OPPORTUNITY_TYPES: Array<{ value: OpportunityType; label: string }> = [
  { value: "internship", label: "Internship" },
  { value: "part_time", label: "Part-time" },
  { value: "freelance", label: "Freelance" },
  { value: "full_time", label: "Entry-level" },
];

const WORK_PREFERENCES: Array<{ value: WorkPreference; label: string }> = [
  { value: "remote", label: "Remote" },
  { value: "onsite", label: "Onsite" },
  { value: "hybrid", label: "Hybrid" },
  { value: "either", label: "Any" },
];

const STUDENT_SKILLS = [
  "React",
  "UI/UX",
  "Marketing",
  "Data Analysis",
  "Python",
  "Content",
  "Sales",
];
const EMPLOYER_SKILLS = [
  "React",
  "Product Design",
  "Marketing",
  "Operations",
  "Data",
  "Content",
  "Sales",
];

const fieldClass = cn(
  "h-12 rounded-xl border-gray-200 bg-white/65 px-3.5 text-[15px] text-gray-900 shadow-none",
  "placeholder:text-gray-400 focus-visible:border-primary/40 focus-visible:ring-2 focus-visible:ring-primary/15",
);

function ChoiceGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ value: T; label: string }>;
  selected: T[];
  onToggle: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-2.5 text-sm font-medium text-gray-700">
        {label}
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
              className={cn(
                "rounded-full border px-3.5 py-2 text-xs font-semibold transition-all",
                active
                  ? "border-primary/35 bg-primary/10 text-primary"
                  : "border-gray-200 bg-white/55 text-gray-600 hover:border-primary/20 hover:text-gray-900",
              )}
            >
              {active && <Check className="mr-1.5 inline h-3 w-3" />}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function SkillPicker({
  role,
  skills,
  setSkills,
}: {
  role: PublicRole;
  skills: string[];
  setSkills: (skills: string[]) => void;
}) {
  const [customSkill, setCustomSkill] = useState("");
  const suggestions = role === "student" ? STUDENT_SKILLS : EMPLOYER_SKILLS;

  function addSkill(skill: string) {
    const clean = skill.trim();
    if (
      !clean ||
      skills.some((item) => item.toLowerCase() === clean.toLowerCase()) ||
      skills.length >= 10
    )
      return;
    setSkills([...skills, clean]);
    setCustomSkill("");
  }

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium text-gray-700">
        {role === "student"
          ? "Your strongest skills"
          : "Skills you’re hiring for"}
      </legend>
      <p className="mb-3 text-xs leading-5 text-gray-500">
        Choose at least one. Add up to ten.
      </p>

      {skills.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {skills.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => setSkills(skills.filter((item) => item !== skill))}
              className="flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"
              aria-label={`Remove ${skill}`}
            >
              {skill} <X className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={customSkill}
          onChange={(event) => setCustomSkill(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addSkill(customSkill);
            }
          }}
          placeholder="Type another skill"
          className={fieldClass}
        />
        <Button
          type="button"
          variant="outline"
          className="h-12 shrink-0 px-4"
          onClick={() => addSkill(customSkill)}
          aria-label="Add skill"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {suggestions
          .filter((skill) => !skills.includes(skill))
          .slice(0, 6)
          .map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="rounded-full border border-gray-200 bg-white/40 px-2.5 py-1.5 text-[11px] text-gray-500 transition-colors hover:border-primary/20 hover:text-primary"
            >
              + {skill}
            </button>
          ))}
      </div>
    </fieldset>
  );
}

export function OnboardingForm() {
  const router = useRouter();
  const [user, setUser] = useState<ApiUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");

  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [location, setLocation] = useState("Phnom Penh");
  const [skills, setSkills] = useState<string[]>([]);
  const [opportunityTypes, setOpportunityTypes] = useState<OpportunityType[]>(
    [],
  );
  const [workPreference, setWorkPreference] =
    useState<WorkPreference>("either");

  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const token = getToken();
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      try {
        const data = await apiRequest<{ user: ApiUser }>(
          API_ENDPOINTS.auth.me,
          { token },
        );
        if (data.user.role !== "student" && data.user.role !== "employer") {
          router.replace(getPostAuthDestination(data.user));
          return;
        }
        if (data.user.onboardingCompleted) {
          router.replace(getPostAuthDestination(data.user));
          return;
        }
        setUser(data.user);
      } catch {
        router.replace("/auth/login");
      } finally {
        setInitializing(false);
      }
    };

    void loadUser();
  }, [router]);

  const role = user?.role as PublicRole | undefined;

  function toggleOpportunity(value: OpportunityType) {
    setOpportunityTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function validate() {
    if (role === "student") {
      if (
        !university.trim() ||
        !major.trim() ||
        !graduationYear ||
        !location.trim()
      ) {
        return "Complete your education and location details.";
      }
      if (Number(graduationYear) < new Date().getFullYear()) {
        return "Choose your expected graduation year.";
      }
    } else {
      if (
        !companyName.trim() ||
        !position.trim() ||
        !industry.trim() ||
        !companySize ||
        !location.trim()
      ) {
        return "Complete your company and hiring details.";
      }
    }
    if (skills.length === 0) return "Choose at least one skill.";
    if (opportunityTypes.length === 0) {
      return role === "student"
        ? "Choose what you’re looking for."
        : "Choose what you’re hiring for.";
    }
    return "";
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!role) return;
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const body =
        role === "student"
          ? {
              university: university.trim(),
              major: major.trim(),
              graduationYear: Number(graduationYear),
              location: location.trim(),
              skills,
              opportunityTypes,
              workPreference,
            }
          : {
              companyName: companyName.trim(),
              position: position.trim(),
              industry: industry.trim(),
              companySize: Number(companySize),
              website: website.trim(),
              location: location.trim(),
              hiringTypes: opportunityTypes,
              hiringSkills: skills,
              workPreference,
            };

      const data = await apiRequest<{ user: ApiUser }>(
        API_ENDPOINTS.users.onboarding,
        {
          method: "PUT",
          token,
          body,
        },
      );
      setUser(data.user);
      setComplete(true);
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.message
          : "We couldn’t save your onboarding. Try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (initializing || !role) {
    return (
      <div className="space-y-5" aria-label="Loading onboarding">
        <div className="h-2 w-full animate-pulse rounded-full bg-gray-200" />
        <div className="h-8 w-2/3 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/50" />
        <div className="h-12 w-full animate-pulse rounded-xl bg-white/50" />
        <div className="h-28 w-full animate-pulse rounded-2xl bg-white/50" />
      </div>
    );
  }

  if (complete) {
    const student = role === "student";
    return (
      <div className="py-3 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <p className="label-mono-muted mt-7">You’re ready</p>
        <h2 className="display mt-2 text-4xl text-gray-900">
          {student ? "Your bridge is ready." : "Your workspace is ready."}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-6 text-gray-600">
          {student
            ? "Your SkillBridge experience is now shaped around your skills and career direction."
            : "Your talent search is now shaped around the people and skills your team needs."}
        </p>

        <div className="mt-8 rounded-2xl border border-primary/15 bg-white/45 p-4 text-left">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold text-gray-900">
                {student
                  ? "See opportunities selected for you"
                  : "Make your first hiring move"}
              </p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                {student
                  ? "Start with your personalized opportunity marketplace."
                  : "Publish an opportunity or explore matching student talent."}
              </p>
            </div>
          </div>
        </div>

        <Button
          type="button"
          size="lg"
          className="mt-7 w-full gap-2"
          onClick={() =>
            router.push(
              student
                ? "/dashboard/student/discover"
                : "/dashboard/employer/projects/new",
            )
          }
        >
          {student ? "Explore my matches" : "Post my first opportunity"}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <button
          type="button"
          onClick={() =>
            router.push(
              student ? "/dashboard/student" : "/dashboard/employer/talent",
            )
          }
          className="mt-4 text-sm font-medium text-gray-600 underline transition-colors hover:text-primary"
        >
          {student ? "Go to my dashboard" : "Explore matching talent"}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="min-w-0 w-full max-w-full space-y-6"
    >
      <SignupProgress currentStep={3} />

      <div>
        <div className="mb-2 flex items-center gap-2 text-primary">
          {role === "student" ? (
            <GraduationCap className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em]">
            {role === "student" ? "Student profile" : "Employer workspace"}
          </span>
        </div>
        <h2 className="display text-3xl text-gray-900">
          {role === "student"
            ? "Shape your first matches."
            : "Tell us who you need."}
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Only the essentials now. You can build the rest progressively.
        </p>
      </div>

      {role === "student" ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-gray-700">
            University or school
            <Input
              value={university}
              onChange={(event) => setUniversity(event.target.value)}
              placeholder="RUPP"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Field of study
            <Input
              value={major}
              onChange={(event) => setMajor(event.target.value)}
              placeholder="Computer Science"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Graduation year
            <Input
              type="number"
              min={new Date().getFullYear()}
              max={new Date().getFullYear() + 10}
              value={graduationYear}
              onChange={(event) => setGraduationYear(event.target.value)}
              placeholder="2027"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Location
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={cn(fieldClass, "pl-10")}
              />
            </span>
          </label>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Company name
            <Input
              value={companyName}
              onChange={(event) => setCompanyName(event.target.value)}
              placeholder="Mekong Studio"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Your position
            <Input
              value={position}
              onChange={(event) => setPosition(event.target.value)}
              placeholder="Hiring Manager"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Industry
            <Input
              value={industry}
              onChange={(event) => setIndustry(event.target.value)}
              placeholder="Technology"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700">
            Team size
            <Input
              type="number"
              min={1}
              value={companySize}
              onChange={(event) => setCompanySize(event.target.value)}
              placeholder="25"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
            Company website{" "}
            <span className="font-normal text-gray-400">(optional)</span>
            <Input
              type="url"
              value={website}
              onChange={(event) => setWebsite(event.target.value)}
              placeholder="https://company.com"
              className={fieldClass}
            />
          </label>
          <label className="space-y-2 text-sm font-medium text-gray-700 sm:col-span-2">
            Location
            <span className="relative block">
              <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                className={cn(fieldClass, "pl-10")}
              />
            </span>
          </label>
        </div>
      )}

      <div className="border-t border-gray-200/80 pt-5">
        <SkillPicker role={role} skills={skills} setSkills={setSkills} />
      </div>

      <ChoiceGroup
        label={
          role === "student"
            ? "What are you looking for?"
            : "What are you hiring for?"
        }
        options={OPPORTUNITY_TYPES}
        selected={opportunityTypes}
        onToggle={toggleOpportunity}
      />

      <ChoiceGroup
        label="Preferred work arrangement"
        options={WORK_PREFERENCES}
        selected={[workPreference]}
        onToggle={(value) => setWorkPreference(value)}
      />

      {error && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={submitting}
        size="lg"
        className="w-full gap-2"
      >
        {submitting ? "Personalizing SkillBridge…" : "Finish setup"}
        {!submitting && <ArrowRight className="h-4 w-4" />}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
        <BriefcaseBusiness className="h-3.5 w-3.5 text-primary" />
        You can edit these preferences anytime.
      </div>
    </form>
  );
}
