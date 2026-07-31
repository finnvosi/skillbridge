# INSTRUCTIONS.md

# SkillBridge MVP Technical Instruction

Version: 1.0

---

# Project Overview

Project Name

SkillBridge

Project Type

AI-Powered Workforce Development Platform

Target Platform

Responsive Web Application

Desktop

Mobile Browser

Native mobile applications will be developed in Phase 2.

---

# Mission

SkillBridge is NOT another job portal.

SkillBridge is a Verified Workforce Development Platform that enables students, workers, employers, and industrial factories to build trusted professional relationships through verified work experience.

The primary competitive advantage is the Verification System.

Every completed project contributes permanently to a user's digital career profile.

Trust is the product.

---

# Product Vision

The platform connects four primary user groups:

• Students

• Workers

• Employers

• Industrial Factories

through projects, jobs, recruitment campaigns, messaging, reviews, and verified experience.

The objective is to become Cambodia's trusted employment ecosystem.

---

# Core Product Philosophy

Every technical decision should strengthen one of these objectives:

• Verification

• Trust

• User Experience

• Scalability

• Simplicity

Avoid feature bloat.

Never implement features that do not support the verified talent ecosystem.

---

# Technology Stack

Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

Backend

- Next.js API Routes
- REST API

Database

- Supabase PostgreSQL

Authentication

- Supabase Auth

Storage

- Supabase Storage

Deployment

- Docker
- Ubuntu
- Nginx
- DigitalOcean

---

# User Roles

Student

- Register
- Build profile
- Upload certificates
- Browse projects
- Apply
- Chat
- AI Resume Builder
- AI Resume Review
- Download Resume
- Receive employer reviews

Worker

- Register
- Submit National ID
- Phone number
- Experience
- Browse factory jobs
- Apply
- Chat with factories

Employer

- Create company
- Post projects
- Post internships
- Post graduate jobs
- Search students
- Filter candidates
- Manage applications
- Schedule interviews

Factory

- Create hiring campaigns
- Recruit workers
- Manage applications
- Bulk hiring

Admin

- Verification
- Moderation
- Analytics
- Reports
- Dashboard
- User management

---

# Core Modules

Authentication

Student Portal

Worker Portal

Employer Portal

Factory Portal

Admin Portal

Project Management

Verification System

Messaging

Notification

Search

Subscription

AI Features

---

# Verification System

This is the heart of SkillBridge.

Workflow:

Employer creates project

↓

Student applies

↓

Employer accepts

↓

Project completed

↓

Employer verifies work

↓

Employer reviews student

↓

Permanent verification stored

Verification history must never be deleted or silently modified.

This verified history forms the user's Career Passport.

---

# AI Integration

SkillBridge does not train proprietary AI models.

Use external APIs.

Supported AI features:

- Resume Builder
- Resume Review
- Career Recommendation
- Candidate Matching

AI assists decision making.

AI never replaces verification.

---

# Security

The platform must provide:

- Secure authentication
- Role-based authorization
- HTTPS
- File validation
- Audit logs
- Rate limiting

Protect user data at all times.

---

# Performance Goals

- Mobile responsive
- Initial page load under 2 seconds
- Modular architecture
- API-first development
- Ready for scaling
- Daily backups

---

# Sprint Roadmap

Sprint 1

Authentication

- Login
- Register
- Email Verification
- Forgot Password
- Google OAuth
- Role Management

Sprint 2

Student Portal

Sprint 3

Employer Portal

Sprint 4

Project & Verification System

Sprint 5

Worker & Factory Portal

Sprint 6

AI Features

Sprint 7

Realtime Chat & Notifications

Sprint 8

Admin Dashboard

---

# Features Not Included in MVP

Do NOT build:

- Native Mobile App
- AI Interview
- AI Voice Assistant
- Video Interview
- Government Integration
- University Dashboard
- Payroll
- Attendance
- Advanced Analytics

Stay focused on delivering a stable MVP.

---

# Definition of Done

Every completed feature must:

✓ Compile successfully

✓ Pass linting

✓ Pass TypeScript checks

✓ Follow project architecture

✓ Be responsive

✓ Be secure

✓ Handle errors gracefully

✓ Include loading and empty states

✓ Follow consistent UI patterns

---

# Founder Note

SkillBridge exists to solve a trust problem, not a job listing problem.

Every completed project, employer review, verified skill, and work experience strengthens the user's Career Passport.

When making technical decisions, prioritize long-term scalability, maintainability, and trust over adding unnecessary features.

The goal is to build Cambodia's most trusted Verified Talent Ecosystem.