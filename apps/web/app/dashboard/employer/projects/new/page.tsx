"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  API_ENDPOINTS,
  getToken,
  ApiError,
} from "@/lib/api-client";
import { ProjectType, TYPE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FadeUp } from "@/components/motion";
import { Check, Plus, X } from "lucide-react";

const TYPE_HINTS: Record<ProjectType, string> = {
  internship: "Structured learning placement",
  part_time: "Ongoing, reduced hours",
  freelance: "Project-based, independent",
  full_time: "Permanent role",
};

const STEPS = ["Basics", "Details", "Review"] as const;

export default function CreateProjectPage() {
  const router = useRouter();
  const token = getToken();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ProjectType>("internship");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");
  const [remote, setRemote] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skills.includes(v)) setSkills([...skills, v]);
    setSkillInput("");
  };
  const removeSkill = (s: string) => setSkills(skills.filter((x) => x !== s));

  const basicsValid = title.trim().length >= 5 && description.trim().length >= 20;
  const detailsValid = skills.length >= 1;

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError("");
    try {
      const body: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim(),
        type,
        skillsRequired: skills,
        remote,
      };
      if (budget) body.budget = Number(budget);
      if (location.trim()) body.location = location.trim();

      await apiRequest(API_ENDPOINTS.projects.create, {
        method: "POST",
        token,
        body,
      });
      router.push("/dashboard/employer/projects");
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to create opportunity"
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <FadeUp>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Employer
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-gray-900">
            Post an opportunity
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Reach talented students with a reverse-hiring listing.
          </p>
        </div>
      </FadeUp>

      {/* Stepper */}
      <FadeUp delay={0.05}>
        <div className="flex items-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  i <= step
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  i <= step ? "text-gray-900" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div className="h-px flex-1 bg-gray-200" />
              )}
            </div>
          ))}
        </div>
      </FadeUp>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Step 1: Basics */}
      {step === 0 && (
        <FadeUp>
          <Card className="space-y-5">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Frontend Developer Intern"
              />
              <p className="mt-1 text-xs text-gray-400">
                {title.trim().length}/5 minimum
              </p>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the role, what the student will do, and what they'll learn..."
              />
              <p className="mt-1 text-xs text-gray-400">
                {description.trim().length}/20 minimum
              </p>
            </div>
            <div>
              <Label>Type</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {(Object.keys(TYPE_LABELS) as ProjectType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      type === t
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <p className="text-sm font-semibold text-gray-900">
                      {TYPE_LABELS[t]}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {TYPE_HINTS[t]}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </FadeUp>
      )}

      {/* Step 2: Details */}
      {step === 1 && (
        <FadeUp>
          <Card className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="budget">Budget (optional, USD)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="e.g. 300"
                />
              </div>
              <div>
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Phnom Penh"
                />
              </div>
            </div>

            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={remote}
                onChange={(e) => setRemote(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">Remote / hybrid role</span>
            </label>

            <div>
              <Label>Skills required</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                  placeholder="Add a skill..."
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSkill}
                  className="shrink-0"
                >
                  <Plus className="h-4 w-4" /> Add
                </Button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="secondary" size="sm">
                    {s}{" "}
                    <button
                      type="button"
                      onClick={() => removeSkill(s)}
                      className="ml-1 font-bold"
                      aria-label={`Remove ${s}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {skills.length === 0 && (
                  <p className="text-sm text-gray-500">No skills added yet.</p>
                )}
              </div>
            </div>
          </Card>
        </FadeUp>
      )}

      {/* Step 3: Review */}
      {step === 2 && (
        <FadeUp>
          <Card className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-gray-900">
              Review &amp; publish
            </h2>
            <div className="space-y-3 text-sm">
              <Row label="Title" value={title} />
              <Row label="Type" value={TYPE_LABELS[type]} />
              <Row
                label="Budget"
                value={budget ? `$${budget}` : "Not specified"}
              />
              <Row
                label="Location"
                value={location.trim() || "Not specified"}
              />
              <Row label="Remote" value={remote ? "Yes" : "No"} />
              <div>
                <p className="text-gray-500">Skills</p>
                <div className="mt-1 flex flex-wrap gap-2">
                  {skills.map((s) => (
                    <Badge key={s} variant="secondary" size="sm">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-gray-500">Description</p>
                <p className="mt-1 whitespace-pre-wrap text-gray-700">
                  {description}
                </p>
              </div>
            </div>
          </Card>
        </FadeUp>
      )}

      {/* Nav */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={back}
          disabled={step === 0}
          className={step === 0 ? "invisible" : ""}
        >
          Back
        </Button>

        {step < STEPS.length - 1 ? (
          <Button
            type="button"
            onClick={next}
            disabled={step === 0 ? !basicsValid : !detailsValid}
          >
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? "Publishing..." : "Publish opportunity"}
          </Button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}</span>
      <span className="text-right font-medium text-gray-900">{value}</span>
    </div>
  );
}
