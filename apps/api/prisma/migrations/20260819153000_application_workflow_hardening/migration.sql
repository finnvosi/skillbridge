-- Hardening follows the already-applied hiring workflow. This is additive:
-- student withdrawals receive an auditable event without rewriting history.
ALTER TYPE "ApplicationEventType" ADD VALUE IF NOT EXISTS 'application_withdrawn';
