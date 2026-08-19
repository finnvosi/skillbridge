import {
  ApplicationEventType,
  ApplicationStatus,
  Prisma,
} from "@prisma/client";

export const APPLICATION_STATUS_TRANSITIONS: Record<
  ApplicationStatus,
  readonly ApplicationStatus[]
> = {
  pending: ["reviewing", "rejected", "withdrawn"],
  reviewing: ["shortlisted", "rejected", "withdrawn"],
  shortlisted: ["accepted", "rejected", "withdrawn"],
  accepted: ["hired", "withdrawn"],
  hired: [],
  rejected: [],
  withdrawn: [],
};

const STATUS_EVENT: Partial<Record<ApplicationStatus, ApplicationEventType>> = {
  reviewing: "application_reviewed",
  shortlisted: "candidate_shortlisted",
  accepted: "application_accepted",
  hired: "candidate_hired",
  rejected: "application_rejected",
  withdrawn: "application_withdrawn",
};

const STATUS_COPY: Record<ApplicationStatus, { title: string; body: string }> = {
  pending: {
    title: "Application submitted",
    body: "Your application has been submitted.",
  },
  reviewing: {
    title: "Your application is being reviewed",
    body: "The employer has started reviewing your application.",
  },
  shortlisted: {
    title: "You have been shortlisted",
    body: "The employer has added you to their shortlist.",
  },
  accepted: {
    title: "Your application was accepted",
    body: "The employer has accepted your application.",
  },
  hired: {
    title: "You have been hired",
    body: "Congratulations — the employer marked you as hired.",
  },
  rejected: {
    title: "Application update",
    body: "The employer has closed this application.",
  },
  withdrawn: {
    title: "Application withdrawn",
    body: "This application has been withdrawn.",
  },
};

export class InvalidApplicationTransitionError extends Error {
  constructor(currentStatus: ApplicationStatus, nextStatus: ApplicationStatus) {
    super(`Cannot move an application from ${currentStatus} to ${nextStatus}`);
    this.name = "InvalidApplicationTransitionError";
  }
}

export class StaleApplicationStateError extends Error {
  constructor() {
    super("This application changed before your request completed. Refresh and try again.");
    this.name = "StaleApplicationStateError";
  }
}

export class ApplicationNotFoundError extends Error {
  constructor() {
    super("Application not found");
    this.name = "ApplicationNotFoundError";
  }
}

export function isValidApplicationTransition(
  currentStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): boolean {
  return APPLICATION_STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function eventForApplicationStatus(
  status: ApplicationStatus,
): ApplicationEventType | undefined {
  return STATUS_EVENT[status];
}

interface TransitionApplicationInput {
  applicationId: string;
  nextStatus: ApplicationStatus;
  actorId: string;
  reviewNote?: string;
  candidateFeedback?: string;
  notifyStudent?: boolean;
}

/**
 * Performs one lifecycle transition as a compare-and-swap inside the caller's
 * transaction. The conditional update is the concurrency boundary: only the
 * request that still sees the expected current status can append audit records.
 */
export async function transitionApplication(
  tx: Prisma.TransactionClient,
  input: TransitionApplicationInput,
) {
  const {
    applicationId,
    nextStatus,
    actorId,
    reviewNote,
    candidateFeedback,
    notifyStudent = true,
  } = input;

  const application = await tx.application.findUnique({
    where: { id: applicationId },
    select: { id: true, status: true, student: { select: { userId: true } } },
  });

  if (!application) throw new ApplicationNotFoundError();

  const previousStatus = application.status;
  // A second request racing for the same transition observes the winner's
  // destination. Treat that as stale rather than an illegal lifecycle edge so
  // clients can safely refresh their snapshot and avoid retrying blindly.
  if (previousStatus === nextStatus) throw new StaleApplicationStateError();
  if (!isValidApplicationTransition(previousStatus, nextStatus)) {
    throw new InvalidApplicationTransitionError(previousStatus, nextStatus);
  }

  const compareAndSwap = await tx.application.updateMany({
    where: { id: application.id, status: previousStatus },
    data: {
      status: nextStatus,
      ...(reviewNote !== undefined ? { reviewNote } : {}),
      ...(candidateFeedback !== undefined ? { candidateFeedback } : {}),
    },
  });

  if (compareAndSwap.count !== 1) throw new StaleApplicationStateError();

  const updated = await tx.application.findUniqueOrThrow({
    where: { id: application.id },
  });

  const history = await tx.applicationStatusHistory.create({
    data: {
      applicationId: application.id,
      previousStatus,
      newStatus: nextStatus,
      actorId,
      ...(reviewNote !== undefined ? { reviewNote } : {}),
      ...(candidateFeedback !== undefined ? { candidateFeedback } : {}),
    },
  });

  const eventType = eventForApplicationStatus(nextStatus);
  if (eventType) {
    await tx.applicationEvent.create({
      data: { applicationId: application.id, eventType, actorId },
    });
  }

  if (notifyStudent) {
    const copy = STATUS_COPY[nextStatus];
    await tx.notification.create({
      data: {
        userId: application.student.userId,
        applicationId: application.id,
        type: "application_status_changed",
        title: copy.title,
        body: candidateFeedback?.trim() || copy.body,
      },
    });
  }

  return { application: updated, transition: history };
}
