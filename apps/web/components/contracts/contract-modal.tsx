"use client";

import { useEffect, useState } from "react";
import { apiRequest, getToken } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/layout/page-header";
import { Download, CheckCircle } from "lucide-react";

interface Contract {
  id: string;
  projectId: string;
  student: string;
  employer: string;
  salary: number | null;
  project: string;
  status: "pending_signatures" | "signed" | "countered";
  contractUrl: string;
  createdAt: string;
}

interface ContractResponse {
  message: string;
  contract: Contract;
  signUrl: string;
}

interface Props {
  applicationId: string;
}

export default function ContractModal({ applicationId }: Props) {
  const [loading, setLoading] = useState(true);
  const [contract, setContract] = useState<Contract | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = getToken();

  useEffect(() => {
    if (!token || !applicationId) return;
    
    (async () => {
      try {
        const data = await apiRequest<ContractResponse>(
          `/api/v1/applications/${applicationId}/contract`,
          { method: "POST", token }
        );
        setContract(data.contract);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to generate contract");
      } finally {
        setLoading(false);
      }
    })();
  }, [token, applicationId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-red-600">{error}</p>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-600">No contract to display</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Contract"
        title={contract.status === "signed" ? "Agreement Signed" : "Agreement Terms"}
        subtitle="Generated automatically from your application"
      />

      <Card>
        <div className="p-6 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Parties</h3>
              <p className="text-sm text-gray-600">Student: {contract.student}</p>
              <p className="text-sm text-gray-600">Employer: {contract.employer}</p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Project</h3>
              <p className="text-sm text-gray-600">{contract.project}</p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-2">Terms</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Budget: ${contract.salary?.toFixed(2) || "To be agreed"}</li>
              <li>Status: {contract.status.replace("_", " ")}</li>
              <li>Created: {new Date(contract.createdAt).toLocaleDateString()}</li>
            </ul>
          </div>
        </div>
      </Card>

      <div className="flex gap-3">
        {contract.status !== "signed" && (
          <Button asChild>
            <a href={`/sign/${contract.id}`} target="_blank" rel="noopener noreferrer">
              <CheckCircle className="h-4 w-4 mr-2" />
              Review & Sign
            </a>
          </Button>
        )}
        <Button variant="outline" asChild>
          <a href={contract.contractUrl} download>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </a>
        </Button>
      </div>
    </div>
  );
}