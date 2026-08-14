"use client";

import { useEffect, useState, useCallback } from "react";
import {
  apiRequest,
  API_ENDPOINTS,
  getToken,
  ApiError,
} from "@/lib/api-client";
import { Student } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FadeUp } from "@/components/motion";
import { Magnetic } from "@/components/motion/primitives2";
import {
  Search,
  GraduationCap,
  Award,
  Briefcase,
  UserCircle2,
  X,
} from "lucide-react";

export default function TalentSearchPage() {
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [skill, setSkill] = useState("");
  const [university, setUniversity] = useState("");
  const [skillInput, setSkillInput] = useState("");

  const fetchStudents = useCallback(
    async (params: { search?: string; skill?: string; university?: string }) => {
      if (!token) return;
      setLoading(true);
      setError("");
      try {
        const qs = new URLSearchParams();
        if (params.search) qs.set("search", params.search);
        if (params.skill) qs.set("skill", params.skill);
        if (params.university) qs.set("university", params.university);
        const data = await apiRequest<{ students: Student[]; total: number }>(
          `${API_ENDPOINTS.students.search}?${qs.toString()}`,
          { method: "GET", token }
        );
        setStudents(data.students ?? []);
      } catch (err) {
        setError(
          err instanceof ApiError ? err.message : "Failed to load talent"
        );
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    fetchStudents({});
  }, [fetchStudents]);

  const addSkill = () => {
    const v = skillInput.trim();
    if (v && !skill) setSkill(v);
    setSkillInput("");
  };

  const runSearch = () => {
    fetchStudents({ search: search.trim(), skill, university: university.trim() });
  };

  const clearFilters = () => {
    setSearch("");
    setSkill("");
    setUniversity("");
    fetchStudents({});
  };

  return (
    <div className="space-y-8">
      <FadeUp>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-primary">
            Employer
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-gray-900">
            Talent Search
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Discover verified students by skill, university, or major.
          </p>
        </div>
      </FadeUp>

      {/* Filters */}
      <FadeUp delay={0.05}>
        <Card className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="Search name, skill, or keyword..."
                className="pl-9"
              />
            </div>
            <div className="relative flex-1">
              <GraduationCap className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runSearch()}
                placeholder="University (e.g. RUPP)"
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="Add a skill filter (e.g. React)"
              />
            </div>
            <Magnetic>
              <Button type="button" onClick={runSearch} className="w-full sm:w-auto">
                Search
              </Button>
            </Magnetic>
            <Button
              type="button"
              variant="ghost"
              onClick={clearFilters}
              className="w-full sm:w-auto"
            >
              Clear
            </Button>
          </div>

          {skill && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-gray-500">Skill:</span>
              <Badge variant="secondary" size="sm">
                {skill}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setSkill("");
                    fetchStudents({ search, university });
                  }}
                  className="ml-1 font-bold"
                  aria-label="Remove skill filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </Card>
      </FadeUp>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      ) : students.length === 0 ? (
        <Card className="p-10 text-center">
          <UserCircle2 className="mx-auto h-10 w-10 text-gray-300" />
          <p className="mt-3 font-medium text-gray-700">No students found</p>
          <p className="text-sm text-gray-500">
            Try broadening your filters or clearing them.
          </p>
        </Card>
      ) : (
        <FadeUp>
          <p className="text-sm text-gray-500">
            {students.length} student{students.length !== 1 ? "s" : ""} found
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map((s) => (
              <Card
                key={s.id}
                className="flex flex-col gap-3 p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {s.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-gray-900">
                      {s.name}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {s.university || "—"}
                      {s.major ? ` · ${s.major}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {s.skills.slice(0, 4).map((sk) => (
                    <Badge key={sk} variant="outline" size="sm">
                      {sk}
                    </Badge>
                  ))}
                  {s.skills.length > 4 && (
                    <Badge variant="outline" size="sm">
                      +{s.skills.length - 4}
                    </Badge>
                  )}
                </div>

                <div className="mt-auto flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Award className="h-3.5 w-3.5 text-purple-600" />
                    {s.verifiedCertCount} verified
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                    {s.applicationCount} applied
                  </span>
                  {s.graduationYear && (
                    <span className="ml-auto">{s.graduationYear}</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </FadeUp>
      )}
    </div>
  );
}
