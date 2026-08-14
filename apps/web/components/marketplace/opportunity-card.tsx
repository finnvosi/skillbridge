"use client";

import Link from "next/link";
import { Project, MatchedProject } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tilt } from "@/components/motion";
import { Magnetic } from "@/components/motion/primitives2";

interface OpportunityCardProps {
  project: Project | MatchedProject;
  onApply?: (id: string) => void;
  showActions?: boolean;
}

export function OpportunityCard({
  project,
  onApply,
  showActions = true,
}: OpportunityCardProps) {
  const isMatch = "matchScore" in project;

  return (
    <Tilt className="group" intensity={6}>
      <Card className="relative flex h-full flex-col overflow-hidden transition-all duration-300 hover:shadow-soft-lg">
        {/* sheen sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="font-display text-lg font-semibold text-gray-900">
              {project.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {project.employer?.companyName || project.employer?.user?.name || "Company"}
            </p>
          </div>
          {isMatch && (
            <Badge variant="primary" size="sm">
              {project.matchScore}% Match
            </Badge>
          )}
          {!isMatch && <Badge variant="primary">{TYPE_LABELS[project.type]}</Badge>}
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-600">
          {project.description}
        </p>

        {project.skillsRequired && project.skillsRequired.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.skillsRequired.slice(0, 3).map((skill) => (
              <Badge key={skill} variant="neutral" size="sm">
                {skill}
              </Badge>
            ))}
            {project.skillsRequired.length > 3 && (
              <Badge variant="neutral" size="sm">
                +{project.skillsRequired.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <span>{project.location || (project.remote ? "Remote" : "Onsite")}</span>
          {project.budget && (
            <span className="font-medium text-gray-900">${project.budget}</span>
          )}
        </div>

        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button asChild size="sm" variant="outline" className="flex-1">
              <Link href={`/dashboard/student/projects/${project.id}`}>
                View details
              </Link>
            </Button>
            {onApply && (
              <Magnetic className="flex-1">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  onClick={() => onApply(project.id)}
                >
                  Apply
                </Button>
              </Magnetic>
            )}
          </div>
        )}
      </Card>
    </Tilt>
  );
}
