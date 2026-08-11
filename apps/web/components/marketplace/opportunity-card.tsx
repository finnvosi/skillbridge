"use client";

import Link from "next/link";
import { Project } from "@/lib/types";
import { TYPE_LABELS } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OpportunityCardProps {
  project: Project;
  onApply?: (id: string) => void;
  showActions?: boolean;
}

export function OpportunityCard({ project, onApply, showActions = true }: OpportunityCardProps) {
  return (
    <Card className="flex flex-col transition-all duration-300 hover:shadow-soft-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-display text-lg font-semibold text-gray-900">
            {project.title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {project.employer?.companyName || project.employer?.user?.name || "Company"}
          </p>
        </div>
        <Badge variant="primary">{TYPE_LABELS[project.type]}</Badge>
      </div>

      <p className="mt-3 line-clamp-2 flex-1 text-sm text-gray-600">
        {project.description}
      </p>

      {project.skillsRequired && project.skillsRequired.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.skillsRequired.slice(0, 3).map((skill) => (
            <Badge key={skill} variant="secondary" size="sm">
              {skill}
            </Badge>
          ))}
          {project.skillsRequired.length > 3 && (
            <Badge variant="secondary" size="sm">
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
            <Button
              size="sm"
              variant="primary"
              className="flex-1"
              onClick={() => onApply(project.id)}
            >
              Apply
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}